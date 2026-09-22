#include "ble.h"
#include "esp_log.h"
#include "nimble/nimble_port.h"
#include "nimble/nimble_port_freertos.h"
#include "host/ble_hs.h"
#include "host/util/util.h"
#include "services/gap/ble_svc_gap.h"
#include "services/gatt/ble_svc_gatt.h"

static const char *TAG = "BLE";

#define DEVICE_NAME "ESP32-CAM"
#define BLE_SVC_CMD_UUID 0x1815

static uint8_t ble_addr_type;
static uint16_t ble_conn_handle;

static int ble_gap_event(struct ble_gap_event *event, void *arg) {
    switch (event->type) {
    case BLE_GAP_EVENT_CONNECT:
        ESP_LOGI(TAG, "BLE GAP EVENT CONNECT");
        ble_conn_handle = event->connect.conn_handle;
        break;
    case BLE_GAP_EVENT_DISCONNECT:
        ESP_LOGI(TAG, "BLE GAP EVENT DISCONNECT");
        ble_conn_handle = BLE_HS_CONN_HANDLE_NONE;
        break;
    default:
        break;
    }
    return 0;
}

static void ble_on_sync(void) {
    int rc = ble_hs_id_infer_copy(0, &ble_addr_type);
    assert(rc == 0);

    struct ble_gap_adv_params adv_params;
    struct ble_hs_adv_fields adv_fields = {0};
    uint8_t uuid128[16];

    adv_fields.flags = BLE_HS_ADV_F_DISC_GEN | BLE_HS_ADV_F_BREDR_UNSUP;
    adv_fields.tx_pwr_lvl = BLE_HS_ADV_TX_PWR_LVL_AUTO;

    ble_uuid_to128(BLE_SVC_CMD_UUID, uuid128);
    adv_fields.uuids128 = (ble_uuid128_t *)uuid128;
    adv_fields.num_uuids128 = 1;

    rc = ble_gap_adv_set_fields(&adv_fields);
    assert(rc == 0);

    memset(&adv_params, 0, sizeof(adv_params));
    adv_params.conn_mode = BLE_GAP_CONN_MODE_UND;
    adv_params.disc_mode = BLE_GAP_DISC_MODE_GEN;

    rc = ble_gap_adv_start(ble_addr_type, NULL, BLE_HS_FOREVER, &adv_params,
                           ble_gap_event, NULL);
    assert(rc == 0);
}

static void ble_host_task(void *param) {
    nimble_port_run();
}

esp_err_t ble_server_init(void) {
    int rc;

    ESP_ERROR_CHECK(nimble_port_init());

    ble_svc_gap_init();
    ble_svc_gatt_init();

    ble_hs_cfg.sync_cb = ble_on_sync;

    rc = ble_hs_start();
    if (rc != 0) {
        ESP_LOGE(TAG, "BLE host start failed: %d", rc);
        return ESP_FAIL;
    }

    xTaskCreate(ble_host_task, "ble_host_task", 4096, NULL, 5, NULL);

    ESP_LOGI(TAG, "BLE server initialized");
    return ESP_OK;
}
