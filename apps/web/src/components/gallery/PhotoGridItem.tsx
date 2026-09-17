import { Download, Share2, Trash2 } from "lucide-react";

interface FileItem {
  id: number;
  device_id: number;
  physical_path: string;
  original_name: string;
  mime_type: string;
  created_at: string;
}

interface PhotoGridItemProps {
  file: FileItem;
  onPreview: (file: FileItem) => void;
}

export default function PhotoGridItem({ file, onPreview }: PhotoGridItemProps) {
  return (
    <div className="aspect-square bg-white rounded-lg overflow-hidden relative group">
      <img
        src={`http://localhost:3000/api/files/${file.id}/stream`}
        alt={file.original_name}
        className="w-full h-full object-cover cursor-pointer"
        onClick={() => onPreview(file)}
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
  );
}
