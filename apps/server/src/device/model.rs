use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct Device {
    pub id: Option<i64>,
    pub mac: String,
    pub ip: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub status: u8,
    pub battery: Option<u8>,
    pub location: Option<String>,
}
