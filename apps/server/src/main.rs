mod routes;
mod handlers;
mod models;
mod state;
mod config;
mod device;

use std::net::SocketAddr;
use axum::{ Router };
use tokio::signal;
use axum_vite::{ViteConfig, spa_router};


#[tokio::main]
async fn main() {
    let vite_config = ViteConfig::from_env(axum_vite::embedded_dir!("$CARGO_MANIFEST_DIR/../web/dist"));

    let app = Router::new()
        .merge(spa_router(vite_config))
        .nest("/api", routes::routes())
        .nest("/api/device", device::routes())
        .with_state(state::state());
    

    // Bind to all interfaces on specified port
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    println!("Local http://{}", addr);

    match getifs::best_local_ipv4_addrs().unwrap().first() {
        Some(active_addr) => println!(
            "Network http://{}:{}", 
            active_addr.addr(), 
            addr.port()
        ),
        None => ()
    }

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
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