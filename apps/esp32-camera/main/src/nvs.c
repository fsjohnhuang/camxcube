#include "nvs.h"

esp_err_t nvs_init(void) {
    // Initialize NVS (required for Wi-Fi to store configuration)
    esp_err_t err = nvs_flash_init();
    if (err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        // erase the whole SPI flash if no space leaves or new version has been found.
        err = nvs_flash_erase();
        if (err == ESP_OK) {
            err = nvs_flash_init();
        }
    }
    return err;
}