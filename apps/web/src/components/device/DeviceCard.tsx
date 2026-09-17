import { Card, CardContent, Chip } from "@heroui/react";
import {
  Wifi,
  Battery,
  Camera,
  MapPin,
  Clock,
  MoreVertical,
} from "lucide-react";

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

interface DeviceCardProps {
  device: Device;
}

export default function DeviceCard({ device }: DeviceCardProps) {
  return (
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
  );
}
