import {
  Card,
  CardContent,
  Chip,
} from "@heroui/react";
import {
  User,
  Bell,
  Wifi,
  Moon,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function SettingsPage() {
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
            <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
            <p className="text-xs text-gray-500">Configure your app</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-24 space-y-4">
        {/* Account Section */}
        <div>
          <h2 className="text-xs font-medium text-gray-500 uppercase mb-2 px-1">
            Account
          </h2>
          <Card className="bg-white">
            <CardContent className="p-0 divide-y divide-gray-100">
              <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">Profile</p>
                  <p className="text-xs text-gray-500">Manage your account</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">Notifications</p>
                  <p className="text-xs text-gray-500">Configure alerts</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Device Settings */}
        <div>
          <h2 className="text-xs font-medium text-gray-500 uppercase mb-2 px-1">
            Device
          </h2>
          <Card className="bg-white">
            <CardContent className="p-0 divide-y divide-gray-100">
              <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Wifi className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">Network</p>
                  <p className="text-xs text-gray-500">WiFi & connection</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Moon className="w-4 h-4 text-purple-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">Display</p>
                  <p className="text-xs text-gray-500">Theme & appearance</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Support */}
        <div>
          <h2 className="text-xs font-medium text-gray-500 uppercase mb-2 px-1">
            Support
          </h2>
          <Card className="bg-white">
            <CardContent className="p-0 divide-y divide-gray-100">
              <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">Help & Feedback</p>
                  <p className="text-xs text-gray-500">Get assistance</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-red-500">Sign Out</p>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Version Info */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-400">CamXcube v1.0.0</p>
        </div>
      </main>
    </div>
  );
}
