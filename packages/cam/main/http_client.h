#ifndef HTTP_CLIENT_H
#define HTTP_CLIENT_H

#include "esp_log.h"
#include "esp_http_client.h"

#include "esp_mac.h"
#include "esp_netif.h"
#include "esp_wifi.h"

#include "esp_camera.h"
#include "ntp.h"

#ifdef _cplusplus
extern "C" {
#endif

extern esp_http_client_handle_t client;

esp_err_t http_client_init(void);
esp_err_t http_client_heart_beat(void);
esp_err_t http_client_upload(camera_fb_t *fb);

#ifdef _cplusplus
}
#endif
#endif