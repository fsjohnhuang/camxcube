use super::dto::{DeviceDto, DeviceVo};
use super::service;
use crate::state::AppState;
use axum::{
    Json,
    extract::{Form, Path, State},
    http::StatusCode,
};
use serde_json::Value;

pub async fn get_device_list(State(state): State<AppState>) -> Json<Value> {
    match service::get_device_list(&state.pool).await {
        Some((count, data)) => {
            let ret: Vec<DeviceVo> = data
                .into_iter()
                .map(|value| DeviceVo::from(value))
                .collect();

            Json(serde_json::json!({
                "total": count,
                "data": ret
            }))
        }
        None => Json(serde_json::json!({
            "total": 0,
            "data": Vec::<DeviceVo>::new()
        })),
    }
}

pub async fn create_device(
    State(state): State<AppState>,
    Json(device): Json<DeviceDto>,
) -> Result<Json<Value>, StatusCode> {
    if let Some(id) = service::add_device(&state.pool, device).await {
        Ok(Json(serde_json::json!({
            "id": id,
        })))
    } else {
        Err(StatusCode::CONFLICT)
    }
}

pub async fn sync_device(
    State(state): State<AppState>,
    Form(form): Form<DeviceDto>,
) -> Result<Json<Value>, StatusCode> {
    match service::sync_device(&state.pool, form).await {
        Some(id) => Ok(Json(serde_json::json!({
            "id": id
        }))),
        None => Err(StatusCode::BAD_REQUEST),
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
) -> Result<Json<DeviceVo>, StatusCode> {
    if let Some(value) = service::get_device(&state.pool, id).await {
        Ok(Json(DeviceVo::from(value)))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}
