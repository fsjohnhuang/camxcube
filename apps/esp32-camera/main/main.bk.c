// #include "sdkconfig.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "nvs.h"
#include "wifi.h"
#include "http_client.h"
#include "http_server.h"
#include "camera.h"
#include "ntp.h"

static const char *TAG = "MAIN";

typedef struct cmd_t {
	uint8_t times;
	uint8_t id;
	uint8_t type;
} cmd_t;


QueueHandle_t queueMsg = NULL;

void task_http_client(void *ptr) {
	const uint16_t ms = 1000;
	while(1) {
		struct cmd_t *cmd = NULL;
		if (xQueueReceive(queueMsg, &cmd, portMAX_DELAY) != pdPASS) {
			ESP_LOGI(TAG, "Queue is empty");
		}

		if (cmd->type == 1) {
			uint8_t times = cmd->times;
			while (times > 0) {
				times -= 1;
				ESP_LOGI(TAG, "Task: take a shot");
				camera_capture(http_client_upload);
				vTaskDelay(pdMS_TO_TICKS(200));
			}
		}

		// esp_err_t err = http_client_heart_beat();
		// if (err != ESP_OK) {
		// 	// what is esp_err_to_name_r for?
		// 	ESP_LOGE(TAG, "Fail to fire heart beat request, due to %s\n", esp_err_to_name(err));
		// }

		vTaskDelay(pdMS_TO_TICKS(ms));
	}

	/**
	 * FreeRTOS每个任务中返回是非法行为，会导致系统崩溃。
	 * (报异常 `E (2746) FreeRTOS: FreeRTOS Task "xxx" should not return, Aborting now!`)
	 * 因此只有两种选择
	 * 1. 通过死循环让任务永不结束;
	 * 2. 杀死任务本身，而不是返回。
	 */
	vTaskDelete(NULL); 
}

esp_err_t index_handler(httpd_req_t *req) {
	struct cmd_t *cmd = malloc(sizeof(cmd_t));
	cmd->id = 1;
	cmd->type = 1;
	cmd->times = 1;

	/**
	 * get query parameters
	 */
	char query_buf[256];
	char param_buf[64];
	/**
	 * ESP_ERR_NOT_FOUND - query string not found.
	 */
	esp_err_t err = httpd_req_get_url_query_str(req, query_buf, sizeof(query_buf));
	if (err == ESP_OK) {
		ESP_LOGI(TAG, "query_buf: %s", query_buf);
		/**
		 * `httpd_query_key_value` does not URL-decode the value.
		 */
		if (httpd_query_key_value(query_buf, "id", param_buf, sizeof(param_buf)) == ESP_OK) {
			cmd->id = (uint8_t)atoi(param_buf);
		}
		if (httpd_query_key_value(query_buf, "type", param_buf, sizeof(param_buf)) == ESP_OK) {
			cmd->type = (uint8_t)atoi(param_buf);
		}
		if (httpd_query_key_value(query_buf, "times", param_buf, sizeof(param_buf)) == ESP_OK) {
			cmd->times = (uint8_t)atoi(param_buf);
		}
	}
	else {
		ESP_LOGW(TAG, "query_buf error: %s", esp_err_to_name(err));
	}

	if (xQueueSend(queueMsg, (void *)&cmd, portMAX_DELAY) != pdPASS) {
		ESP_LOGI(TAG, "Queue is full");
	}

    const char html[] = "<html><body>ESP32</body></html";
    // 设置响应头（可选）
    httpd_resp_set_type(req, "text/plain");

    httpd_resp_send(req, html, strlen(html));

    return ESP_OK;
}

esp_err_t http_server_start(void) {
	httpd_handle_t server = NULL;
    esp_err_t err = http_server_init(&server);
	if (err != ESP_OK) return err;

	const httpd_uri_t index_uri = {
        .uri = "/index",
        .method = HTTP_GET,
        .handler = index_handler,
        .user_ctx = NULL
    };
	/**
	 * `ESP_ERR_INVALID_ARG` error occurs when the parameter `server` is NULL.
	 */
    err = httpd_register_uri_handler(server, &index_uri);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "URI register failed: %s", esp_err_to_name(err));
        httpd_stop(server);
        return err;
    }

	return err;
}

void app_main(void)
{
	queueMsg = xQueueCreate(10, sizeof(struct cmd_t *));
	
	ESP_LOGI(TAG, "Initializing...");

    ESP_ERROR_CHECK(nvs_init());

    ESP_ERROR_CHECK(wifi_sta_init());

	ESP_ERROR_CHECK(ntp_init());

    ESP_ERROR_CHECK(http_client_init());

	ESP_ERROR_CHECK(camera_init(FRAMESIZE_QQVGA));

	ESP_ERROR_CHECK(http_server_start());
	
	xTaskCreate(task_http_client, "task_http_client", 2048*4, NULL, 1, NULL);

    while(1) {
       vTaskDelay(pdMS_TO_TICKS(5*1000)); 
    }
}