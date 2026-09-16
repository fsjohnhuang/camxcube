use axum::{
    Router,
    routing::{get, post, put},
};

use crate::{device::handler::*, state::AppState};

pub fn route() -> Router<AppState> {
    Router::new()
        .route("/", get(get_device_list).post(create_device))
        .route("/sync", post(sync_device))
        .route("/{id}", get(get_device).put(update_device).delete(delete_device))
}
