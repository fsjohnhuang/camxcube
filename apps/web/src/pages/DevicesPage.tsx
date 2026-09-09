import {
  Card,
  CardContent,
  Chip,
} from "@heroui/react";
import {
  Wifi,
  Battery,
  Activity,
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

const mockDevices: Device[] = [
  {
    id: "1",
    name: "Front Door Camera",
    ip: "192.168.1.12",
    mac: "AA:BB:CC:DD:EE:F1",
    status: "online",
    battery: 98,
    lastSeen: "Just now",
    location: "Front Entrance",
    photoCount: 127,
  },
  {
    id: "2",
    name: "Backyard Camera",
    ip: "192.168.1.13",
    mac: "AA:BB:CC:DD:EE:F2",
    status: "online",
    battery: 85,
    lastSeen: "5 min ago",
    location: "Backyard",
    photoCount: 243,
  },
  {
    id: "3",
    name: "Garage Camera",
    ip: "192.168.1.14",
    mac: "AA:BB:CC:DD:EE:F3",
    status: "offline",
    battery: 12,
    lastSeen: "2 hours ago",
    location: "Garage",
    photoCount: 89,
  },
];

export default function DevicesPage() {
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
          {mockDevices.filter((d) => d.status === "online").length} Online
        </Chip>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-24 space-y-4">
        {/* Device List */}
        <div className="space-y-3">
          {mockDevices.map((device) => (
            <Card key={device.id} className="bg-white">
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
          ))}
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
          Add New Device
        </button>
      </main>
    </div>
  );
}
