import { X } from "lucide-react";

interface FileItem {
  id: number;
  device_id: number;
  physical_path: string;
  original_name: string;
  mime_type: string;
  created_at: string;
}

interface PhotoPreviewProps {
  file: FileItem;
  onClose: () => void;
}

export default function PhotoPreview({ file, onClose }: PhotoPreviewProps) {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full z-10"
        onClick={onClose}
      >
        <X className="w-6 h-6 text-white" />
      </button>
      <img
        src={`http://localhost:3000/api/files/${file.id}/stream`}
        alt={file.original_name}
        className="max-w-full max-h-full object-contain cursor-zoom-out transition-transform duration-300 hover:scale-150"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
