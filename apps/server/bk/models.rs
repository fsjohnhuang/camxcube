use serde::{Deserialize, Serialize};

#[derive(Default, Deserialize, Serialize)]
pub struct DeviceInfo {
    pub ip: String,
    pub mac: String,
    pub updated_at: Option<i64>,
}