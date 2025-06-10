use std::{
    collections::BTreeMap,
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};

use axum::{
    body::Body,
    extract::{Extension, Path, Query},
    http::{StatusCode, header},
    response::Response,
};
use convex::{ConvexClient, Value};
use jwt::VerifyWithKey;
use serde::{Deserialize, Serialize};

use crate::{
    api::{
        response::{AppError, AppResult},
        util::ConvexValueExtractorExt,
    },
    core::state::App,
};

#[derive(Debug, Deserialize)]
pub struct DownloadQuery {
    pub token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileStorage {
    pub file_name: String,
    pub file_path: String,
    pub file_mime: String,
}

async fn get_file_data(
    mut client: ConvexClient,
    app: Arc<App>,
    file: String,
    query: DownloadQuery,
) -> AppResult<FileStorage> {
    let claims: BTreeMap<String, String> = query
        .token
        .verify_with_key(&app.config.jwt_private_key)
        .map_err(|_| AppError::Unauthorized("Access Denied".into(), None))?;

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let expiration = match claims.get("exp") {
        Some(exp) => exp
            .parse::<u64>()
            .map_err(|_| AppError::BadRequest("Bad request".into(), None))?,
        None => 0,
    };

    if now > expiration {
        return Err(AppError::Custom(StatusCode::GONE, "Expired".into(), None));
    }

    let file_id = claims.get("sub");

    if file_id.is_none() {
        return Err(AppError::BadRequest("Bad request".into(), None));
    }

    if *file_id.unwrap() != file {
        return Err(AppError::BadRequest("Bad request".into(), None));
    }

    let mut args = BTreeMap::new();
    args.insert(String::from("file"), Value::String(file));
    args.insert(
        String::from("token"),
        Value::String(app.config.auth_token.clone()),
    );

    let file_storage = client
        .query("files/get_file:download", args)
        .await
        .map_err(|_| AppError::Internal("Internal".into(), None))?;

    let data = match file_storage {
        convex::FunctionResult::Value(v) => {
            let extractor = v.extract();

            let file_title = extractor.get_string("file.name");
            let storage_path = extractor.get_string("file.path");
            let storage_mime = extractor.get_string("file.mime");

            if file_title.is_none() || storage_path.is_none() || storage_mime.is_none() {
                return Err(AppError::NotFound("Not found".into(), None));
            }

            FileStorage {
                file_name: file_title.unwrap(),
                file_path: storage_path.unwrap(),
                file_mime: storage_mime.unwrap(),
            }
        }
        convex::FunctionResult::ConvexError(e) => {
            return Err(AppError::DatabaseError(e.message, None));
        }
        convex::FunctionResult::ErrorMessage(msg) => {
            return Err(AppError::DatabaseError(msg, None));
        }
    };

    Ok(data)
}

pub async fn download_file(
    Extension(client): Extension<ConvexClient>,
    Extension(app): Extension<Arc<App>>,
    Path(file): Path<String>,
    Query(query): Query<DownloadQuery>,
) -> AppResult<Response> {
    let data = get_file_data(client, app.clone(), file, query).await?;

    let reader = app.fs.reader(&data.file_path).await?;
    let stat = app.fs.stat(&data.file_path).await?;
    let full_size = stat.content_length();
    let content_type = data.file_mime;

    let stream = reader.into_bytes_stream(..).await?;

    let response = Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_LENGTH, full_size)
        .header(header::CONTENT_TYPE, content_type)
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{}\"", data.file_name),
        )
        .body(Body::from_stream(stream))
        .map_err(|_| {
            AppError::Custom(
                StatusCode::INTERNAL_SERVER_ERROR,
                "There was an error downloading the file".into(),
                None,
            )
        })?;

    // TODO: Log the download

    Ok(response)
}

pub async fn stream_file(
    Extension(client): Extension<ConvexClient>,
    Extension(app): Extension<Arc<App>>,
    Path(file): Path<String>,
    Query(query): Query<DownloadQuery>,
) -> AppResult<Response> {
    let data = get_file_data(client, app.clone(), file, query).await?;

    let reader = app.fs.reader(&data.file_path).await?;
    let stat = app.fs.stat(&data.file_path).await?;
    let full_size = stat.content_length();
    let content_type = data.file_mime;

    let stream = reader.into_bytes_stream(..).await?;

    let response = Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_LENGTH, full_size)
        .header(header::CONTENT_TYPE, content_type)
        .header(
            header::CONTENT_DISPOSITION,
            format!("inline; filename=\"{}\"", data.file_name),
        )
        .body(Body::from_stream(stream))
        .map_err(|_| {
            AppError::Custom(
                StatusCode::INTERNAL_SERVER_ERROR,
                "There was an error downloading the file".into(),
                None,
            )
        })?;

    // TODO: Log the download

    Ok(response)
}
