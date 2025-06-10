use axum::Json;
use serde_json::Value;

use crate::api::response::{AppError, AppResult};

pub async fn not_found() -> AppResult<Json<Value>> {
    return Err(AppError::NotFound("Not found".into(), None));
}
