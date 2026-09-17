import { Camera } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <Camera className="w-12 h-12 mb-3 text-gray-300" />
      <p className="text-lg font-medium text-gray-700 mb-1">No devices found</p>
      <p className="text-sm">Click "One-Click Setup" to add your first camera</p>
    </div>
  );
}
