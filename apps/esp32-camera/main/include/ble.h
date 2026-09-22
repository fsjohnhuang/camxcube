#ifndef BLE_H
#define BLE_H

#include "esp_err.h"

/**
 * @brief Initialize the BLE server.
 *
 * Starts the NimBLE host stack and creates a BLE server with
 * a custom service for receiving commands.
 *
 * @return ESP_OK on success, error code on failure
 */
esp_err_t ble_server_init(void);

#endif // BLE_H
