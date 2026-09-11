use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct CreateDevice {
    pub mac: String,
    pub ip: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub status: Option<u8>,
    pub battery: Option<u8>,
    pub location: Option<String>,
}

#[derive(Debug, Serialize, Default)]
pub struct DeviceResponse {
    pub id: i64,
    pub mac: String,
    pub ip: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub status: u8,
    pub battery: Option<u8>,
    pub location: Option<String>,
}
