use super::dto::{CreateDevice, DeviceResponse};
use super::service;
use crate::state::AppState;
use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use serde_json::Value;

pub async fn get_device_list(State(state): State<AppState>) -> Json<Value> {
    // match service::get_device_list(&state.pool).await {
    //     Some((count, data)) => Json(serde_json::json!({
    //         "total": count,
    //         "data": data.into_iter().map(|v| DeviceResponse {
    //             mac: v.mac,
    //             ip: v.ip
    //         })
    //     })),
    //     None => Json(serde_json::json!({
    //         "total": 0,
    //         "data": Vec::<DeviceResponse>::new()
    //     })),
    // }
    Json(serde_json::json!({
        "total": 0,
        "data": Vec::<DeviceResponse>::new()
    }))
}

pub async fn add_device(
    State(state): State<AppState>,
    Json(device): Json<CreateDevice>,
) -> Result<Json<Value>, StatusCode> {
    if let Some(id) = service::add_device(&state.pool, device).await {
        Ok(Json(serde_json::json!({
            "id": id,
        })))
    } else {
        Err(StatusCode::CONFLICT)
    }
}

pub async fn delete_device(State(state): State<AppState>, Path(id): Path<i64>) -> StatusCode {
    if let Some(value) = service::delete_device(&state.pool, id).await {
        if value == 0 {
            StatusCode::NOT_FOUND
        } else {
            StatusCode::OK
        }
    } else {
        StatusCode::INTERNAL_SERVER_ERROR
    }
}

pub async fn get_device(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<DeviceResponse>, StatusCode> {
    // if let Some(value) = service::get_device(&state.pool, id).await {
    //     Ok(Json(value))
    // } else {
    Err(StatusCode::NOT_FOUND)
    // }
}
