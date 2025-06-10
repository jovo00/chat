use std::sync::Arc;

use axum::extract::DefaultBodyLimit;
use axum::middleware::{from_fn, from_fn_with_state};
use axum::routing::{delete, post};
use axum::{Router, extract::Extension, routing::get};
use tower::ServiceBuilder;

use crate::core::state::App;

use super::handler::files::delete::delete_file;
use super::handler::{self, not_found};
use super::middleware::{auth, base, cors};

pub fn all_routes(shared_state: Arc<App>) -> Router {
    Router::new()
        // ROUTES
        .route(
            "/api/files",
            post(handler::files::upload_file).layer(DefaultBodyLimit::max(
                shared_state.config.file_upload_size_limit,
            )),
        )
        .route(
            "/api/files/presign",
            post(handler::files::presign::presign_file),
        )
        .route("/api/files", delete(delete_file))
        .route("/files/{file}/download", get(handler::files::download_file))
        .route("/files/{file}/stream", get(handler::files::stream_file))
        // FALLBACK
        .fallback(not_found::not_found)
        // MIDDLEWARE
        .layer(
            ServiceBuilder::new()
                .layer(Extension(Arc::clone(&shared_state)))
                .layer(cors::cors())
                .layer(from_fn_with_state(Arc::clone(&shared_state), auth::auth))
                .layer(from_fn(base::base)),
        )
}
