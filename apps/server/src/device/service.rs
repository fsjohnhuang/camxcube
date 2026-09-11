use sqlx::{Pool, Sqlite};

use crate::device::repository;
use crate::device::models::Device;

pub async fn get_device_list(pool: &Pool<Sqlite>) -> Option<Vec<Device>> {
    repository::get_device_list(pool).await
}

pub async fn add_device(pool: &Pool<Sqlite>, device: Device) -> Option<i64> {
    repository::add_device(pool, &device).await
}