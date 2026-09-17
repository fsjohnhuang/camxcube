use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::model::Device;

#[derive(Debug, Deserialize, Default)]
pub struct CreateDeviceDto {
    pub mac: String,
    pub ip: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub status: Option<u8>,
    pub battery: Option<u8>,
    pub location: Option<String>,
    pub synced_at: Option<u32>, // ms
}

#[derive(Debug, Deserialize, Default)]
pub struct UpdateDeviceDto {
    pub mac: Option<String>,
    pub ip: Option<String>,
    pub name: Option<String>,
    pub description: Option<String>,
    pub status: Option<u8>,
    pub battery: Option<u8>,
    pub location: Option<String>,
    pub synced_at: Option<u32>, // ms
}

impl From<CreateDeviceDto> for UpdateDeviceDto {
    fn from(value: CreateDeviceDto) -> Self {
        UpdateDeviceDto {
            mac: Some(value.mac),
            ip: Some(value.ip),
            name: value.name,
            description: value.description,
            status: value.status,
            battery: value.battery,
            location: value.location,
            synced_at: value.synced_at,
        }
    }
}

#[derive(Debug, Serialize, Default)]
pub struct DeviceVo {
    pub id: i64,
    pub mac: String,
    pub ip: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub status: u8,
    pub battery: Option<u8>,
    pub location: Option<String>,
    pub synced_at: Option<u32>, // ms
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl From<Device> for DeviceVo {
    fn from(value: Device) -> Self {
        DeviceVo {
            id: value.id.unwrap(),
            mac: value.mac,
            ip: value.ip,
            status: value.status,
            description: value.description,
            name: value.name,
            location: value.location,
            created_at: value.created_at,
            updated_at: value.updated_at,
            synced_at: value.synced_at,
            battery: value.battery,
        }
    }
}
