use sqlx::{Pool, Sqlite};

use super::model::File;

pub async fn create_file(
    pool: &Pool<Sqlite>,
    device_id: i64,
    path: &str,
    mime_type: &str,
) -> Result<i64, sqlx::Error> {
    crate::file::repository::create(pool, device_id, path, mime_type).await
}

pub async fn get_file(pool: &Pool<Sqlite>, id: i64) -> Result<Option<File>, sqlx::Error> {
    crate::file::repository::get_file(pool, id).await
}

pub async fn get_file_list(pool: &Pool<Sqlite>) -> Result<Vec<File>, sqlx::Error> {
    crate::file::repository::get_file_list(pool).await
}

pub async fn delete_file(pool: &Pool<Sqlite>, id: i64) -> Result<u64, sqlx::Error> {
    crate::file::repository::delete_file(pool, id).await
}
