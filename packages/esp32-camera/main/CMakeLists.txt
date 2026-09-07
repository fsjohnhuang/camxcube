set(srcs "main.c")

idf_component_register(SRCS "ntp.c" "nvs.c" "wifi.c" "http_client.c" "http_server.c" "camera.c" "${srcs}" INCLUDE_DIRS ".")
