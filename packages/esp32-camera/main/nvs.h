#ifndef NVS_H
#define NVS_H

#include "esp_log.h"
#include "nvs_flash.h"

#ifdef _cplusplus
extern "C" {
#endif

esp_err_t nvs_init(void);

#ifdef _cplusplus
}
#endif
#endif