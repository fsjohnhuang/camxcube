use sqlx::{Pool, Sqlite};

use super::model::File;

pub async fn create(pool: &Pool<Sqlite>, device_id: i64, path: &str, mime_type: &str) -> Result<i64, sqlx::Error> {
    let result = sqlx::query(
        "INSERT INTO file (device_id, path, mime_type) VALUES (?, ?, ?)",
    )
    .bind(device_id)
    .bind(path)
    .bind(mime_type)
    .execute(pool)
    .await?;

    Ok(result.last_insert_rowid())
}

pub async fn get_file(pool: &Pool<Sqlite>, id: i64) -> Result<Option<File>, sqlx::Error> {
    sqlx::query_as::<_, File>(
        "SELECT id, device_id, path, mime_type, created_at FROM file WHERE id = ?",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
}

pub async fn get_file_list(pool: &Pool<Sqlite>) -> Result<Vec<File>, sqlx::Error> {
    sqlx::query_as::<_, File>(
        "SELECT id, device_id, path, mime_type, created_at FROM file",
    )
    .fetch_all(pool)
    .await
}

pub async fn get_file_count(pool: &Pool<Sqlite>) -> Result<u64, sqlx::Error> {
    sqlx::query_scalar("SELECT COUNT(id) FROM file")
        .fetch_one(pool)
        .await
}

pub async fn delete_file(pool: &Pool<Sqlite>, id: i64) -> Result<u64, sqlx::Error> {
    sqlx::query("DELETE FROM file WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map(|result| result.rows_affected())
}
