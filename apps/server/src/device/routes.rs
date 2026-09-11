use axum::{Router, routing::get};

use crate::{device::handlers::*, state::AppState};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", get(get_device_list).post(add_device))
        .route("/{id}", get(get_device) .delete(delete_device))
}