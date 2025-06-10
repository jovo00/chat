use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use log::{debug, error, info};
use serde::{Deserialize, Serialize};

#[derive(Debug)]
pub enum AppError {
    // Application specific errors
    NotFound(String, Option<serde_json::Value>),
    InvalidInput(String, Option<serde_json::Value>),
    Unauthorized(String, Option<serde_json::Value>),
    Forbidden(String, Option<serde_json::Value>),

    // API Errors
    BadRequest(String, Option<serde_json::Value>),
    Conflict(String, Option<serde_json::Value>),

    // External service errors
    DatabaseError(String, Option<serde_json::Value>),
    StorageError(String, Option<serde_json::Value>),

    // Catch-all errors
    Internal(String, Option<serde_json::Value>),
    Custom(StatusCode, String, Option<serde_json::Value>),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status_code, error_message, data) = match self {
            Self::NotFound(msg, data) => (StatusCode::NOT_FOUND, msg, data),
            Self::InvalidInput(msg, data) => (StatusCode::BAD_REQUEST, msg, data),
            Self::Unauthorized(msg, data) => (StatusCode::UNAUTHORIZED, msg, data),
            Self::Forbidden(msg, data) => (StatusCode::FORBIDDEN, msg, data),
            Self::BadRequest(msg, data) => (StatusCode::BAD_REQUEST, msg, data),
            Self::Conflict(msg, data) => (StatusCode::CONFLICT, msg, data),
            Self::DatabaseError(msg, data) => (StatusCode::INTERNAL_SERVER_ERROR, msg, data),
            Self::StorageError(msg, data) => (StatusCode::INTERNAL_SERVER_ERROR, msg, data),
            Self::Internal(msg, data) => (StatusCode::INTERNAL_SERVER_ERROR, msg, data),
            Self::Custom(code, msg, data) => (code, msg, data),
        };

        let error_log = match data {
            Some(data) => format!(
                "Error {} \"{}\": {:?}",
                &status_code.as_u16(),
                &error_message,
                &data
            ),
            None => format!("Error {} \"{}\"", &status_code.as_u16(), &error_message),
        };

        if status_code.is_server_error() {
            info!("{}", error_log);
        } else {
            debug!("{}", error_log);
        }

        (status_code, error_message).into_response()
    }
}

impl From<(StatusCode, String)> for AppError {
    fn from((status, message): (StatusCode, String)) -> Self {
        AppError::Custom(status, message, None)
    }
}

impl From<opendal::Error> for AppError {
    fn from(err: opendal::Error) -> Self {
        error!("Storage Error: {}", err);
        AppError::StorageError(err.to_string(), None)
    }
}

impl From<String> for AppError {
    fn from(error: String) -> Self {
        AppError::Internal(error, None)
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        error!("Serde Error: {}", err);
        AppError::Internal("Internal Server Error".into(), None)
    }
}

pub type AppResult<T> = std::result::Result<T, AppError>;

#[derive(Debug, Serialize, Deserialize)]
pub struct ItemList<T> {
    pub is_last: bool,
    pub items: Vec<T>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Item<T> {
    pub item: T,
}
