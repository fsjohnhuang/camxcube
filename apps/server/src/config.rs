use std::env;
use dotenvy::dotenv;

pub struct Config {
    pub image_folder: String,
    pub database_url: String,
}

impl Config {
    pub fn from_env() -> Result<Self, Box<dyn std::error::Error>> {
        dotenv().ok();// error situation is ignored

        Ok(Config { 
            image_folder: env::var("IMAGE_FOLDER")
                .unwrap_or("./images".to_string()),
            database_url: env::var("DATABASE_URL")    
                .unwrap_or("sqlite:./database.db".to_string()),
        })
    }
}