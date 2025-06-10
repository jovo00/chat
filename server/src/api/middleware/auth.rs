use axum::{
    extract::{Request, State},
    middleware::Next,
    response::IntoResponse,
};
use convex::ConvexClient;
use std::sync::Arc;

use crate::{
    api::response::{AppError, AppResult},
    core::state::App,
};

pub async fn auth(
    State(state): State<Arc<App>>,
    mut req: Request,
    next: Next,
) -> AppResult<impl IntoResponse> {
    let mut client = ConvexClient::new(&state.config.convex_url)
        .await
        .map_err(|_| AppError::Unauthorized("Internal Database connection error".into(), None))?;

    let token = req.headers().get("authorization");

    match token {
        Some(value) => {
            client
                .set_auth(Some(value.to_str().unwrap().to_string()))
                .await;
        }
        None => {}
    }

    req.extensions_mut().insert(client);

    return Ok(next.run(req).await);
}
