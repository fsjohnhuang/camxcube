use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct File {
    pub id: Option<i64>,
    pub device_id: i64,
    pub path: String,
    pub mime_type: String,
    pub created_at: DateTime<Utc>,
}
