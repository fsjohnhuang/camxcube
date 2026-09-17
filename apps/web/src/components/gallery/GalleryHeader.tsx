import { Grid, List } from "lucide-react";

type ViewMode = "grid" | "list";

interface GalleryHeaderProps {
  photoCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function GalleryHeader({ photoCount, viewMode, onViewModeChange }: GalleryHeaderProps) {
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
          <h1 className="text-lg font-semibold text-gray-900">Gallery</h1>
          <p className="text-xs text-gray-500">{photoCount} photos</p>
        </div>
      </div>
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`p-2 rounded-md transition-colors ${
            viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`p-2 rounded-md transition-colors ${
            viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
          }`}
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
