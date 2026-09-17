use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateFileDto {
    pub device_id: i64,
    pub physical_path: String,
    pub original_name: String,
    pub mime_type: String,
}

#[derive(Debug, serde::Deserialize, Default)]
pub struct UploadQuery {
    pub mac: String,
    pub ip: String,
    pub synced_at: Option<u32>,
}
