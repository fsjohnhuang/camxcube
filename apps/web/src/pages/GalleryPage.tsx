import { useState } from "react";
import { Card, Chip } from "@heroui/react";
import { Grid, List, Download, Share2, Trash2 } from "lucide-react";

type ViewMode = "grid" | "list";

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const photos = [
    { id: "1", url: "https://picsum.photos/400?random=1", time: "2 min ago", device: "Front Door" },
    { id: "2", url: "https://picsum.photos/400?random=2", time: "15 min ago", device: "Backyard" },
    { id: "3", url: "https://picsum.photos/400?random=3", time: "1 hour ago", device: "Front Door" },
    { id: "4", url: "https://picsum.photos/400?random=4", time: "2 hours ago", device: "Garage" },
    { id: "5", url: "https://picsum.photos/400?random=5", time: "3 hours ago", device: "Backyard" },
    { id: "6", url: "https://picsum.photos/400?random=6", time: "Yesterday", device: "Front Door" },
    { id: "7", url: "https://picsum.photos/400?random=7", time: "Yesterday", device: "Backyard" },
    { id: "8", url: "https://picsum.photos/400?random=8", time: "2 days ago", device: "Garage" },
    { id: "9", url: "https://picsum.photos/400?random=9", time: "3 days ago", device: "Front Door" },
  ];

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
            <h1 className="text-lg font-semibold text-gray-900">Gallery</h1>
            <p className="text-xs text-gray-500">{photos.length} photos</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-24">
        {/* Filter Chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Chip color="primary" variant="soft" className="whitespace-nowrap">
            All (9)
          </Chip>
          <Chip color="default" variant="flat" className="whitespace-nowrap">
            Front Door (4)
          </Chip>
          <Chip color="default" variant="flat" className="whitespace-nowrap">
            Backyard (3)
          </Chip>
          <Chip color="default" variant="flat" className="whitespace-nowrap">
            Garage (2)
          </Chip>
        </div>

        {/* Photo Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative group"
              >
                <img
                  src={photo.url}
                  alt={`Photo ${photo.id}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-2 bg-white/90 rounded-full hover:bg-white">
                    <Share2 className="w-4 h-4 text-gray-700" />
                  </button>
                  <button className="p-2 bg-white/90 rounded-full hover:bg-white">
                    <Download className="w-4 h-4 text-gray-700" />
                  </button>
                  <button className="p-2 bg-white/90 rounded-full hover:bg-white">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {photos.map((photo) => (
              <Card key={photo.id} className="bg-white">
                <div className="flex gap-3 p-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={photo.url}
                      alt={`Photo ${photo.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Photo from {photo.device}
                      </p>
                      <p className="text-xs text-gray-500">{photo.time}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
