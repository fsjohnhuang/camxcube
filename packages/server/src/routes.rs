use axum::{Router, routing::{get, post}};
use crate::handlers::{*};

pub fn routes() -> Router {
    Router::new()
        .route("/api/health", get( health_check))
        .route("/api/heart_beat", post(heart_beat))
        .route("/api/upload", post(upload))
        .route("/api/phote", post(take_phote))
}