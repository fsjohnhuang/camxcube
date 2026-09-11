use axum::{Json, extract, response::IntoResponse};
use reqwest::StatusCode;
use crate::{device::models::Device, state::AppState};
use crate::device::service;

pub async fn get_device_list(
    extract::State(state): extract::State<AppState>
) -> Result<Json<Vec<Device>>, StatusCode> {
    let records = service::get_device_list(&state.pool).await.unwrap_or(Vec::new());
    Ok(Json(records))
}

pub async fn add_device(
    extract::State(state): extract::State<AppState>,
    extract::Json(device): extract::Json<Device>
) -> Result<i64, StatusCode> {
    service::add_device(&state.pool, device).await.map_or(Err(StatusCode::INTERNAL_SERVER_ERROR), |v| Ok(v))
}

pub async fn delete_device(extract::Path(id): extract::Path<u64>) -> impl IntoResponse {
    println!("{}", id);
    "123"
}

pub async fn get_device(extract::Path(id): extract::Path<u64>) -> impl IntoResponse {
    println!("get_device {}", id);
    "123"
}