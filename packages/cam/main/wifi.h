#ifndef WIFI_H
#define WIFI_H

#include "esp_log.h"
// #include "nvs_flash.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "freertos/event_groups.h"

#ifdef _cplusplus
extern "C" {
#endif

esp_err_t wifi_sta_init(void);

#ifdef _cplusplus
}
#endif
#endif