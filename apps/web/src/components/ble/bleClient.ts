export const BLE_SERVICE_UUID = "000000ff-0000-1000-8000-00805f9b34fb"; // 0x00FF
export const BLE_CONFIG_CHAR_UUID = "0000ff03-0000-1000-8000-00805f9b34fb"; // 0xFF03

export interface WifiConfig {
  ssid: string;
  password: string;
}

async function getConfigCharacteristic(device: BluetoothDevice) {
  const gatt = device.gatt;
  if (!gatt) {
    throw new Error("Device has no GATT server");
  }
  const server = gatt.connected ? gatt : await gatt.connect();
  const service = await server.getPrimaryService(BLE_SERVICE_UUID);
  return service.getCharacteristic(BLE_CONFIG_CHAR_UUID);
}

export async function readWifiConfig(device: BluetoothDevice): Promise<WifiConfig> {
  const characteristic = await getConfigCharacteristic(device);
  const value = await characteristic.readValue();
  const text = new TextDecoder().decode(value);
  const parsed = JSON.parse(text);
  return {
    ssid: typeof parsed.ssid === "string" ? parsed.ssid : "",
    password: typeof parsed.password === "string" ? parsed.password : "",
  };
}

export async function writeWifiConfig(device: BluetoothDevice, config: WifiConfig): Promise<void> {
  const characteristic = await getConfigCharacteristic(device);
  const encoded = new TextEncoder().encode(JSON.stringify(config));
  await characteristic.writeValue(encoded);
}
