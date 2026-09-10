use sqlx::FromRow;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Device {
    id: i64,
    mac: String,
    ip: String,
    name: String,
    description: String,
    status: u8,
    battery: u8,
    location: String,
}