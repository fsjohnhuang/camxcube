use sqlx::{Pool, Sqlite};

use super::model::File;

pub async fn create_file(
    pool: &Pool<Sqlite>,
    device_id: i64,
    physical_path: &str,
    original_name: &str,
    mime_type: &str,
) -> Result<i64, sqlx::Error> {
    crate::file::repository::create(pool, device_id, physical_path, original_name, mime_type).await
}

pub async fn get_file(pool: &Pool<Sqlite>, id: i64) -> Result<Option<File>, sqlx::Error> {
    crate::file::repository::get_file(pool, id).await
}

pub async fn get_file_list(pool: &Pool<Sqlite>) -> Result<Vec<File>, sqlx::Error> {
    crate::file::repository::get_file_list(pool).await
}

pub async fn delete_file(pool: &Pool<Sqlite>, id: i64) -> Result<u64, sqlx::Error> {
    match super::repository::get_file(pool, id).await? {
        Some(file) => {
            tokio::fs::remove_file(file.physical_path)
                .await
                .unwrap_or(());

            super::repository::delete_file(pool, id).await
        }
        None => Ok(0),
    }
}
