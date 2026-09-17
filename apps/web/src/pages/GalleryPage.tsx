import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import { $axios } from "../utils/$axios";
import GalleryHeader from "../components/gallery/GalleryHeader";
import PhotoGridItem from "../components/gallery/PhotoGridItem";
import PhotoListItem from "../components/gallery/PhotoListItem";
import PhotoPreview from "../components/gallery/PhotoPreview";
import EmptyState from "../components/gallery/EmptyState";

type ViewMode = "grid" | "list";

interface FileItem {
  id: number;
  device_id: number;
  physical_path: string;
  original_name: string;
  mime_type: string;
  created_at: string;
}

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const data = await $axios.get("http://localhost:3000/api/files");
        setFiles(data?.data || []);
      } catch (error) {
        console.error("Failed to fetch files:", error);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFiles();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <GalleryHeader
        photoCount={files.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <main className="flex-1 px-4 py-4 pb-24">
        {files.length === 0 ? (
          <EmptyState />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-3 gap-2">
            {files.map((file) => (
              <PhotoGridItem
                key={file.id}
                file={file}
                onPreview={setPreviewFile}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <PhotoListItem
                key={file.id}
                file={file}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </main>

      {previewFile && (
        <PhotoPreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
