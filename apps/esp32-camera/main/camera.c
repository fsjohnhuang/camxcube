#include "camera.h"

static const char * TAG = "CAMERA";

camera_config_t camera_config = {
	.pin_pwdn = CAM_PIN_PWDN,
	.pin_reset = CAM_PIN_RESET,
	.pin_xclk = CAM_PIN_XCLK,
	.pin_sscb_sda = CAM_PIN_SIOD,
	.pin_sscb_scl = CAM_PIN_SIOC,

	.pin_d7 = CAM_PIN_D7,
	.pin_d6 = CAM_PIN_D6,
	.pin_d5 = CAM_PIN_D5,
	.pin_d4 = CAM_PIN_D4,
	.pin_d3 = CAM_PIN_D3,
	.pin_d2 = CAM_PIN_D2,
	.pin_d1 = CAM_PIN_D1,
	.pin_d0 = CAM_PIN_D0,
	.pin_vsync = CAM_PIN_VSYNC,
	.pin_href = CAM_PIN_HREF,
	.pin_pclk = CAM_PIN_PCLK,

	//XCLK 20MHz or 10MHz for OV2640 double FPS (Experimental)
	.xclk_freq_hz = 20000000,
	.ledc_timer = LEDC_TIMER_0,
	.ledc_channel = LEDC_CHANNEL_0,

	.pixel_format = PIXFORMAT_JPEG, //YUV422,GRAYSCALE,RGB565,JPEG
	.frame_size = FRAMESIZE_VGA,	//QQVGA-UXGA Do not use sizes above QVGA when not JPEG

	.jpeg_quality = 12, //0-63 lower number means higher quality
	.fb_count = 1,		//if more than one, i2s runs in continuous mode. Use only with JPEG
	.grab_mode = CAMERA_GRAB_WHEN_EMPTY
};

static uint8_t camera_has_inited = 0;
esp_err_t camera_init(int framesize)
{
	//initialize the camera
	camera_config.frame_size = framesize;
	/**
	 * ESP_ERROR_NOT_SUPPORTED: ESP32 的摄像头驱动没能成功识别你的摄像头传感器。一般是软件配置或硬件连接问题引起。
	 */
	esp_err_t err = esp_camera_init(&camera_config);
	if (err != ESP_OK)
	{
		ESP_LOGE(TAG, "Camera Init Failed");
		return err;
	}

	camera_has_inited = 1;

	return ESP_OK;
}
esp_err_t camera_capture(camera_capture_handler_t handler) {
	if (!camera_has_inited) return ESP_FAIL;

	camera_fb_t *fb = esp_camera_fb_get();
	if (fb) {
		esp_err_t err = handler(fb);
		esp_camera_fb_return(fb);
		return err;
	}
	return ESP_FAIL;
}