use std::sync::{Arc, Mutex};
use crate::models::DeviceInfo;

/**
 * Arc实现多线程共享所有权
 * Mutex保证数据互斥访问，若读多写少则可用RwLock效率更高
 */
type SharedList<T> = Arc<Mutex<Vec<T>>>;

#[derive(Clone)]
pub struct AppState {
    pub device_info_list: SharedList<DeviceInfo>,
}

pub fn state() -> AppState {
    AppState {
        device_info_list: Arc::new(Mutex::new(Vec::new()))
    }
}