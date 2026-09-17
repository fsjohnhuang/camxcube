import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { $axios } from "../utils/$axios";
import DevicesHeader from "../components/device/DevicesHeader";
import SwipeableRow from "../components/device/SwipeableRow";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import AddDeviceButton from "../components/AddDeviceButton";

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

export default function DevicesPage() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const response = await $axios.get("http://localhost:3000/api/devices");
        setDevices(response.data || []);
      } catch (error) {
        console.error("Failed to fetch devices:", error);
        setDevices([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDevices();
  }, []);

  const handleEdit = (device: Device) => {
    navigate(`/devices/${device.id}/edit`);
  };

  const handleDelete = async (device: Device) => {
    try {
      await $axios.delete(`http://localhost:3000/api/devices/${device.id}`);
      setDevices((prev) => prev.filter((d) => d.id !== device.id));
    } catch (error) {
      console.error("Failed to delete device:", error);
      alert("Failed to delete device. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <DevicesHeader onlineCount={devices.filter((d) => d.status === "online").length} />

      <main className="flex-1 px-4 py-4 pb-24 space-y-4">
        <div className="space-y-3">
          {loading ? (
            <LoadingState />
          ) : devices.length === 0 ? (
            <EmptyState />
          ) : (
            devices.map((device) => (
              <SwipeableRow
                key={device.id}
                device={device}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        <AddDeviceButton />
      </main>
    </div>
  );
}
