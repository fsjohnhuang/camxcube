use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateFileDto {
    pub device_id: i64,
    pub path: String,
    pub mime_type: String,
}
