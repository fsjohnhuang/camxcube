mod config;
mod state;

mod device;
mod file;

use axum::{
    Router,
    http::{HeaderValue, Method, header},
};
use axum_vite::{ViteConfig, spa_router};
use sqlx::{Sqlite, migrate::MigrateDatabase, sqlite::SqlitePoolOptions};
use std::net::SocketAddr;
use tokio::signal;
use tower_http::cors::CorsLayer;

use crate::config::Config;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let vite_config =
        ViteConfig::from_env(axum_vite::embedded_dir!("$CARGO_MANIFEST_DIR/../web/dist"));

    let config = Config::from_env().unwrap();

    Sqlite::database_exists(&config.database_url)
        .await
        .expect("Database is not found");
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await?;

    let cors = CorsLayer::new()
        //Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
        .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap())
        //The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true' when the request's credentials mode is 'include'.
        .allow_credentials(true)
        //Invalid CORS configuration: Cannot combine `Access-Control-Allow-Credentials: true` with `Access-Control-Allow-Methods: *`
        .allow_methods([Method::GET, Method::POST, Method::DELETE, Method::PUT])
        //Invalid CORS configuration: Cannot combine `Access-Control-Allow-Credentials: true` with `Access-Control-Allow-Headers: *`
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION]);

    let app = Router::new()
        .merge(spa_router(vite_config))
        .nest("/api/devices", device::route())
        .nest("/api/files", file::route())
        .with_state(state::state(config, pool))
        .layer(cors);

    // Bind to all interfaces on specified port
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    println!("Local http://{}", addr);

    match getifs::best_local_ipv4_addrs().unwrap().first() {
        Some(active_addr) => println!("Network http://{}:{}", active_addr.addr(), addr.port()),
        None => (),
    }

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();

    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c().await.expect("Failed to listen for Ctrl+C");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("Failed to listen for SIGTERM")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("Shutting down gracefully...");
}
