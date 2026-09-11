use super::dto::CreateDevice;
use super::model::Device;
use super::repository;
use sqlx::{Pool, Sqlite};

pub async fn get_device_list(pool: &Pool<Sqlite>) -> Option<(u64, Vec<Device>)> {
    match repository::get_count(pool).await.ok() {
        Some(count) => repository::get_device_list(pool)
            .await
            .map(|value| (count, value))
            .ok(),
        None => None,
    }
}

pub async fn add_device(pool: &Pool<Sqlite>, device: CreateDevice) -> Option<i64> {
    repository::add_device(pool, &device)
        .await
        .map(Some)
        .unwrap_or(None)
}

pub async fn delete_device(pool: &Pool<Sqlite>, id: i64) -> Option<u64> {
    repository::delete_device(pool, id).await.unwrap_or(None)
}

pub async fn get_device(pool: &Pool<Sqlite>, id: i64) -> Option<Device> {
    repository::get_device(pool, id).await.unwrap_or(None)
}
