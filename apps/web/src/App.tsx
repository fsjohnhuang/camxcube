import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Avatar,
  Divider,
  Badge,
} from "@heroui/react";
import { Camera, Image, Settings, Wifi, Battery, Activity } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Avatar
            src="https://img.icons8.com/fluency/96/camera.png"
            size="md"
          />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">CamXcube</h1>
            <p className="text-xs text-gray-500">Camera System</p>
          </div>
        </div>
        <Chip color="success" variant="flat" size="sm">
          Online
        </Chip>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-24 space-y-4">
        {/* Device Status Card */}
        <Card shadow="sm">
          <CardBody className="gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Device Status
              </span>
              <Badge color="success" variant="flat" size="sm">
                Connected
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <Wifi className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">IP Address</p>
                  <p className="text-sm font-mono">192.168.1.12</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <Battery className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Battery</p>
                  <p className="text-sm font-medium">98%</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                Last heartbeat: 2 minutes ago
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Card shadow="sm" isHoverable className="cursor-pointer active:scale-95 transition-transform">
            <CardBody className="items-center justify-center py-5">
              <Camera className="w-7 h-7 text-blue-500 mb-2" />
              <span className="text-xs font-medium">Capture</span>
            </CardBody>
          </Card>

          <Card shadow="sm" isHoverable className="cursor-pointer active:scale-95 transition-transform">
            <CardBody className="items-center justify-center py-5">
              <Image className="w-7 h-7 text-purple-500 mb-2" />
              <span className="text-xs font-medium">Gallery</span>
            </CardBody>
          </Card>

          <Card shadow="sm" isHoverable className="cursor-pointer active:scale-95 transition-transform">
            <CardBody className="items-center justify-center py-5">
              <Settings className="w-7 h-7 text-gray-500 mb-2" />
              <span className="text-xs font-medium">Settings</span>
            </CardBody>
          </Card>
        </div>

        {/* Recent Photos */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Recent Photos
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
              >
                <img
                  src={`https://picsum.photos/200?random=${i}`}
                  alt={`Photo ${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Stats Card */}
        <Card shadow="sm">
          <CardFooter className="justify-between">
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-gray-900">127</p>
              <p className="text-xs text-gray-500">Total Photos</p>
            </div>
            <Divider orientation="vertical" className="h-8" />
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-gray-900">3</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
            <Divider orientation="vertical" className="h-8" />
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-gray-900">2.4GB</p>
              <p className="text-xs text-gray-500">Storage</p>
            </div>
          </CardFooter>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 safe-area-inset-bottom">
        <div className="flex justify-around items-center">
          <button className="flex flex-col items-center gap-0.5 py-1 px-4 text-blue-500">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button className="flex flex-col items-center gap-0.5 py-1 px-4 text-gray-400">
            <Image className="w-6 h-6" />
            <span className="text-xs font-medium">Gallery</span>
          </button>

          <button className="flex flex-col items-center gap-0.5 py-1 px-4 text-gray-400">
            <Activity className="w-6 h-6" />
            <span className="text-xs font-medium">Devices</span>
          </button>

          <button className="flex flex-col items-center gap-0.5 py-1 px-4 text-gray-400">
            <Settings className="w-6 h-6" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
