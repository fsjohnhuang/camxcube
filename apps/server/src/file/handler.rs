use std::{fs::File, io::Write};

use axum::{
    Json,
    extract::{Multipart, Path, Query, State},
    http::StatusCode,
};
use serde_json::Value;

use crate::state::AppState;

pub async fn create_file(
    State(state): State<AppState>,
    Json(dto): Json<super::dto::CreateFileDto>,
) -> Result<Json<Value>, StatusCode> {
    let id = super::service::create_file(&state.pool, dto.device_id, &dto.path, &dto.mime_type)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(serde_json::json!({
        "id": id,
    })))
}

pub async fn upload(
    State(state): State<AppState>,
    Query(mac): Query<String>,
    Query(ip): Query<String>,
    Query(synced_at): Query<u32>,
    mut multipart: Multipart,
) -> Result<Json<Value>, StatusCode> {
    match super::super::device::service::sync_device(
        &state.pool,
        super::super::device::dto::CreateDeviceDto {
            mac: mac,
            ip: ip,
            synced_at: Some(synced_at),
            ..Default::default()
        },
    )
    .await
    {
        Some(id) => {
            while let Some(mut field) = multipart
                .next_field()
                .await
                .map_err(|_| StatusCode::BAD_REQUEST)?
            {
                let name = field.name().unwrap_or("unnamed").to_string();

                match field.file_name() {
                    Some(filename) => {
                        let mut file =
                            File::create(format!("{}/{}", state.config.image_folder, filename))
                                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                        while let Some(chunk) =
                            field.chunk().await.map_err(|_| StatusCode::BAD_REQUEST)?
                        {
                            file.write_all(&chunk)
                                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                        }
                    }
                    None => {
                        let text = field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?;
                        println!("name: {}, text: {}", name, text);
                    }
                }
            }
            Ok(Json(serde_json::json!({})))
        }
        None => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_file(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<Value>, StatusCode> {
    match super::service::get_file(&state.pool, id).await {
        Ok(Some(file)) => Ok(Json(serde_json::json!({
            "id": file.id,
            "device_id": file.device_id,
            "path": file.path,
            "mime_type": file.mime_type,
            "created_at": file.created_at,
        }))),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_file_list(State(state): State<AppState>) -> Json<Value> {
    match super::service::get_file_list(&state.pool).await {
        Ok(files) => {
            let data: Vec<Value> = files
                .into_iter()
                .map(|f| {
                    serde_json::json!({
                        "id": f.id,
                        "device_id": f.device_id,
                        "path": f.path,
                        "mime_type": f.mime_type,
                        "created_at": f.created_at,
                    })
                })
                .collect();
            Json(serde_json::json!({
                "total": data.len(),
                "data": data,
            }))
        }
        Err(_) => Json(serde_json::json!({
            "total": 0,
            "data": Vec::<Value>::new(),
        })),
    }
}

pub async fn delete_file(State(state): State<AppState>, Path(id): Path<i64>) -> StatusCode {
    match super::service::delete_file(&state.pool, id).await {
        Ok(0) => StatusCode::NOT_FOUND,
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}
