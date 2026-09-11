use axum::{Router, routing::get};

use crate::{device::handler::*, state::AppState};

pub fn route() -> Router<AppState> {
    Router::new()
        .route("/", get(get_device_list).post(add_device))
        .route("/{id}", get(get_device).delete(delete_device))
}
