import { useState, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";
import DeviceCard from "./DeviceCard";

interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  status: "online" | "offline";
  battery: number;
  lastSeen: string;
  location: string;
  photoCount: number;
}

interface SwipeableRowProps {
  device: Device;
  onEdit: (device: Device) => void;
  onDelete: (device: Device) => void;
}

export default function SwipeableRow({ device, onEdit, onDelete }: SwipeableRowProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = startXRef.current;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;

    if (isOpen) {
      if (diff > 0) {
        setTranslateX(Math.max(-120, -120 + diff));
      } else {
        setTranslateX(-120 + diff);
      }
    } else {
      if (diff < 0) {
        setTranslateX(Math.max(diff, -120));
      }
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    if (isOpen) {
      const diff = currentXRef.current - startXRef.current;
      if (diff > 60) {
        setTranslateX(0);
        setIsOpen(false);
      } else {
        setTranslateX(-120);
        setIsOpen(true);
      }
    } else {
      if (translateX < -60) {
        setTranslateX(-120);
        setIsOpen(true);
      } else {
        setTranslateX(0);
        setIsOpen(false);
      }
    }
  };

  const handleClose = () => {
    setTranslateX(0);
    setIsOpen(false);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-y-0 right-0 flex">
        <button
          onClick={() => {
            onEdit(device);
            handleClose();
          }}
          className="w-15 bg-blue-500 flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            onDelete(device);
            handleClose();
          }}
          className="w-15 bg-red-500 flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div
        className="relative bg-white transition-transform duration-200"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => isOpen && handleClose()}
      >
        <DeviceCard device={device} />
      </div>
    </div>
  );
}
