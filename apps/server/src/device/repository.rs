use super::dto::DeviceDto;
use super::model::Device;
use sqlx::{Pool, Sqlite};

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
    match sqlx::query("INSERT INTO device(mac, ip) VALUES(?, ?)")
        .bind(&device.mac)
        .bind(&device.ip)
        .execute(pool)
        .await
    {
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
    match sqlx::query("UPDATE device SET ip = ? WHERE id = ?")
        .bind(&device.ip)
        .bind(id)
        .execute(pool)
        .await
    {
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
