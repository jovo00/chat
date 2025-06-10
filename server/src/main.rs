mod api;
mod core;
mod files;
mod types;

use anyhow::Result;
use core::App;
use log::info;

use simplelog::*;

#[tokio::main]
async fn main() -> Result<()> {
    dotenv::dotenv().ok();

    CombinedLogger::init(vec![TermLogger::new(
        LevelFilter::Info,
        simplelog::Config::default(),
        TerminalMode::Mixed,
        ColorChoice::Auto,
    )])
    .unwrap();

    let address = "127.0.0.1:5555";
    info!("Starting server at {}", address);

    let app = App::new().await?;
    app.serve(address).await?;

    Ok(())
}
