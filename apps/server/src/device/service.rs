use super::dto::DeviceDto;
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

pub async fn add_device(pool: &Pool<Sqlite>, device: DeviceDto) -> Option<i64> {
    repository::create_device(pool, &device)
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

pub async fn sync_device(pool: &Pool<Sqlite>, device: DeviceDto) -> Option<i64> {
    match repository::get_device_by_mac(pool, &device.mac)
        .await
        .unwrap_or(None)
    {
        Some(id) => repository::update_device(pool, id, &device)
            .await
            .ok()
            .unwrap(),
        None => repository::create_device(pool, &device).await.ok(),
    }
}
