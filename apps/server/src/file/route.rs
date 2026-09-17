use axum::{
    Router,
    routing::{get, post},
};

use crate::{file::handler::*, state::AppState};

pub fn route() -> Router<AppState> {
    Router::new()
        .route("/", get(get_file_list).post(create_file))
        .route("/{id}", get(get_file).delete(delete_file))
        .route("/{id}/stream", get(get_file_stream))
        .route("/upload", post(upload))
}
