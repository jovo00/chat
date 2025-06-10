use axum::{
    extract::Request,
    http::{self},
    middleware::Next,
    response::IntoResponse,
};

use crate::api::response::AppResult;

pub async fn base(req: Request, next: Next) -> AppResult<impl IntoResponse> {
    let mut res = next.run(req).await.into_response();
    res.headers_mut()
        .insert(http::header::SERVER, http::HeaderValue::from_static("ai"));
    Ok(res)
}
