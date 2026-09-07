#ifndef HTTP_SERVER_H
#define HTTP_SERVER_H

#include "esp_log.h"
#include "esp_http_server.h"

#ifdef _cplusplus
extern "C" {
#endif

esp_err_t http_server_init(httpd_handle_t *ptr_server);

#ifdef _cplusplus
}
#endif
#endif