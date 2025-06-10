use std::sync::Arc;

use axum::{extract::Extension, Json};
use serde::Deserialize;

use crate::{
    api::response::{AppError, AppResult},
    core::state::App,
};

#[derive(Deserialize)]
pub struct DeleteFile {
    pub path: String,
    pub token: String,
}

pub async fn delete_file(
    Extension(app): Extension<Arc<App>>,
    Json(payload): Json<DeleteFile>,
) -> AppResult<String> {
    if payload.token != app.config.auth_token {
        return Err(AppError::Unauthorized("Access denied".into(), None));
    }

    app.fs.delete(&payload.path).await?;

    Ok("success".into())
}
