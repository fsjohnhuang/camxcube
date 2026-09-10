use sqlx::{Pool, Sqlite};

use crate::device::repository;
use crate::device::models::Device;

pub async fn get_device_list(pool: &Pool<Sqlite>) -> Option<Vec<Device>> {
    repository::get_device_list(pool).await
}