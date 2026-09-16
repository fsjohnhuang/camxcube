use axum::{
    Router,
    routing::{get, post, delete},
};

use crate::{file::handler::*, state::AppState};

pub fn route() -> Router<AppState> {
    Router::new()
        .route("/", get(get_file_list).post(create))
        .route("/{id}", get(get_file).delete(delete_file))
}
