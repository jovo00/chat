use std::{collections::BTreeMap, path::PathBuf, sync::Arc};

use axum::{
    extract::{Extension, Json, Multipart, multipart::Field},
    http::StatusCode,
};

use convex::{ConvexClient, Value};
use nanoid::nanoid;
use opendal::Writer;
use serde::{Deserialize, Serialize};

use crate::{
    api::{
        response::{AppError, AppResult},
        util::{ConvexValueExtractorExt, get_relative_pathbuf_string, pathbuf_to_string},
    },
    core::state::App,
};

#[derive(Serialize, Deserialize)]
pub struct FileGet {
    pub uploaded: bool,
    pub file: String,
}

#[derive(Debug, Default, Clone)]
pub struct FileUpload {
    pub file_name: String,
    pub file_path: PathBuf,
    pub content_type: String,
    pub root_folder: PathBuf,
    pub file_uploaded: bool,
    pub extension: String,

    filepath_string: String,
    relative_filepath_string: String,
}

impl FileUpload {
    pub fn new(storage_root_folder: &str) -> Self {
        Self {
            file_path: PathBuf::from(storage_root_folder),
            ..Default::default()
        }
    }

    pub fn set_current_path_as_root_folder(&mut self) {
        self.root_folder = self.file_path.clone();
    }

    pub fn set_file_name(&mut self, name: &str, storage_id: String) {
        self.file_name = name.to_string();

        let mut extension = match self.file_name.rfind('.') {
            Some(index) => self.file_name[index + 1..].to_string(),
            None => "".to_string(),
        };

        extension.truncate(50);

        self.extension = extension.clone();

        self.relative_filepath_string =
            get_relative_pathbuf_string(&self.root_folder, &self.file_path);

        let mut file_path = storage_id;
        if !extension.is_empty() {
            file_path.push_str(".");
            file_path.push_str(&extension);
        }

        self.file_path.push(file_path);

        self.filepath_string = pathbuf_to_string(&self.file_path);
    }

    pub fn set_content_type(&mut self, content_type: Option<&str>) {
        match content_type {
            Some(content) => self.content_type = content.to_string(),
            None => {
                self.content_type = new_mime_guess::from_path(&self.file_name)
                    .first_or_octet_stream()
                    .to_string()
            }
        };
    }

    pub fn get_file_path_str(&self) -> &str {
        &self.filepath_string
    }

    pub async fn delete_uploaded_file(&self, app: Arc<App>) -> AppResult<()> {
        app.fs.delete(self.get_file_path_str()).await?;

        Ok(())
    }
}

pub async fn upload_file(
    Extension(mut client): Extension<ConvexClient>,
    Extension(app): Extension<Arc<App>>,
    mut multipart: Multipart,
) -> AppResult<Json<FileGet>> {
    let user = client
        .query("users/user:current", BTreeMap::new())
        .await
        .map_err(|_| AppError::Internal("Internal".into(), None))?;

    let user_id = match user {
        convex::FunctionResult::Value(v) => {
            let extractor = v.extract();

            extractor.get_string("user._id")
        }
        convex::FunctionResult::ConvexError(e) => {
            return Err(AppError::DatabaseError(e.message, None));
        }
        convex::FunctionResult::ErrorMessage(msg) => {
            return Err(AppError::DatabaseError(msg, None));
        }
    };

    if let None = user_id {
        return Err(AppError::Unauthorized("Unathorized".into(), None));
    }

    let user_id = user_id.unwrap();

    let storage_id = nanoid!();

    let time = chrono::Utc::now();

    let mut file_upload = FileUpload::new(&app.config.storage_root_folder);
    file_upload.file_path.push("storage");
    file_upload.set_current_path_as_root_folder();
    file_upload.file_path.push(time.format("%Y-%m").to_string());
    file_upload.file_path.push(&user_id);

    while let Some(mut field) = multipart
        .next_field()
        .await
        .map_err(|err| (StatusCode::BAD_REQUEST, err.to_string()))?
    {
        match field.name() {
            Some("file") => {
                file_upload.set_content_type(field.content_type());
                file_upload
                    .set_file_name(field.file_name().unwrap_or("untitled"), storage_id.clone());

                app.fs.delete(file_upload.get_file_path_str()).await?;

                let mut w = app.fs.writer(file_upload.get_file_path_str()).await?;

                match write_chunks(&mut field, &mut w).await {
                    Ok(_) => {
                        w.close().await?;
                        file_upload.file_uploaded = true;
                    }
                    Err(err) => {
                        w.close().await?;
                        app.fs.delete(file_upload.get_file_path_str()).await?;
                        return Err(err);
                    }
                }
            }
            _ => {
                return Err(AppError::BadRequest("Invalid field".into(), None));
            }
        }
    }

    if !file_upload.file_uploaded {
        return Err(AppError::BadRequest("No file uploaded".into(), None));
    }

    let stat = app.fs.stat(file_upload.get_file_path_str()).await?;
    let size = stat.content_length() as i64;

    if size == 0 {
        file_upload.delete_uploaded_file(app.clone()).await?;
        return Err(AppError::BadRequest("No file uploaded".into(), None));
    }

    let mut args: BTreeMap<String, Value> = BTreeMap::new();
    args.insert("title".into(), file_upload.file_name.clone().into());
    args.insert("path".into(), file_upload.file_path.to_str().into());
    args.insert("extension".into(), file_upload.extension.clone().into());
    args.insert("mime".into(), file_upload.content_type.clone().into());
    args.insert("size".into(), Value::Int64(size));
    args.insert("uploadedBy".into(), user_id.into());
    args.insert("apiKey".into(), app.config.auth_token.clone().into());

    let result = client.mutation("files/create_file:file_upload", args).await;

    let mut file_id = String::new();

    match result {
        Ok(r) => match r {
            convex::FunctionResult::Value(v) => {
                let extractor = v.extract();

                if let Some(id) = extractor.get_string("id") {
                    file_id = id.clone();
                }
            }
            convex::FunctionResult::ConvexError(e) => {
                file_upload.delete_uploaded_file(app.clone()).await?;
                return Err(AppError::DatabaseError(e.message, None));
            }
            convex::FunctionResult::ErrorMessage(msg) => {
                file_upload.delete_uploaded_file(app.clone()).await?;
                return Err(AppError::DatabaseError(msg, None));
            }
        },
        Err(e) => {
            file_upload.delete_uploaded_file(app.clone()).await?;

            return Err(AppError::DatabaseError(e.to_string(), None));
        }
    }

    Ok(Json(FileGet {
        uploaded: true,
        file: file_id,
    }))
}

async fn write_chunks(field: &mut Field<'_>, w: &mut Writer) -> AppResult<()> {
    while let Some(chunk) = field
        .chunk()
        .await
        .map_err(|err| (StatusCode::BAD_REQUEST, err.to_string()))?
    {
        let buffer = chunk.to_vec();
        w.write(buffer).await?;
    }

    Ok(())
}
