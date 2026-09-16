use super::dto::DeviceDto;
use super::model::Device;
use sqlx::{Encode, Pool, QueryBuilder, Sqlite, Type};

pub async fn get_device_list(pool: &Pool<Sqlite>) -> Result<Vec<Device>, sqlx::Error> {
    match sqlx::query_as::<_, Device>(
        "SELECT id, mac, ip, name, description, status, battery, synced_at, created_at, updated_at, location FROM device",
    )
    .fetch_all(pool)
    .await
    {
        Ok(result) => Ok(result),
        Err(e) => {
            eprintln!("SQLx error: {:?}", e);
            Err(e)
        }
    }
}

pub async fn create_device(pool: &Pool<Sqlite>, device: &DeviceDto) -> Result<i64, sqlx::Error> {
    let mut qb = QueryBuilder::new("INSERT INTO DEVICE(mac, ip");
    if device.name.is_some() {
        qb.push(", name");
    }
    if device.description.is_some() {
        qb.push(", description");
    }
    if device.status.is_some() {
        qb.push(", status");
    }
    if device.battery.is_some() {
        qb.push(", battery");
    }
    if device.location.is_some() {
        qb.push(", location");
    }
    if device.synced_at.is_some() {
        qb.push(", synced_at");
    }
    qb.push(") VALUES(");
    qb.push_bind(&device.mac);
    qb.push(", ");
    qb.push_bind(&device.ip);
    if let Some(value) = &device.name {
        qb.push(", ");
        qb.push_bind(value);
    }
    if let Some(value) = &device.description {
        qb.push(", ");
        qb.push_bind(value);
    }
    if let Some(value) = &device.status {
        qb.push(", ");
        qb.push_bind(*value);
    }
    if let Some(value) = &device.battery {
        qb.push(", ");
        qb.push_bind(*value);
    }
    if let Some(value) = &device.location {
        qb.push(", ");
        qb.push_bind(value);
    }
    if let Some(value) = device.synced_at {
        qb.push(", ");
        qb.push_bind(value);
    }
    qb.push(")");
    match qb.build().execute(pool).await {
        Ok(result) => Ok(result.last_insert_rowid()),
        Err(e) => {
            eprintln!("SQLx error: {:?}", e);
            Err(e)
        }
    }
}

pub async fn update_device(
    pool: &Pool<Sqlite>,
    id: i64,
    device: &DeviceDto,
) -> Result<Option<i64>, sqlx::Error> {
    let mut qb = QueryBuilder::new("UPDATE device SET ip = ");
    qb.push_bind(&device.ip);

    if let Some(value) = &device.name {
        qb.push(", name = ");
        qb.push_bind(value);
    }
    if let Some(value) = &device.description {
        qb.push(", description = ");
        qb.push_bind(value);
    }
    if let Some(value) = device.status {
        qb.push(", status = ");
        qb.push_bind(value);
    }
    if let Some(value) = device.battery {
        qb.push(", battery = ");
        qb.push_bind(value);
    }
    if let Some(value) = &device.location {
        qb.push(", location = ");
        qb.push_bind(value);
    }
    if let Some(value) = device.synced_at {
        qb.push(", synced_at = ");
        qb.push_bind(value);
    }

    qb.push(" WHERE id = ");
    qb.push_bind(id);

    match qb.build().execute(pool).await {
        Ok(result) => {
            if result.rows_affected() > 0 {
                Ok(Some(id))
            } else {
                Ok(None)
            }
        }
        Err(e) => {
            eprintln!("SQLx error: {:?}", e);
            Err(e)
        }
    }
}

pub async fn delete_device(pool: &Pool<Sqlite>, id: i64) -> Result<Option<u64>, sqlx::Error> {
    match sqlx::query("update device set status = 0 where id = ?")
        .bind(id)
        .execute(pool)
        .await
    {
        Ok(result) => Ok(if result.rows_affected() == 0 {
            Some(result.rows_affected())
        } else {
            None
        }),
        Err(e) => {
            eprintln!("SQLx error: {:?}", e);
            Err(e)
        }
    }
}

pub async fn get_device(pool: &Pool<Sqlite>, id: i64) -> Result<Option<Device>, sqlx::Error> {
    match sqlx::query_as::<_, Device>(
        "SELECT id, mac, ip, name, description, status, battery, synced_at, created_at, updated_at, location FROM device where id = ?",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    {
        Ok(result) => Ok(result),
        Err(e) => {
            eprintln!("SQLx error: {:?}", e);
            Err(e)
        }
    }
}

pub async fn get_count(pool: &Pool<Sqlite>) -> Result<u64, sqlx::Error> {
    match sqlx::query_scalar("SELECT COUNT(id) FROM device where status != 0")
        .fetch_one(pool)
        .await
    {
        Ok(result) => Ok(result),
        Err(e) => {
            eprintln!("SQLx error: {:?}", e);
            Err(e)
        }
    }
}

pub async fn get_device_by_mac(pool: &Pool<Sqlite>, mac: &str) -> Result<Option<i64>, sqlx::Error> {
    match sqlx::query_scalar::<_, i64>("select id FROM device where mac = ?")
        .bind(mac)
        .fetch_optional(pool)
        .await
    {
        Ok(id) => Ok(id),
        Err(e) => {
            eprintln!("SQLx error: {:?}", e);
            Err(e)
        }
    }
}
