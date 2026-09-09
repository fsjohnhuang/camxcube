import {
  Card,
  CardContent,
  CardFooter,
  Chip,
} from "@heroui/react";
import { Camera, Image, Settings, Wifi, Battery, Activity } from "lucide-react";

export default function HomePage() {
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
            <h1 className="text-lg font-semibold text-gray-900">CamXcube</h1>
            <p className="text-xs text-gray-500">Camera System</p>
          </div>
        </div>
        <Chip color="success" variant="soft" size="sm">
          Online
        </Chip>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-24 space-y-4">
        {/* Device Status Card */}
        <Card className="bg-white">
          <CardContent className="gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Device Status
              </span>
              <Chip color="success" variant="soft" size="sm">
                Connected
              </Chip>
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
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white cursor-pointer hover:bg-gray-50 active:scale-95 transition-transform">
            <CardContent className="items-center justify-center py-5">
              <Camera className="w-7 h-7 text-blue-500 mb-2" />
              <span className="text-xs font-medium">Capture</span>
            </CardContent>
          </Card>

          <Card className="bg-white cursor-pointer hover:bg-gray-50 active:scale-95 transition-transform">
            <CardContent className="items-center justify-center py-5">
              <Image className="w-7 h-7 text-purple-500 mb-2" />
              <span className="text-xs font-medium">Gallery</span>
            </CardContent>
          </Card>

          <Card className="bg-white cursor-pointer hover:bg-gray-50 active:scale-95 transition-transform">
            <CardContent className="items-center justify-center py-5">
              <Settings className="w-7 h-7 text-gray-500 mb-2" />
              <span className="text-xs font-medium">Settings</span>
            </CardContent>
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
        <Card className="bg-white">
          <CardFooter className="justify-between">
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-gray-900">127</p>
              <p className="text-xs text-gray-500">Total Photos</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-gray-900">3</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-gray-900">2.4GB</p>
              <p className="text-xs text-gray-500">Storage</p>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
