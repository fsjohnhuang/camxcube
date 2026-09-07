#ifndef SNTP_H
#define SNTP_H

#include <time.h>
#include "esp_netif_sntp.h"
#include "esp_log.h"

#ifdef _cplusplus
extern "C" {
#endif

esp_err_t ntp_init(void);
esp_err_t ntp_get_current_time(char *ts, size_t size);

#ifdef _cplusplus
}
#endif
#endif