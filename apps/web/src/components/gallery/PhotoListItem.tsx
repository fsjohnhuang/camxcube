import { Card } from "@heroui/react";
import { Download, Share2, Trash2 } from "lucide-react";

interface FileItem {
  id: number;
  device_id: number;
  physical_path: string;
  original_name: string;
  mime_type: string;
  created_at: string;
}

interface PhotoListItemProps {
  file: FileItem;
  formatTime: (dateString: string) => string;
}

export default function PhotoListItem({ file, formatTime }: PhotoListItemProps) {
  return (
    <Card className="bg-white">
      <div className="flex gap-3 p-3">
        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
          <img
            src={`http://localhost:3000/api/files/${file.id}/stream`}
            alt={file.original_name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {file.original_name}
            </p>
            <p className="text-xs text-gray-500">{formatTime(file.created_at)}</p>
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
  );
}
