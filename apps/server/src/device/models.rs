use sqlx::FromRow;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Default, FromRow)]
pub struct Device {
    id: Option<i64>,
    mac: Option<String>,
    ip: Option<String>,
    name: Option<String>,
    description: Option<String>,
    status: Option<u8>,
    battery: Option<u8>,
    location: Option<String>,
}