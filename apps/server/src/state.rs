use std::sync::{Arc, Mutex};
use sqlx::Pool;
use sqlx::Sqlite;

use crate::{config::Config, models::DeviceInfo};

/**
 * Arc实现多线程共享所有权
 * Mutex保证数据互斥访问，若读多写少则可用RwLock效率更高
 */
type SharedList<T> = Arc<Mutex<Vec<T>>>;

#[derive(Clone)]
pub struct AppState {
    pub device_info_list: SharedList<DeviceInfo>,
    pub config: Arc<Config>,
    pub pool: Arc<Pool<Sqlite>>,
}

pub fn state(config: Config, pool: Pool<Sqlite>) -> AppState {
    AppState {
        device_info_list: Arc::new(Mutex::new(Vec::new())),
        config: Arc::new(config),
        pool: Arc::new(pool)
    }
}