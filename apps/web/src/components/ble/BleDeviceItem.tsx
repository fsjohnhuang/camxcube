import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { Bluetooth, BluetoothConnected, Unplug } from "lucide-react";

export interface BleDevice {
  id: string;
  name: string;
  rssi?: number;
  device?: BluetoothDevice;
  connected?: boolean;
}

interface BleDeviceItemProps {
  device: BleDevice;
  onToggleConnection: (device: BleDevice) => void;
  onSelect?: (device: BleDevice) => void;
}

export default function BleDeviceItem({
  device,
  onToggleConnection,
  onSelect,
}: BleDeviceItemProps) {
  const connected = !!device.connected;
  const [showIcon, setShowIcon] = useState(false);
  const wasConnected = useRef(connected);

  useEffect(() => {
    if (connected && !wasConnected.current) {
      // Just connected: show the "Disconnect" label first, swap to the icon later.
      setShowIcon(false);
      const timer = setTimeout(() => setShowIcon(true), 2000);
      wasConnected.current = true;
      return () => clearTimeout(timer);
    }
    if (!connected && wasConnected.current) {
      setShowIcon(false);
    }
    wasConnected.current = connected;
  }, [connected]);

  return (
    <div
      className={
        onSelect
          ? "bg-white rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          : "bg-white rounded-xl p-4 flex items-center justify-between"
      }
      onClick={() => onSelect?.(device)}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          {connected ? (
            <BluetoothConnected className="w-5 h-5 text-green-500" />
          ) : (
            <Bluetooth className="w-5 h-5 text-blue-500" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{device.name}</p>
          <p className="text-xs text-gray-500">
            {connected ? "Connected" : "Available"}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant={connected ? "danger-soft" : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onToggleConnection(device);
        }}
      >
        {connected ? (
          <span className="relative flex items-center justify-center">
            <span
              className={
                showIcon
                  ? "transition-all duration-300 ease-out opacity-0 scale-75"
                  : "transition-all duration-300 ease-out opacity-100 scale-100"
              }
            >
              Disconnect
            </span>
            <Unplug
              className={
                showIcon
                  ? "absolute transition-all duration-300 ease-out opacity-100 scale-100"
                  : "absolute transition-all duration-300 ease-out opacity-0 scale-75"
              }
            />
          </span>
        ) : (
          "Connect"
        )}
      </Button>
    </div>
  );
}
