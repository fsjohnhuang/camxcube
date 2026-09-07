use axum::{Router, extract::{Form, Multipart}, http::StatusCode, response::IntoResponse, routing::{get, post}};
use serde::Deserialize;
use tokio::signal;

use std::net::SocketAddr;
use std::{fs::File, io::Write};

use reqwest::Client;

async fn health_check() -> &'static str {
    "API running"
}

#[derive(Deserialize)]
pub struct HeartBeatForm {
    ip: String,
    mac: String,
}

async fn heart_beat(Form(form): Form<HeartBeatForm>)  -> &'static str {
    println!("ip: {}; mac: {}", form.ip, form.mac);

    "heart_beat"
}

async fn upload(mut multipart: Multipart) -> Result<impl IntoResponse, StatusCode> {
    while let Some(mut field) = multipart.next_field().await.map_err(|_| StatusCode::BAD_REQUEST)? {
        let name = field.name().unwrap_or("unnamed").to_string();

        match field.file_name() {
            Some(filename) => {
                let mut file = File::create(format!("./{}", filename)).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                while let Some(chunk) = field.chunk().await.map_err(|_| StatusCode::BAD_REQUEST)? {
                    file.write_all(&chunk).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?; 
                }
            },
            None => {
                let text = field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?;
                println!("name: {}, text: {}", name, text);
            }
        }
    }

    Ok(())
}

async fn take_phote() -> &'static str {
    let client = Client::new();
    let response = client.get("http://192.168.1.12:80/index?id=1&type=1&times=10").send().await.unwrap();
    ""
}


#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/api/health", get(health_check))
        .route("/api/heart_beat", post(heart_beat))
        .route("/api/upload", post(upload))
        .route("/api/phote", post(take_phote));

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