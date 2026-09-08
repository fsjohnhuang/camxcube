use crate::{models::*, state::AppState};
use std::{fs::File, io::Write};
use axum::{Json, extract::{Form, Multipart, State}, http::StatusCode, response::IntoResponse};
use reqwest::Client;

pub async fn health_check() -> &'static str {
    "API running"
}

pub async fn heart_beat(
    State(state): State<AppState>,
    Form(mut form): Form<DeviceInfo>
) -> Result<impl IntoResponse, StatusCode> {
    println!("ip: {}; mac: {}", form.ip, form.mac);

    let mut list = state.device_info_list.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let now = chrono::Utc::now().timestamp_millis();
    // delete expired items
    let mut deleting_index = Vec::<usize>::new();
    for (index, item) in list.iter_mut().enumerate() {
        if item.mac == form.mac {
            item.updated_at = Some(now);
        }
        else {
            match item.updated_at {
                Some(updated_at) => {
                    if now - updated_at > 5 * 1000 {
                        deleting_index.push(index);
                    }
                },
                None => {
                    deleting_index.push(index);
                }
            }
        }
    }
    for i in deleting_index.into_iter() {
        list.swap_remove(i);
    }
    

    form.updated_at = Some(chrono::Utc::now().timestamp_millis());
    list.push(form);

    Ok(())
}

pub async fn get_device_info_list(State(state): State<AppState>) -> Result<impl IntoResponse, StatusCode> {
    // let list = vec![1, 2, 3];
    let mut list = state.device_info_list.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let now = chrono::Utc::now().timestamp_millis();
    // delete expired items
    let mut deleting_index = Vec::<usize>::new();
    for (index, item) in list.iter_mut().enumerate() {
        match item.updated_at {
            Some(updated_at) => {
                if now - updated_at > 5 * 1000 {
                    deleting_index.push(index);
                }
            },
            None => {
                deleting_index.push(index);
            }
        }
    }
    for i in deleting_index.into_iter() {
        list.swap_remove(i);
    }

    let mut res = Vec::new();
    for item in list.iter() {
        res.push(DeviceInfo {
            ip: String::from(&item.ip),
            mac: String::from(&item.mac),
            updated_at: item.updated_at
        });
    }

    Ok(Json(res))
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
    let _response = client.get("http://192.168.1.12:80/index?id=1&type=1&times=10").send().await.unwrap();
    ""
}