#include "http_server.h"

static const char *TAG = "HTTP_SERVER";

// static esp_err_t index_handler(httpd_req_t *req) {
//     const char html[] = "<html><body>ESP32</body></html";
//     // 设置响应头（可选）
//     httpd_resp_set_type(req, "text/plain");

//     httpd_resp_send(req, html, strlen(html));

//     return ESP_OK;
// }

// static esp_err_t stream_handler(httpd_req_t *req) {
//     // Response Content-Type
//     httpd_resp_set_type(req, "multippart/x-mixed-repace;boundary=frame");
//     httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

//     static const char *boundary = "\r\n--frame\r\nContent-Type:image/jpeg\r\nContent-Length:%u\r\n\r\n";
//     char hdr_buf[64];

//     camera_fb_t *fb = NULL;
//     while (1) {
//         fb = esp_camera_fb_get();
//         if (!fb) {
//             ESP_LOGE(TAG, "Fail to get frame from camera\n");
//             return ESP_FAIL;
//         }

//         snprintf(hdr_buf, strlen(hdr_buf), boundary, fb->len);
//         httpd_resp_send_chunk(req, hdr_buf, strlen(hdr_buf));
//         httpd_resp_send_chunk(req, (const char *)fb->buf, fb->len);

//         esp_camera_fb_return(fb);
//         fb = NULL;

//         vTaskDelay(psMS_TO_TICKS(60));
//     }

//     if (fb) {
//         esp_camera_fb_return(fb);
//     }

//     return ESP_OK;
// }


// static const httpd_uri_t stream_uri = {
//     .uri = "/stream",
//     .method = HTTP_GET,
//     .handler = stream_handler
// };

esp_err_t http_server_init(httpd_handle_t *ptr_server) {
    if (*ptr_server) {
        httpd_stop(*ptr_server);
    }

    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    config.lru_purge_enable = true; // 自动清理空闲连接
    config.stack_size = 4096; // 若httpd_start返回值为ESP_ERR_NO_MEM，则表示内存不足需调整为8192。
    config.max_open_sockets = 3;
    esp_err_t err = httpd_start(ptr_server, &config);
    if (err == ESP_ERR_NO_MEM) {
        config.stack_size = 8192;
        err = httpd_start(ptr_server, &config);
        if (err != ESP_OK) {
            return err;
        }
    }
    else if (err == ESP_ERR_INVALID_ARG) {
        ESP_LOGI(TAG, "配置参数无效");
        return err;
    }
    else if (err == ESP_FAIL) {
        ESP_LOGI(TAG, "socket创建失败，检查WiFi是否已连接");
        return err;
    }
    else if (err != ESP_OK) {
        return err;
    }

    // const httpd_uri_t index_uri = {
    //     .uri = "/index",
    //     .method = HTTP_GET,
    //     .handler = index_handler,
    //     .user_ctx = NULL
    // };
    // err = httpd_register_uri_handler(server, &index_uri);
    // if (err != ESP_OK) {
    //     ESP_LOGE(TAG, "URI register failed: %s", esp_err_to_name(err));
    //     httpd_stop(server);
    //     return err;
    // }
    // httpd_register_uri_handler(server, &stream_uri);

    ESP_LOGI(TAG, "Server started on port: %d", config.server_port);
    
    // *server = srv;
    return err;
}