import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  Chip,
  Spinner,
} from "@heroui/react";
import {
  Wifi,
  Battery,
  Camera,
  MapPin,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { $axios } from "../utils/$axios";

interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  status: "online" | "offline";
  battery: number;
  lastSeen: string;
  location: string;
  photoCount: number;
}

interface SwipeableRowProps {
  device: Device;
  onEdit: (device: Device) => void;
  onDelete: (device: Device) => void;
}

function SwipeableRow({ device, onEdit, onDelete }: SwipeableRowProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = startXRef.current;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;

    if (isOpen) {
      // When open, allow swiping right to close
      if (diff > 0) {
        setTranslateX(Math.max(-120, -120 + diff));
      } else {
        setTranslateX(-120 + diff);
      }
    } else {
      // Only allow swiping left (negative values) when closed
      if (diff < 0) {
        setTranslateX(Math.max(diff, -120)); // Max swipe distance
      }
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    if (isOpen) {
      // If swiped more than 60px to the right, close; otherwise keep open
      const diff = currentXRef.current - startXRef.current;
      if (diff > 60) {
        setTranslateX(0);
        setIsOpen(false);
      } else {
        setTranslateX(-120);
        setIsOpen(true);
      }
    } else {
      if (translateX < -60) {
        setTranslateX(-120);
        setIsOpen(true);
      } else {
        setTranslateX(0);
        setIsOpen(false);
      }
    }
  };

  const handleClose = () => {
    setTranslateX(0);
    setIsOpen(false);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Action buttons behind the card */}
      <div className="absolute inset-y-0 right-0 flex">
        <button
          onClick={() => {
            onEdit(device);
            handleClose();
          }}
          className="w-[60px] bg-blue-500 flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            onDelete(device);
            handleClose();
          }}
          className="w-[60px] bg-red-500 flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Swipeable card */}
      <div
        className="relative bg-white transition-transform duration-200"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => isOpen && handleClose()}
      >
        <Card className="bg-white border-0">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    device.status === "online"
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Camera
                    className={`w-5 h-5 ${
                      device.status === "online"
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {device.name}
                  </h3>
                  <p className="text-xs text-gray-500">{device.ip}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Chip
                  color={device.status === "online" ? "success" : "default"}
                  variant="soft"
                  size="sm"
                >
                  {device.status === "online" ? "Online" : "Offline"}
                </Chip>
                <button className="p-1 hover:bg-gray-100 rounded-full">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">{device.location}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">{device.lastSeen}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Battery className="w-3 h-3" />
                  <span>{device.battery}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  <span>{device.mac}</span>
                </div>
              </div>
              <span>{device.photoCount} photos</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const response = await $axios.get("http://localhost:3000/api/devices");
        setDevices(response.data || []);
      } catch (error) {
        console.error("Failed to fetch devices:", error);
        setDevices([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDevices();
  }, []);

  const handleEdit = (device: Device) => {
    console.log("Edit device:", device);
    // TODO: Implement edit functionality
  };

  const handleDelete = async (device: Device) => {
    console.log("Delete device:", device);
    // TODO: Implement delete functionality
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            <img
              src="https://img.icons8.com/fluency/96/camera.png"
              alt="logo"
              className="w-8 h-8"
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Devices</h1>
            <p className="text-xs text-gray-500">Manage your cameras</p>
          </div>
        </div>
        <Chip color="primary" variant="soft" size="sm">
          {devices.filter((d) => d.status === "online").length} Online
        </Chip>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-24 space-y-4">
        {/* Device List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" color="primary" />
            </div>
          ) : devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Camera className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-lg font-medium text-gray-700 mb-1">No devices found</p>
              <p className="text-sm">Click "One-Click Setup" to add your first camera</p>
            </div>
          ) : (
            devices.map((device) => (
              <SwipeableRow
                key={device.id}
                device={device}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Add Device Button */}
        <button className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 active:scale-98 transition-transform">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          One-Click Setup
        </button>
      </main>
    </div>
  );
}
