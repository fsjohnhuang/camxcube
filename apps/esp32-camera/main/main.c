#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "nvs.h"
#include "esp_bt.h"              // 蓝牙控制器底层 API
#include "esp_bt_main.h"         // Bluedroid 协议栈初始化
#include "esp_gap_ble_api.h"     // GAP 层：广播、扫描、连接
#include "esp_gatts_api.h"       // GATTS 层：服务、特征值、描述符
#include "esp_gatt_common_api.h" // GATT 通用 API（如设置 MTU）
#include "cJSON.h"

static const char *TAG = "BLE_EXAMPLE"; // 日志标签

/* ============================================================
 * 自定义 UUID
 * ============================================================ */
static const uint16_t SERVICE_UUID = 0x00FF; // 自定义服务 UUID
static const uint16_t CHAR_RX_UUID = 0xFF01; // 手机写入数据的特征值
static const uint16_t CHAR_TX_UUID = 0xFF02; // ESP32-S3 通知数据的特征值
static const uint16_t CHAR_CFG_UUID = 0xFF03; // Wi-Fi 配置特征值（读当前配置 / 写入新配置）

/* ============================================================
 * 属性表索引
 * 属性表是一个数组，每个元素对应一个属性（服务/特征声明/特征值/描述符）。
 * 用枚举定义索引，方便代码中按名字访问 handle_table[]。
 * ============================================================ */
enum
{
    IDX_SVC,          // 服务声明
    IDX_CHAR_RX_DECL, // RX 特征声明
    IDX_CHAR_RX_VAL,  // RX 特征值（手机写入）
    IDX_CHAR_TX_DECL, // TX 特征声明
    IDX_CHAR_TX_VAL,  // TX 特征值（ESP32-S3 通知）
    IDX_CHAR_TX_CFG,  // TX 的 CCC 描述符（控制通知开关）
    IDX_CHAR_CFG_DECL, // Wi-Fi 配置特征声明
    IDX_CHAR_CFG_VAL,  // Wi-Fi 配置特征值（手机读写）
    IDX_NB,           // 属性总数
};

/* ============================================================
 * 全局状态变量
 * ============================================================ */
static uint16_t handle_table[IDX_NB];             // 保存每个属性在协议栈中的句柄
static esp_gatt_if_t gatts_if = ESP_GATT_IF_NONE; // GATT 接口号，注册后由协议栈分配
static uint16_t conn_id = 0;                      // 当前连接 ID，0 表示未连接
static bool notify_enabled = false;               // 手机是否已开启通知订阅

// 通知特征值的本地缓存
static uint8_t tx_value[20] = {0};
static uint8_t tx_value_len = 0;

/* ============================================================
 * 属性表基础 UUID
 * 这些是蓝牙规范中固定的 UUID，用变量定义以便取地址。
 * ============================================================ */
static const uint16_t primary_service_uuid = ESP_GATT_UUID_PRI_SERVICE;                // 0x2800
static const uint16_t character_declaration_uuid = ESP_GATT_UUID_CHAR_DECLARE;         // 0x2803
static const uint16_t character_client_config_uuid = ESP_GATT_UUID_CHAR_CLIENT_CONFIG; // 0x2902

// 特征属性：RX 可写，TX 支持通知，CFG 可读可写
static const uint8_t char_prop_write = ESP_GATT_CHAR_PROP_BIT_WRITE;   // 0x08
static const uint8_t char_prop_notify = ESP_GATT_CHAR_PROP_BIT_NOTIFY; // 0x10
static const uint8_t char_prop_read_write = ESP_GATT_CHAR_PROP_BIT_READ | ESP_GATT_CHAR_PROP_BIT_WRITE;

// 特征值初始数据
static uint8_t rx_value[500] = {0};         // RX 特征值的缓冲区
static uint8_t ccc_value[2] = {0x00, 0x00}; // CCC 默认值：通知关闭
static uint8_t cfg_value[256] = {0};        // CFG 特征值的缓冲区（JSON 配置）

/* ============================================================
 * GATT 属性表
 * 这是整个 BLE 服务的核心定义。每个条目描述一个属性的：
 *   - 响应方式（ESP_GATT_AUTO_RSP 表示协议栈自动回复读/写请求）
 *   - UUID 长度和内容
 *   - 访问权限（读/写）
 *   - 值长度和初始值
 * ============================================================ */
static const esp_gatts_attr_db_t gatt_db[IDX_NB] = {
    // ---- 服务声明 (0x2800) ----
    [IDX_SVC] = {
        {ESP_GATT_AUTO_RSP}, {
                                 ESP_UUID_LEN_16, (uint8_t *)&primary_service_uuid, // UUID: 0x2800
                                 ESP_GATT_PERM_READ,                                // 权限：可读
                                 sizeof(uint16_t), sizeof(SERVICE_UUID),            // 值长度
                                 (uint8_t *)&SERVICE_UUID                           // 服务 UUID 值
                             }},
    // ---- RX 特征声明 (0x2803) ----
    // 声明这是一个特征，属性为 Write
    [IDX_CHAR_RX_DECL] = {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ, sizeof(uint8_t), sizeof(char_prop_write), (uint8_t *)&char_prop_write}},
    // ---- RX 特征值 ----
    // 手机通过写入这个特征值向 ESP32-S3 发送数据
    [IDX_CHAR_RX_VAL] = {{ESP_GATT_AUTO_RSP}, {
                                                  ESP_UUID_LEN_16, (uint8_t *)&CHAR_RX_UUID, // UUID: 0xFF01
                                                  ESP_GATT_PERM_WRITE,                       // 权限：可写
                                                  sizeof(rx_value), 0, rx_value              // 最大长度 500，初始长度 0
                                              }},
    // ---- TX 特征声明 (0x2803) ----
    // 声明这是一个特征，属性为 Notify
    [IDX_CHAR_TX_DECL] = {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ, sizeof(uint8_t), sizeof(char_prop_notify), (uint8_t *)&char_prop_notify}},
    // ---- TX 特征值 ----
    // ESP32-S3 通过这个特征值向手机推送通知
    [IDX_CHAR_TX_VAL] = {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&CHAR_TX_UUID, // UUID: 0xFF02
                                               ESP_GATT_PERM_READ,                        // 权限：可读
                                               sizeof(tx_value), sizeof(tx_value), tx_value}},
    // ---- CCC 描述符 (0x2902) ----
    // 手机通过写入这个描述符来开启/关闭通知
    // 0x0001 = 开启通知, 0x0000 = 关闭
    [IDX_CHAR_TX_CFG] = {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_client_config_uuid,
                                               ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE, // 可读可写
                                               sizeof(uint16_t), sizeof(ccc_value), ccc_value}},
    // ---- Wi-Fi 配置特征声明 (0x2803) ----
    // 声明这是一个特征，属性为 Read | Write
    [IDX_CHAR_CFG_DECL] = {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ, sizeof(uint8_t), sizeof(char_prop_read_write), (uint8_t *)&char_prop_read_write}},
    // ---- Wi-Fi 配置特征值 ----
    // 由应用自己读写（ESP_GATT_RSP_BY_APP）：读时返回 NVS 中的 JSON，写时保存到 NVS
    [IDX_CHAR_CFG_VAL] = {{ESP_GATT_RSP_BY_APP}, {
                                                 ESP_UUID_LEN_16, (uint8_t *)&CHAR_CFG_UUID, // UUID: 0xFF03
                                                 ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,    // 权限：可读可写
                                                 sizeof(cfg_value), 0, cfg_value             // 最大长度 128，初始长度 0
                                             }},
};

/* ============================================================
 * Wi-Fi 配置（NVS 存储）
 * 配置保存在 NVS 中，手机可以通过 BLE 读取/修改。
 * ============================================================ */
#define WIFI_CFG_NAMESPACE "wifi_cfg"
#define WIFI_CFG_KEY_SSID "ssid"
#define WIFI_CFG_KEY_PASS "pass"

// 读取已保存的 Wi-Fi 配置；未保存过时两个缓冲区保持为空字符串
static esp_err_t wifi_cfg_load(char *ssid, size_t ssid_len, char *pass, size_t pass_len)
{
    if (ssid == NULL || pass == NULL || ssid_len == 0 || pass_len == 0)
    {
        return ESP_ERR_INVALID_ARG;
    }
    ssid[0] = '\0';
    pass[0] = '\0';

    nvs_handle_t handle;
    esp_err_t err = nvs_open(WIFI_CFG_NAMESPACE, NVS_READONLY, &handle);
    if (err != ESP_OK)
    {
        return err;
    }

    size_t len = ssid_len;
    err = nvs_get_str(handle, WIFI_CFG_KEY_SSID, ssid, &len);
    if (err == ESP_OK)
    {
        len = pass_len;
        err = nvs_get_str(handle, WIFI_CFG_KEY_PASS, pass, &len);
    }
    if (err != ESP_OK)
    {
        // 读取失败（例如还没保存过配置），返回空配置
        ssid[0] = '\0';
        pass[0] = '\0';
    }
    nvs_close(handle);
    return err;
}

// 保存 Wi-Fi 配置到 NVS
static esp_err_t wifi_cfg_save(const char *ssid, const char *pass)
{
    nvs_handle_t handle;
    esp_err_t err = nvs_open(WIFI_CFG_NAMESPACE, NVS_READWRITE, &handle);
    if (err != ESP_OK)
    {
        return err;
    }

    err = nvs_set_str(handle, WIFI_CFG_KEY_SSID, ssid);
    if (err == ESP_OK)
    {
        err = nvs_set_str(handle, WIFI_CFG_KEY_PASS, pass);
    }
    if (err == ESP_OK)
    {
        err = nvs_commit(handle);
    }
    nvs_close(handle);
    return err;
}

/* ============================================================
 * GAP 广播数据
 * 格式：长度 + 类型 + 数据
 *   0x02 0x01 0x06  → Flags: LE General Discoverable, BR/EDR Not Supported
 *   0x09 0x09 ...   → Complete Local Name: "ESP_CAM"
 * ============================================================ */
static uint8_t adv_data[] = {
    0x02, 0x01, 0x06,
    0x08, 0x09, 'E', 'S', 'P', '_', 'C', 'A', 'M'};

// 广播参数
static esp_ble_adv_params_t adv_params = {
    .adv_int_min = 0x20,      // 最小广播间隔 (20ms)
    .adv_int_max = 0x40,      // 最大广播间隔 (40ms)
    .adv_type = ADV_TYPE_IND, // 可连接的非定向广播
    .own_addr_type = BLE_ADDR_TYPE_PUBLIC,
    .channel_map = ADV_CHNL_ALL,                            // 使用所有 3 个广播信道
    .adv_filter_policy = ADV_FILTER_ALLOW_SCAN_ANY_CON_ANY, // 允许任何人扫描/连接
};

/* ============================================================
 * 发送通知数据
 * 先更新本地特征值缓存，再通过协议栈发送 Notify。
 * need_confirm = false 表示 Notify（无确认），true 则为 Indicate（有确认）。
 * ============================================================ */
static void send_notify_data(const uint8_t *data, uint16_t len)
{
    if (!notify_enabled || gatts_if == ESP_GATT_IF_NONE)
        return; // 未订阅或未连接则直接返回

    // 更新本地特征值（保持本地与协议栈数据一致）
    esp_ble_gatts_set_attr_value(handle_table[IDX_CHAR_TX_VAL], len, data);

    // 发送通知给手机
    esp_ble_gatts_send_indicate(gatts_if, conn_id,
                                handle_table[IDX_CHAR_TX_VAL],
                                len, (uint8_t *)data, false);
}

/* ============================================================
 * 通知发送任务
 * 每秒向手机推送一条 "Count: N" 消息，用于演示 Notify 功能。
 * ============================================================ */
static void notify_task(void *arg)
{
    uint32_t counter = 0;
    while (1)
    {
        if (notify_enabled && conn_id != 0)
        {
            char msg[64];
            int len = snprintf(msg, sizeof(msg), "Count: %lu", counter++);
            send_notify_data((uint8_t *)msg, len);
            ESP_LOGI(TAG, "Notified: %s", msg);
        }
        vTaskDelay(pdMS_TO_TICKS(1000)); // 延时 1 秒
    }
}

/* ============================================================
 * GATTS 事件回调
 * 处理服务注册、属性表创建、连接、断开、写入、MTU 更新等事件。
 * ============================================================ */
static void gatts_event_handler(esp_gatts_cb_event_t event,
                                esp_gatt_if_t gatts_if_param,
                                esp_ble_gatts_cb_param_t *param)
{
    switch (event)
    {
    // ---- 应用注册完成 ----
    case ESP_GATTS_REG_EVT:
        ESP_LOGI(TAG, "REGISTER_APP_EVT");
        gatts_if = gatts_if_param;                                         // 保存接口号
        esp_ble_gap_set_device_name("ESP_CAM");                            // 设置设备名，和广播名称是独立存在的
        esp_ble_gap_config_adv_data_raw(adv_data, sizeof(adv_data));       // 配置广播数据
        esp_ble_gatts_create_attr_tab(gatt_db, gatts_if_param, IDX_NB, 0); // 创建属性表
        break;

    // ---- 属性表创建完成 ----
    case ESP_GATTS_CREAT_ATTR_TAB_EVT:
        ESP_LOGI(TAG, "ATTR_TAB_CREATED, handles=%d", param->add_attr_tab.num_handle);
        memcpy(handle_table, param->add_attr_tab.handles, sizeof(handle_table)); // 保存句柄
        esp_ble_gatts_start_service(handle_table[IDX_SVC]);                      // 启动服务
        break;

    // ---- 服务启动完成 ----
    case ESP_GATTS_START_EVT:
        ESP_LOGI(TAG, "SERVICE_STARTED");
        esp_ble_gap_start_advertising(&adv_params); // 开始广播
        break;

    // ---- 手机连接 ----
    case ESP_GATTS_CONNECT_EVT:
        ESP_LOGI(TAG, "CLIENT_CONNECTED, conn_id=%d", param->connect.conn_id);
        conn_id = param->connect.conn_id; // 保存连接 ID
        esp_ble_gatt_set_local_mtu(200);  // 请求 MTU 200，提升传输效率
        break;

    // ---- 手机断开连接 ----
    case ESP_GATTS_DISCONNECT_EVT:
        ESP_LOGI(TAG, "CLIENT_DISCONNECTED");
        notify_enabled = false; // 重置通知状态
        conn_id = 0;
        esp_ble_gap_start_advertising(&adv_params); // 重新开始广播，等待下次连接
        break;

    // ---- 手机读取特征值 ----
    case ESP_GATTS_READ_EVT:
    {
        uint16_t handle = param->read.handle;

        // 读取 Wi-Fi 配置：从 NVS 取出并以 JSON 返回
        // 该特征是 ESP_GATT_RSP_BY_APP，需要应用自己回复，协议栈不会自动响应
        if (handle == handle_table[IDX_CHAR_CFG_VAL] && param->read.need_rsp)
        {
            char ssid[33] = {0};
            char pass[65] = {0};
            wifi_cfg_load(ssid, sizeof(ssid), pass, sizeof(pass));

            cJSON *root = cJSON_CreateObject();
            cJSON_AddStringToObject(root, "ssid", ssid);
            cJSON_AddStringToObject(root, "password", pass);
            char *json = cJSON_PrintUnformatted(root);
            cJSON_Delete(root);

            if (json != NULL)
            {
                esp_gatt_rsp_t rsp;
                memset(&rsp, 0, sizeof(rsp));
                rsp.attr_value.handle = handle;
                rsp.attr_value.offset = 0;
                rsp.attr_value.len = strlen(json);
                memcpy(rsp.attr_value.value, json, rsp.attr_value.len);
                esp_ble_gatts_send_response(gatts_if_param, param->read.conn_id,
                                            param->read.trans_id, ESP_GATT_OK, &rsp);
                cJSON_free(json);
            }
            else
            {
                esp_ble_gatts_send_response(gatts_if_param, param->read.conn_id,
                                            param->read.trans_id, ESP_GATT_ERROR, NULL);
            }
        }
        break;
    }

    // ---- 手机写入数据 ----
    case ESP_GATTS_WRITE_EVT:
    {
        uint16_t handle = param->write.handle;
        uint16_t len = param->write.len;
        uint8_t *value = param->write.value;

        // 判断写的是 CCC 描述符（开启/关闭通知）
        if (handle == handle_table[IDX_CHAR_TX_CFG] && len == 2)
        {
            uint16_t ccc = value[1] << 8 | value[0]; // 小端序拼接
            notify_enabled = (ccc & 0x0001);         // bit0 = 1 表示开启通知
            ESP_LOGI(TAG, "Notify %s", notify_enabled ? "ENABLED" : "DISABLED");
        }
        // 判断写的是 RX 特征值（手机发来的数据）
        else if (handle == handle_table[IDX_CHAR_RX_VAL])
        {
            ESP_LOGI(TAG, "RX DATA: %.*s", len, (char *)value); // 打印接收到的数据
            cJSON *parsed_root = cJSON_Parse((char *)value);
            if (parsed_root == NULL)
            {
                const char *error_ptr = cJSON_GetErrorPtr();
                if (error_ptr != NULL)
                {
                    ESP_LOGE(TAG, "Error before: %s", error_ptr);
                }
                return;
            }
            cJSON *name = cJSON_GetObjectItemCaseSensitive(parsed_root, "name");
            if (cJSON_IsString(name) && (name->valuestring != NULL))
            {
                ESP_LOGI(TAG, "Parsed Name: %s", name->valuestring);
            }
            cJSON_Delete(parsed_root);
            // TODO: 在这里处理手机发来的业务数据
        }
        // 判断写的是 Wi-Fi 配置特征值（手机发来的新配置）
        else if (handle == handle_table[IDX_CHAR_CFG_VAL])
        {
            // 该特征是 ESP_GATT_RSP_BY_APP，协议栈不会自动回复，必须由应用回复
            esp_gatt_status_t rsp_status = ESP_GATT_OK;
            char json[sizeof(cfg_value) + 1] = {0};

            if (len > sizeof(cfg_value))
            {
                len = sizeof(cfg_value);
            }
            memcpy(json, value, len);
            json[len] = '\0';

            cJSON *root = cJSON_Parse(json);
            if (root == NULL)
            {
                ESP_LOGE(TAG, "Failed to parse Wi-Fi config JSON");
                rsp_status = ESP_GATT_ERROR;
            }
            else
            {
                cJSON *ssid = cJSON_GetObjectItemCaseSensitive(root, "ssid");
                cJSON *pass = cJSON_GetObjectItemCaseSensitive(root, "password");
                if (cJSON_IsString(ssid) && cJSON_IsString(pass))
                {
                    esp_err_t err = wifi_cfg_save(ssid->valuestring, pass->valuestring);
                    if (err == ESP_OK)
                    {
                        ESP_LOGI(TAG, "Wi-Fi config saved: ssid=%s", ssid->valuestring);
                    }
                    else
                    {
                        ESP_LOGE(TAG, "Failed to save Wi-Fi config: %s", esp_err_to_name(err));
                        rsp_status = ESP_GATT_ERROR;
                    }
                }
                else
                {
                    ESP_LOGE(TAG, "Invalid Wi-Fi config JSON: missing ssid/password");
                    rsp_status = ESP_GATT_ERROR;
                }
                cJSON_Delete(root);
            }

            if (param->write.need_rsp)
            {
                esp_ble_gatts_send_response(gatts_if_param, param->write.conn_id,
                                            param->write.trans_id, rsp_status, NULL);
            }
            return;
        }

        // 如果客户端要求响应，则发送写响应
        if (param->write.need_rsp)
        {
            esp_ble_gatts_send_response(gatts_if_param, param->write.conn_id,
                                        param->write.trans_id,
                                        ESP_GATT_OK, NULL);
        }
        break;
    }

    // ---- MTU 协商完成 ----
    case ESP_GATTS_MTU_EVT:
        ESP_LOGI(TAG, "MTU_UPDATED: %d", param->mtu.mtu);
        break;

    default:
        break;
    }
}

/* ============================================================
 * GAP 事件回调
 * 处理广播数据设置完成、扫描响应等事件。
 * ============================================================ */
static void gap_event_handler(esp_gap_ble_cb_event_t event,
                              esp_ble_gap_cb_param_t *param)
{
    if (event == ESP_GAP_BLE_ADV_DATA_RAW_SET_COMPLETE_EVT)
    {
        ESP_LOGI(TAG, "ADV DATA SET, starting advertising...");
        // 广播数据设置完成后，理论上可以在这里启动广播。
        // 但当前代码是在服务启动后（ESP_GATTS_START_EVT）才启动广播，
        // 这样能确保服务已就绪，避免手机连上后找不到服务。
    }
}

/* ============================================================
 * 主入口
 * 初始化蓝牙控制器 → Bluedroid → 注册回调 → 注册应用 → 创建任务
 * ============================================================ */
void app_main(void)
{
    // Initialize NVS (required for Wi-Fi to store configuration)
    esp_err_t err = nvs_flash_init();
    if (err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND)
    {
        // erase the whole SPI flash if no space leaves or new version has been found.
        err = nvs_flash_erase();
        if (err == ESP_OK)
        {
            err = nvs_flash_init();
        }
    }
    ESP_ERROR_CHECK(err);

    // 1. 初始化并启用蓝牙控制器（仅 BLE 模式）
    esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_bt_controller_init(&bt_cfg));
    ESP_ERROR_CHECK(esp_bt_controller_enable(ESP_BT_MODE_BLE));

    // 2. 初始化并启用 Bluedroid 协议栈
    ESP_ERROR_CHECK(esp_bluedroid_init());
    ESP_ERROR_CHECK(esp_bluedroid_enable());

    // 3. 注册 GAP 和 GATTS 事件回调
    ESP_ERROR_CHECK(esp_ble_gap_register_callback(gap_event_handler));
    ESP_ERROR_CHECK(esp_ble_gatts_register_callback(gatts_event_handler));

    // 4. 注册 GATT 应用（参数 0 为应用 ID）
    //    注册成功后会触发 ESP_GATTS_REG_EVT 事件
    ESP_ERROR_CHECK(esp_ble_gatts_app_register(0));

    // 5. 创建通知发送任务
    xTaskCreate(notify_task, "notify_task", 4096, NULL, 5, NULL);

    ESP_LOGI(TAG, "BLE GATT Server started, advertising...");
}