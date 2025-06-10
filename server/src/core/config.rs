use hmac::{Hmac, Mac};
use sha2::Sha256;
use std::{env, fs};

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub file_upload_size_limit: usize,

    pub storage_root_folder: String,

    pub auth_token: String,
    pub convex_url: String,
    pub jwt_private_key: Hmac<Sha256>,
}

impl Default for AppConfig {
    fn default() -> Self {
        let private_key = fs::read("./private.key").unwrap();
        let jwt_private_key: Hmac<Sha256> = Hmac::new_from_slice(&private_key).unwrap();

        Self {
            file_upload_size_limit: 1024 * 1024 * 1024 * 25, // 25MB

            storage_root_folder: String::from("stream"),

            auth_token: env::var("CONVEX_AUTH_TOKEN").ok().unwrap(),
            convex_url: env::var("CONVEX_BACKEND_URL").ok().unwrap(),
            jwt_private_key,
        }
    }
}
