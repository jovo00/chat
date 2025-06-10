use std::sync::Arc;

use super::config;
use super::state::App;
use crate::api::router::all_routes;
use crate::files;
use anyhow::Result;

impl App {
    pub async fn new() -> Result<Self> {
        let fs = files::get_filesystem_operator()?;

        Ok(Self {
            fs: Arc::new(fs),
            config: Arc::new(config::AppConfig::default()),
        })
    }

    pub async fn serve(self, addr: &str) -> Result<()> {
        serve_api(Arc::new(self), addr).await
    }
}

async fn serve_api(app: Arc<App>, addr: &str) -> Result<()> {
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, all_routes(app)).await?;

    Ok(())
}
