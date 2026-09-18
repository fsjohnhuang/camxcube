#include "wifi.h"

static const char *TAG = "WIFI";

#define WIFI_CONNECTED_BIT BIT0
#define WIFI_FAIL_BIT      BIT1
#define MAXIMUM_RETRY 3
#define WIFI_SSID "USER_132429"
#define WIFI_PASSWORD "87140421"

static EventGroupHandle_t s_wifi_event_group;

static uint8_t s_retry_num = 0;

static void wifi_event_handler(
    void* arg, 
    esp_event_base_t event_base, 
    int32_t event_id,
    void* event_data
) {
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
        // Connect to the real AP when Wi-Fi driver is completely activative.
        esp_wifi_connect();
    }
    else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED) {
        if (s_retry_num < MAXIMUM_RETRY) {
            // Try to reconnect
            esp_wifi_connect();
            s_retry_num++;
            ESP_LOGI(TAG, "Wi-Fi disconnected, retry to connect to the AP");
        }
        else {
            xEventGroupSetBits(s_wifi_event_group, WIFI_FAIL_BIT);
        }
    }
    else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
        /**
         * typedef struct {
         *   esp_netif_t *esp_netif;      // Network interface handle
         *   esp_netif_ip_info_t ip_info; // IP information(ip, netmask, gateway)
         *   uint8_t ip_changed;          // Whether IP has changed
         * } ip_event_got_ip_t;
         */
        ip_event_got_ip_t* event = (ip_event_got_ip_t*)event_data;
        // IP2STR/IPSTR: Macros for printing IP addresses properly.
        // `event->ip_info.ip` returns the actual value of the IP address(type: `esp_ip4_addr_t`)
        // `&event->ip_info.ip` is equivlant to `&(event->ip_info.ip)`returns the pointer to the IP address(type: `esp_ip4_addr_t*`)
        ESP_LOGI(TAG, "Got IP:" IPSTR, IP2STR(&event->ip_info.ip));
        ESP_LOGI(TAG, "Netmask:" IPSTR, IP2STR(&event->ip_info.netmask));
        ESP_LOGI(TAG, "Gateway:" IPSTR, IP2STR(&event->ip_info.gw));
		s_retry_num = 0;
        xEventGroupSetBits(s_wifi_event_group, WIFI_CONNECTED_BIT);
    }
}


esp_err_t wifi_sta_init(void) {
    // Initialize NVS in other place before calling wifi_sta_init.
    // Initialize NVS (required for Wi-Fi to store configuration)
    // esp_err_t err = nvs_flash_init();
    // if (err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND) {
    //     // erase the whole SPI flash if no space leaves or new version has been found.
    //     ESP_ERROR_CHECK(nvs_flash_erase());
    //     err = nvs_flash_init();
    // }
    // ESP_ERROR_CHECK(err);

	s_wifi_event_group = xEventGroupCreate();

    // Initialize TCP/IP stack
    ESP_ERROR_CHECK(esp_netif_init());

    // Create the default event loop required for Network and Wi-Fi
    // Otherwise, the system cannot properly manage the network stack, get the IP address and so forth.
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    esp_netif_t *netif = esp_netif_create_default_wifi_sta();
    // panic when netif is NULL(aka. a falsy value)
    assert(netif);

    // Initialize WiFi with defualt configuration.
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    esp_event_handler_instance_t instance_any_id;
    ESP_ERROR_CHECK(esp_event_handler_instance_register(
        WIFI_EVENT,
        ESP_EVENT_ANY_ID,
        &wifi_event_handler,
        NULL,
        &instance_any_id
    ));

    esp_event_handler_instance_t instance_got_ip;
    ESP_ERROR_CHECK(esp_event_handler_instance_register(
        IP_EVENT,
        IP_EVENT_STA_GOT_IP,
        &wifi_event_handler,
        NULL,
        &instance_got_ip
    ));

    // Config WiFi working in STA mode
    wifi_config_t wifi_config = {
        .sta = {
            .ssid = WIFI_SSID,
            .password = WIFI_PASSWORD
        }
    };
    /**
     * Optional
     * Completely disable the ESP32's Wi-Fi Modem-sleep power saving mode.
     * `WIFI_PS_NONE`: The Wi-Fi module never sleeps, it stays active at all times. 
     *  - Minimum receive latency - data packets are processed immediately upon arrival. 
     *  - Significantly higher power consumption - the RF module runs continuously.
     * `WIFI_PS_MIN_MODEN`: Modem-sleep: default behavior, ESP32 periodically enters a sleep state, turning off its RF(射频), PHY(物理层), and baseband(基带，简称BB) modules to save power.  Wakes up every DTIM beacon interval.
     * `WIFI_PS_MAX_MODEN`: Uses a custom, longer listen interval for better power savings.
     * 
     * Note that, Wi-Fi + BLE coexistence:
     * Even with `WIFI_PS_NONE`, Wi-Fi may not fully disable power save in ths mode.
     * It only stays active during its allocated time slots.
     */
    ESP_ERROR_CHECK(esp_wifi_set_ps(WIFI_PS_NONE));
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
    /**
     * Activate the Wi-Fi driver based on current configuration.
     * It moves the Wi-Fi subsystem from a configured, inactive state into an operational one.
     * WIFI_EVENT_STA_START/WIFI_EVENT_AP_START event is triggered when a successful call to `esp_wifi_start` is made. 
     */
    ESP_ERROR_CHECK(esp_wifi_start());

    /* Waiting until either the connection is established (WIFI_CONNECTED_BIT) or connection failed for the maximum
	 * number of re-tries (WIFI_FAIL_BIT). The bits are set by wifi_event_handler() (see above) */
	esp_err_t ret_value = ESP_OK;
	EventBits_t bits = xEventGroupWaitBits(s_wifi_event_group,
		WIFI_CONNECTED_BIT | WIFI_FAIL_BIT,
		pdFALSE,
		pdFALSE,
		portMAX_DELAY);

	/* xEventGroupWaitBits() returns the bits before the call returned, hence we can test which event actually
	 * happened. */
	if (bits & WIFI_CONNECTED_BIT) {
		ESP_LOGI(TAG, "connected to ap SSID:%s password:%s", WIFI_SSID, WIFI_PASSWORD);
	} else if (bits & WIFI_FAIL_BIT) {
		ESP_LOGI(TAG, "Failed to connect to SSID:%s, password:%s", WIFI_SSID, WIFI_PASSWORD);
		ret_value = ESP_FAIL;
	} else {
		ESP_LOGE(TAG, "UNEXPECTED EVENT");
		ret_value = ESP_FAIL;
	}

	/* The event will not be processed after unregister */
	ESP_ERROR_CHECK(esp_event_handler_instance_unregister(IP_EVENT, IP_EVENT_STA_GOT_IP, instance_got_ip));
	ESP_ERROR_CHECK(esp_event_handler_instance_unregister(WIFI_EVENT, ESP_EVENT_ANY_ID, instance_any_id));
	vEventGroupDelete(s_wifi_event_group);

    return ret_value;
}