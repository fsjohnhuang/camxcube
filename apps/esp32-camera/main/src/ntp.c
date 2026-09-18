#include "ntp.h"

static const char *TAG = "NTP";

void time_sync_notification_cb(struct timeval *tv)
{
    ESP_LOGI(TAG, "Notification of a time synchronization event");
}

esp_err_t ntp_init(void) {
    /**
     * Single NTP server
     * esp_sntp_config_t config = ESP_NETIF_SNTP_DEFAULT_CONFIG("ntp.aliyun.com");
     * 
     * ntp.ntsc.ac.cn(中国国家授时中心) is useless.
     */
     esp_sntp_config_t config = ESP_NETIF_SNTP_DEFAULT_CONFIG("ntp.aliyun.com");
    // esp_sntp_config_t config = ESP_NETIF_SNTP_DEFAULT_CONFIG_MULTIPLE(3, 
    //     ESP_SNTP_SERVER_LIST("ntp.aliyun.com", "cn.pool.ntp.org")
    // );
// 全球通用NTP服务集群, "pool.ntp.org"
    config.sync_cb = time_sync_notification_cb;

    esp_err_t err = esp_netif_sntp_init(&config);
    if (err == ESP_OK) {
        // wait for time to be set
        int retry = 0;
        const int retry_count = 15;
        while (esp_netif_sntp_sync_wait(pdMS_TO_TICKS(2000)) == ESP_ERR_TIMEOUT && ++retry < retry_count) {
            ESP_LOGI(TAG, "Waiting for system time to be set...(%d/%d)", retry, retry_count);
        }

        if (retry >= retry_count) {
            err = ESP_FAIL;
        }
    }

    return err;
}

esp_err_t ntp_get_current_time(char *ts, size_t size) {
    time_t now = 0;
    struct tm timeinfo = {0};
    time(&now);
    setenv("TZ", "CST-8", 1);
    tzset();
    localtime_r(&now, &timeinfo);

    if (timeinfo.tm_year > (2024 - 1900)) {
        strftime(ts, size, "%Y%m%d%H%M%S", &timeinfo);
        return ESP_OK;
    }
    else {
        ESP_LOGW(TAG, "Time is not sync");
        return ESP_FAIL;
    }
}