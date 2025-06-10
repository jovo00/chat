use axum::http::{HeaderName, HeaderValue, Method};
use tower_http::cors::{AllowHeaders, AllowOrigin, CorsLayer};

pub fn cors() -> CorsLayer {
    CorsLayer::new()
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::DELETE,
            Method::PATCH,
            Method::PUT,
            Method::OPTIONS,
        ])
        .allow_headers(AllowHeaders::list(vec![
            HeaderName::from_static("accept"),
            HeaderName::from_static("authorization"),
            HeaderName::from_static("content-type"),
            HeaderName::from_static("user-agent"),
        ]))
        .allow_credentials(true)
        .allow_origin(AllowOrigin::exact(HeaderValue::from_static(
            "http://localhost:3000",
        )))
}
