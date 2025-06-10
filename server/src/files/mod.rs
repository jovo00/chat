use std::env;

use anyhow::Result;

use opendal::{layers::LoggingLayer, services::Fs, services::S3, Operator};

struct S3Config {
    access_key: String,
    secret_key: String,
    endpoint: String,
    bucket: String,
    region: String,
}

struct LocalConfig {
    dir: String,
}

fn get_s3_config() -> Option<S3Config> {
    let access_key = env::var("S3_ACCESS_KEY").ok()?;
    let secret_key = env::var("S3_SECRET_KEY").ok()?;
    let endpoint = env::var("S3_ENDPOINT").ok()?;
    let bucket = env::var("S3_BUCKET").ok()?;
    let region = env::var("S3_REGION").ok()?;

    Some(S3Config {
        access_key,
        secret_key,
        endpoint,
        bucket,
        region,
    })
}

fn get_local_config() -> Option<LocalConfig> {
    let dir = env::var("LOCAL_DIR").ok()?;

    Some(LocalConfig { dir })
}

pub fn get_filesystem_operator() -> Result<Operator> {
    let provider = env::var("STORAGE_PROVIDER").ok();

    if provider.is_none() {
        return Err(anyhow::anyhow!("STORAGE_PROVIDER must be set"));
    }

    let provider = provider.unwrap();

    let operator: Option<Operator> = match provider.as_str() {
        "s3" => {
            let config = get_s3_config().expect("S3 config must be set");

            let builder = S3::default()
                .access_key_id(&config.access_key)
                .secret_access_key(&config.secret_key)
                .endpoint(&config.endpoint)
                .bucket(&config.bucket)
                .region(&config.region);

            let op = Operator::new(builder)?
                .layer(LoggingLayer::default())
                .finish();

            Some(op)
        }
        "local" => {
            let config = get_local_config()
                .expect("Storage Provider must be set. Either use S3 or Local FS");

            let dir = config.dir;
            let op = Operator::new(Fs::default().root(&dir))?
                .layer(LoggingLayer::default())
                .finish();

            Some(op)
        }
        _ => {
            return Err(anyhow::anyhow!(
                "Invalid STORAGE_PROVIDER. Either use 's3' or 'local'"
            ));
        }
    };

    let operator = operator.expect("Storage Provider must be set. Either use S3 or Local FS");
    Ok(operator)
}
