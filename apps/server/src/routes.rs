use axum::{Router, routing::{get, post}};
use crate::{handlers::*, state::AppState};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/health", get( health_check))
        .route("/heart_beat", post(heart_beat))
        // .route("/devices", get(get_device_info_list))
        .route("/upload", post(upload))
        .route("/phote", post(take_phote))
}