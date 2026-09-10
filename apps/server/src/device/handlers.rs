use axum::{Json, extract::State};
use reqwest::StatusCode;
use crate::{device::models::Device, state::AppState};
use crate::device::service;

pub async fn get_device_list(
    State(state): State<AppState>
) -> Result<Json<Vec<Device>>, StatusCode> {
    let records = service::get_device_list(&state.pool).await.unwrap_or(Vec::new());
    Ok(Json(records))
}