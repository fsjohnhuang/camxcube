import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip } from "@heroui/react";
import { ArrowLeft, Bluetooth, RefreshCw, BluetoothConnected } from "lucide-react";

interface BleDevice {
  id: string;
  name: string;
  rssi?: number;
  device?: BluetoothDevice;
}

export default function BleScanPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<BleDevice[]>([]);
  const [error, setError] = useState<string>("");
  const [bluetoothAvailable, setBluetoothAvailable] = useState(true);

  useEffect(() => {
    // Check if Web Bluetooth is supported
    if (!navigator.bluetooth) {
      setBluetoothAvailable(false);
      setError("Web Bluetooth is not supported in this browser");
    }
  }, []);

  const startScan = async () => {
    if (!navigator.bluetooth) {
      setError("Web Bluetooth is not supported");
      return;
    }

    setScanning(true);
    setError("");
    setDevices([]);

    try {
      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["device_information"],
      });

      // Add the requested device to the list
      setDevices([
        {
          id: device.id,
          name: device.name || "Unknown Device",
          device,
        },
      ]);

      // If device is already connected, get RSSI
      if (device.gatt?.connected) {
        const server = await device.gatt?.connect();
        const service = await server.getPrimaryService("device_information");
        // Try to read RSSI if available
        try {
          // RSSI is not standard in GATT, this is just a placeholder
          // Real implementation would need specific BLE characteristic
        } catch (e) {
          // RSSI reading not supported
        }
      }
    } catch (err: any) {
      if (err.name !== "NotFoundError") {
        setError(err.message || "Failed to scan for devices");
      }
    } finally {
      setScanning(false);
    }
  };

  const connectDevice = async (bleDevice: BleDevice) => {
    if (!bleDevice.device) return;

    try {
      if (bleDevice.device.gatt?.connected) {
        await bleDevice.device.gatt.disconnect();
      }

      const server = await bleDevice.device.gatt?.connect();
      console.log("Connected to:", bleDevice.name, server);

      // TODO: Send data to server to register device
      // const deviceInfo = {
      //   name: bleDevice.name,
      //   mac: bleDevice.id, // MAC address format varies by platform
      // };

      navigate("/devices");
    } catch (err: any) {
      setError(`Failed to connect: ${err.message}`);
    }
  };

  if (!bluetoothAvailable) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-10">
          <button
            onClick={() => navigate("/devices")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Bluetooth className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">BLE Setup</h1>
              <p className="text-xs text-gray-500">Scan for nearby devices</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-4 flex items-center justify-center">
          <div className="text-center">
            <Bluetooth className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Web Bluetooth Not Supported
            </p>
            <p className="text-sm text-gray-500">
              Please use a browser that supports Web Bluetooth
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Supported browsers: Chrome, Edge, Opera (desktop/mobile)
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button
          onClick={() => navigate("/devices")}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Bluetooth className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">BLE Setup</h1>
            <p className="text-xs text-gray-500">Scan for nearby devices</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-24 space-y-4">
        {/* Scan Button */}
        <Button
          color="primary"
          className="w-full"
          onClick={startScan}
          isLoading={scanning}
          startContent={!scanning && <RefreshCw className="w-4 h-4" />}
        >
          {scanning ? "Scanning..." : "Start Scan"}
        </Button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Device List */}
        <div className="space-y-3">
          {devices.length === 0 && !scanning && !error && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bluetooth className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-sm">Tap "Start Scan" to find nearby devices</p>
            </div>
          )}

          {devices.map((device) => (
            <div
              key={device.id}
              className="bg-white rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {device.device?.gatt?.connected ? (
                    <BluetoothConnected className="w-5 h-5 text-green-500" />
                  ) : (
                    <Bluetooth className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{device.name}</p>
                  <p className="text-xs text-gray-500">
                    {device.device?.gatt?.connected ? "Connected" : "Available"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                color="primary"
                onClick={() => connectDevice(device)}
              >
                Connect
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
