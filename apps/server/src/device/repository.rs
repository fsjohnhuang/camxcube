use sqlx::{Pool, Sqlite};
use crate::device::models::Device;

pub async fn get_device_list(pool: &Pool<Sqlite>) -> Option<Vec<Device>> {
    sqlx::query_as::<_, Device>("SELECT id, mac, ip, name, description, status, battery, location FROM device")
        .fetch_all(pool)
        .await.ok()
}

pub async fn add_device(pool: &Pool<Sqlite>) -> Option<Vec<Device>> {
    sqlx::query_as::<_, Device>("SELECT id, mac, ip, name, description, status, battery, location FROM device")
        .fetch_all(pool)
        .await.ok()
}