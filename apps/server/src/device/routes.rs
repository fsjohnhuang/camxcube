use axum::{Router, routing::get};

use crate::{device::handlers::get_device_list, state::AppState};


pub fn routes() -> Router<AppState> {
    Router::new().route("/", get(get_device_list))
}