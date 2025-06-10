use std::{
    collections::BTreeMap,
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};

use axum::extract::{Extension, Json};

use convex::{ConvexClient, Value};
use jwt::SignWithKey;
use serde::{Deserialize, Serialize};

use crate::{
    api::{
        response::{AppError, AppResult},
        util::ConvexValueExtractorExt,
    },
    core::state::App,
};

#[derive(Serialize, Deserialize)]
pub struct Presign {
    pub file: String,
}

#[derive(Serialize, Deserialize)]
pub struct PresignResponse {
    pub token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileStorage {
    pub file_id: String,
    pub file_title: String,
    pub file_size: i64,
    pub file_path: String,
    pub file_mime: String,
}

pub async fn presign_file(
    Extension(mut client): Extension<ConvexClient>,
    Extension(app): Extension<Arc<App>>,
    Json(payload): Json<Presign>,
) -> AppResult<Json<PresignResponse>> {
    let mut args = BTreeMap::new();
    args.insert(String::from("file"), Value::String(payload.file));

    let file_storage = client
        .query("files/get_file:one", args)
        .await
        .map_err(|_| AppError::Internal("Internal".into(), None))?;

    let data = match file_storage {
        convex::FunctionResult::Value(v) => {
            let extractor = v.extract();

            let file_id = extractor.get_string("file._id");
            let file_title = extractor.get_string("file.name");
            let file_size = extractor.get_i64("file.size");
            let file_path = extractor.get_string("file.path");
            let file_mime = extractor.get_string("file.mime");

            if file_id.is_none()
                || file_title.is_none()
                || file_id.is_none()
                || file_size.is_none()
                || file_path.is_none()
                || file_mime.is_none()
            {
                return Err(AppError::NotFound("Not found".into(), None));
            }

            FileStorage {
                file_id: file_id.unwrap(),
                file_title: file_title.unwrap(),
                file_size: file_size.unwrap(),
                file_path: file_path.unwrap(),
                file_mime: file_mime.unwrap(),
            }
        }
        convex::FunctionResult::ConvexError(e) => {
            return Err(AppError::DatabaseError(e.message, None));
        }
        convex::FunctionResult::ErrorMessage(msg) => {
            return Err(AppError::DatabaseError(msg, None));
        }
    };

    let expiry = 3600; // 1h

    let mut claims = BTreeMap::new();
    let expiration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        + expiry;

    claims.insert("sub", data.file_id);
    claims.insert("exp", format!("{}", expiration));

    let token = claims.sign_with_key(&app.config.jwt_private_key).unwrap();

    Ok(Json(PresignResponse { token }))
}
