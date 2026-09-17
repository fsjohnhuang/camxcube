import { Chip } from "@heroui/react";

interface DevicesHeaderProps {
  onlineCount: number;
}

export default function DevicesHeader({ onlineCount }: DevicesHeaderProps) {
  return (
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
        {onlineCount} Online
      </Chip>
    </header>
  );
}
