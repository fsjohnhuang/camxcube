import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { ArrowLeft, Bluetooth } from "lucide-react";
import BleDeviceItem, { type BleDevice } from "../components/ble/BleDeviceItem";
import BleWifiConfigDialog from "../components/ble/BleWifiConfigDialog";
import { BLE_SERVICE_UUID } from "../components/ble/bleClient";

export default function BleScanPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<BleDevice[]>([]);
  const [error, setError] = useState<string>("");
  const [bluetoothAvailable, setBluetoothAvailable] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<BleDevice | null>(null);

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

    try {
      // Request Bluetooth device
      const device: BluetoothDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [BLE_SERVICE_UUID],
        // filters: [{ services: [SERVICE_UUID] }]
      });
      const gatt: undefined | BluetoothRemoteGATTServer = device.gatt;

      // Add the requested device to the list
      setDevices((value) => {
        if (value.find(({ id }) => id === device.id)) {
          return value
        }
        else {
          return [...value, {
            id: device.id,
            name: device.name || "Unknown Device",
            device,
            connected: gatt?.connected ?? false,
          }]
        }
      });

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

    setError("")
    try {
      if (bleDevice.device.gatt?.connected) {
        await bleDevice.device.gatt.disconnect();
        console.log("Disconnected from:", bleDevice.name);
        setDevices((value) => {
          const idx = value.findIndex(({ id }) => id == bleDevice.id)
          value[idx] = { ...bleDevice, connected: false }
          return [...value]
        })
      }
      else {
        const server = await bleDevice.device.gatt?.connect();
        console.log("Connected to:", bleDevice.name, server);
        setDevices((value) => {
          const idx = value.findIndex(({ id }) => id == bleDevice.id)
          value[idx] = { ...bleDevice, connected: true }
          return [...value]
        })
      }

      // TODO: Send data to server to register device
      // const deviceInfo = {
      //   name: bleDevice.name,
      //   mac: bleDevice.id, // MAC address format varies by platform
      // };

      // navigate("/devices");
    } catch (err: any) {
      setError(`Failed to connect: ${err.message}`);
    }
  };

  const selectDevice = (bleDevice: BleDevice) => {
    if (!bleDevice.connected) {
      setError("Connect the device first");
      return;
    }
    setError("");
    setSelectedDevice(bleDevice);
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
          className="w-full"
          onClick={startScan}
          isPending={scanning}
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
            <BleDeviceItem
              key={device.id}
              device={device}
              onToggleConnection={connectDevice}
              onSelect={selectDevice}
            />
          ))}
        </div>
      </main>

      <BleWifiConfigDialog
        device={selectedDevice}
        onClose={() => setSelectedDevice(null)}
      />
    </div>
  );
}
