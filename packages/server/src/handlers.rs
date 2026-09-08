use std::{fs::File, io::Write};
use serde::Deserialize;
use axum::{extract::{Form, Multipart}, http::StatusCode, response::IntoResponse};

use reqwest::Client;

pub async fn health_check() -> &'static str {
    "API running"
}

#[derive(Deserialize)]
pub struct HeartBeatForm {
    ip: String,
    mac: String,
}

pub async fn heart_beat(Form(form): Form<HeartBeatForm>)  -> &'static str {
    println!("ip: {}; mac: {}", form.ip, form.mac);

    "heart_beat"
}

pub async fn upload(mut multipart: Multipart) -> Result<impl IntoResponse, StatusCode> {
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

pub async fn take_phote() -> &'static str {
    let client = Client::new();
    let response = client.get("http://192.168.1.12:80/index?id=1&type=1&times=10").send().await.unwrap();
    ""
}