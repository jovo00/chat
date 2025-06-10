use std::sync::Arc;

use opendal::Operator;

use super::config;

pub struct App {
    pub fs: Arc<Operator>,
    pub config: Arc<config::AppConfig>,
}
