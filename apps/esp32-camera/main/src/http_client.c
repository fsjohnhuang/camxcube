#include "http_client.h"

static const char *TAG = "HTTP_CLIENT";

static const char *SERVER_HOST = "http://192.168.1.10:3000";

static const uint8_t IP_MAX_L = 16;
static const uint8_t MAC_MAX_LEN = 18;

esp_http_client_handle_t client = NULL;
esp_err_t http_client_init(void) {
    if (client) return ESP_FAIL;
    
    esp_http_client_config_t config = {
        .url = SERVER_HOST,
    };
    client = esp_http_client_init(&config);
    return client ? ESP_OK : ESP_FAIL;
}

esp_err_t http_client_heart_beat(void) {
    if (!client) return ESP_FAIL;

    char *url;
    const char PATH[] = "/api/heart_beat";
    asprintf(&url, "%s%s", SERVER_HOST, PATH);

    esp_http_client_set_url(client, url);
    esp_http_client_set_method(client, HTTP_METHOD_POST);
    esp_http_client_set_timeout_ms(client, 5000);

    // Get the local IP address
    esp_netif_ip_info_t ip_info;
    ESP_ERROR_CHECK(esp_netif_get_ip_info(esp_netif_get_handle_from_ifkey("WIFI_STA_DEF"), &ip_info));
    char ip_str[IP_MAX_L];
    snprintf(ip_str, sizeof(ip_str), IPSTR, IP2STR(&ip_info.ip));
    
    // Get station mac address
    uint8_t sta_mac[6] = {0};
    esp_wifi_get_mac(WIFI_IF_STA, sta_mac);
    char mac_str[MAC_MAX_LEN];
    snprintf(mac_str, sizeof(mac_str), MACSTR, MAC2STR(sta_mac));
    ESP_LOGI(TAG, "%s", mac_str);

    /**
     * - application/x-www-form-urlencoded
     *   - The default encoding
     *   - Data Format: key1=value1&key2=value2
     *   - Form data is encoded as name/value pairs, with spaces converted to `+` or `%20`, and special characters percent-encoded.
     *   - CURL: curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "username=johndoe&password=mypassword" https://api.example.com/login
     * - text/plain
     *   - Data Format: Raw text
     *   - Neither Spaces nor special characters is encoded.
     *   - Newlines are preserved.
     *   - CURL: curl -X POST -H "Content-Type: text/plain" -d "Hello, this is a plain text message" https://api.example.com/endpoint
     */
    char *post_field;
    asprintf(&post_field, "ip=%s&mac=%s", ip_str, mac_str);
    ESP_LOGI(TAG, "post_data: %s, %d, %d", post_field, sizeof(post_field), strlen(post_field));
    /**
     * 若post_field不为空，那么调用esp_http_client_set_post_field后，会自动设置Content-Type为application/x-www-form-urlencoded。
     * 若要设置其它Content-Type则需要在esp_http_client_set_post_field后调用如esp_http_client_set_header(client, "Content-Type", "text/plain")设置。
     * 另外，还会自动设置Content-Length。
     */
    esp_http_client_set_post_field(client, post_field, strlen(post_field));

    esp_err_t err = esp_http_client_perform(client);
    // Must free the post field after request.
    free(post_field);
    free(url);
    if (err == ESP_OK) {
        ESP_LOGI(TAG, "HTTP Status=%d\n", esp_http_client_get_status_code(client));
    }
    else {
        ESP_LOGE(TAG, "HTTP perform fail: %s\n", esp_err_to_name(err));
    }

    esp_http_client_close(client);

    return ESP_OK;
}

/**
 * REQUEST HEADER:
 * Content-Type: multipart/form-data; boundary=${boundary}
 * Content-Length: ${the length of request body: multiple (part header + part content)s + last boundary}
 * 
 * REQUEST BODY:
 * \r\n--${boundary}\r\n
 * Content-Disposition: form-data; name="image"; filename="filename_xxxx.jpeg"\r\n
 * Content-Type: image/jpeg\r\n\r\n
 * ${image binary}
 * \r\n--${boundary}\r\n
 * Content-Disposition: form-data; name="text"\r\n
 * ${text} 
 * \r\n--${boundary}--\r\n
 * 
 * PART HEADER:
 * \r\n--${boundary}\r\n
 * Content-Disposition: form-data; name="image"; filename="filename_xxxx.jpeg"\r\n
 * Content-Type: image/jpeg\r\n\r\n
 * 
 * PART CONTENT:
 * ${image binary} or ${text}
 * 
 * RULES:
 * - There must be a `--` before boundary.
 * - The length of boundary must not greater than 70 characters.
 */
esp_err_t http_client_upload(camera_fb_t *fb) {
    if (!client || fb == NULL) return ESP_FAIL;

    char *url;
    const char PATH[] = "/api/upload";
    asprintf(&url, "%s%s", SERVER_HOST, PATH);
    ESP_LOGI(TAG, "URL: %s\n", url);

    esp_http_client_set_url(client, url);
    esp_http_client_set_method(client, HTTP_METHOD_POST);
    esp_http_client_set_timeout_ms(client, 5000);

    const char boundary[] = "esp32cam_bound";
    // Part Header 
    char *filename = NULL;
    char ts[15];
	esp_err_t err = ntp_get_current_time(ts, sizeof(ts));
	if (err == ESP_OK) {
        filename = ts;
	}
    else {
        filename = "cam";
    }
    char part_header[256];
    int header_len = snprintf(
        part_header, 
        sizeof(part_header), 
        "\r\n--%s\r\n" 
        "Content-Disposition: form-data; name=\"file\"; filename=\"%s.jpeg\"\r\n"
        "Content-Type: image/jpeg\r\n\r\n",
        boundary,
        filename
    );

    // Final/Last Boundary
    char final_boundary[64];
    int ending_len = snprintf(final_boundary, sizeof(final_boundary), "\r\n--%s--\r\n", boundary);

    // Content-Length Header
    int total_len = header_len + fb->len + ending_len;
    char content_length[32];
    snprintf(content_length, sizeof(content_length), "%d", total_len);
    esp_http_client_set_header(client, "Content-Length", content_length);

    // Content-Type Header
    char content_type[256];
    snprintf(content_type, sizeof(content_type), "multipart/form-data; boundary=%s", boundary);

    // Config Request Header
    esp_http_client_set_header(client, "Content-Type", content_type);
    esp_http_client_set_header(client, "Content-Length", content_length);

    /**
     * @param {int} total_len - the value of Content-Length. 
     * The setting -1 represents enabling HTTP/1.1 `Transfer-Encoding: chunked`. 
     * The request body format is different from current totally.
     */
    ESP_ERROR_CHECK(esp_http_client_open(client, total_len));

    // Write Part Header
    int ret = esp_http_client_write(client, part_header, strlen(part_header));
    if (ret < 0) {
        ESP_LOGE(TAG, "Fail to write part header");
    }

    // // Write from PSRAM directly
    ret = esp_http_client_write(client, (char *)fb->buf, fb->len);
    if (ret < 0) {
        ESP_LOGE(TAG, "Fail to write part content");
    }

    // Write Last Boundary
    ret = esp_http_client_write(client, final_boundary, strlen(final_boundary));
    if (ret < 0) {
        ESP_LOGE(TAG, "Fail to last boundary");
    }
    /**
     * @returns {int64_t} response content length.
     */
    esp_http_client_fetch_headers(client);
    ESP_LOGI(TAG, "HTTP Status=%d\n", esp_http_client_get_status_code(client));
    free(url);

    esp_http_client_close(client);

    return ESP_OK;
}
