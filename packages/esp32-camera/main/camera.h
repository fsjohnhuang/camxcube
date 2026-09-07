#ifndef CAMERA_H
#define CAMERA_H

#include "esp_log.h"
#include "esp_camera.h"

#define CONFIG_BOARD_ESP32S3_WROOM_FREENOVE (1) 
#include "camera_pin.h"

#ifdef _cplusplus
extern "C" {
#endif

typedef esp_err_t (*camera_capture_handler_t)(camera_fb_t*);

esp_err_t camera_init(int framesize);
esp_err_t camera_capture(esp_err_t (*handler)(camera_fb_t*));

#ifdef _cplusplus
}
#endif
#endif