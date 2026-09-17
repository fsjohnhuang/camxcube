use std::path;
use tokio::{fs::File, io::AsyncWriteExt};
use tokio_util::io::ReaderStream;

use axum::{
    Json,
    body::Body,
    extract::{Multipart, Path, Query, State},
    http::{StatusCode, header},
    response::Response,
};
use serde_json::Value;

use crate::state::AppState;

pub async fn create_file(
    State(state): State<AppState>,
    Json(dto): Json<super::dto::CreateFileDto>,
) -> Result<Json<Value>, StatusCode> {
    let id = super::service::create_file(
        &state.pool,
        dto.device_id,
        &dto.physical_path,
        &dto.original_name,
        &dto.mime_type,
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(serde_json::json!({
        "id": id,
    })))
}

pub async fn upload(
    State(state): State<AppState>,
    Query(query): Query<super::dto::UploadQuery>,
    mut multipart: Multipart,
) -> Result<Json<Value>, StatusCode> {
    match super::super::device::service::sync_device(
        &state.pool,
        super::super::device::dto::CreateDeviceDto {
            mac: query.mac,
            ip: query.ip,
            synced_at: query.synced_at,
            ..Default::default()
        },
    )
    .await
    {
        Some(device_id) => {
            let mut file_ids = Vec::<i64>::new();
            while let Some(mut field) = multipart
                .next_field()
                .await
                .map_err(|_| StatusCode::BAD_REQUEST)?
            {
                let name = field.name().unwrap_or("unnamed").to_string();
                match field.file_name() {
                    Some(filename) => {
                        let filename = filename.to_string();
                        let ext = path::Path::new(&filename)
                            .extension()
                            .map_or("", |v| v.to_str().unwrap_or(""));
                        let now_utc = chrono::Utc::now();
                        let name = now_utc.format("%Y%m%d").to_string();

                        let path_buf = path::absolute(if ext != "" {
                            format!("{}/{}.{}", state.config.image_folder, name, ext)
                        } else {
                            format!("{}/{}", state.config.image_folder, name)
                        })
                        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

                        let mime = mime_guess::from_path(&path_buf)
                            .first_or_octet_stream()
                            .to_string();

                        let abs = path_buf.to_str().ok_or(StatusCode::INTERNAL_SERVER_ERROR)?;

                        let mut file = File::create(abs)
                            .await
                            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

                        while let Some(chunk) =
                            field.chunk().await.map_err(|_| StatusCode::BAD_REQUEST)?
                        {
                            file.write_all(&chunk)
                                .await
                                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                        }

                        match super::service::create_file(
                            &state.pool,
                            device_id,
                            abs,
                            &filename,
                            &mime,
                        )
                        .await
                        {
                            Ok(file_id) => file_ids.push(file_id),
                            Err(e) => {
                                eprintln!("{}", e);

                                return Err(StatusCode::INTERNAL_SERVER_ERROR);
                            }
                        };
                    }
                    None => {
                        let text = field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?;
                        println!("name: {}, text: {}", name, text);
                    }
                }
            }

            Ok(Json(serde_json::json!({
                "ids": file_ids
            })))
        }
        None => {
            print!("{}", "c");
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
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
            "physical_path": file.physical_path,
            "original_name": file.original_name,
            "mime_type": file.mime_type,
            "created_at": file.created_at,
        }))),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_file_stream(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Response, StatusCode> {
    match super::service::get_file(&state.pool, id).await {
        Ok(Some(file)) => {
            let file = File::open(file.physical_path)
                .await
                .map_err(|_| StatusCode::NOT_FOUND)?;

            let stream = ReaderStream::new(file);
            let body = Body::from_stream(stream);

            Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, "image/jpeg")
                .body(body)
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
        }
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
                        "physical_path": f.physical_path,
                        "original_name": f.original_name,
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
