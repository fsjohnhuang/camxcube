import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { $axios } from "../utils/$axios";
import { Input, Button, Chip } from "@heroui/react";
import { ArrowLeft, Camera } from "lucide-react";

interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  status: "online" | "offline";
  battery: number;
  location: string;
}

export default function EditDevicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    ip: "",
    mac: "",
    location: "",
  });
  const [errors, setErrors] = useState({
    ip: "",
    mac: "",
  });

  const validateIp = (ip: string) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return "Invalid IP address format";
    const parts = ip.split(".").map(Number);
    if (parts.some((p) => p < 0 || p > 255)) return "IP address must be between 0.0.0.0 and 255.255.255.255";
    return "";
  };

  const validateMac = (mac: string) => {
    const macRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
    if (!macRegex.test(mac)) return "Invalid MAC address format (e.g., AA:BB:CC:DD:EE:FF)";
    return "";
  };

  useEffect(() => {
    async function fetchDevice() {
      try {
        const response = await $axios.get(`http://localhost:3000/api/devices/${id}`);
        setForm({
          name: response.name || "",
          ip: response.ip || "",
          mac: response.mac || "",
          location: response.location || "",
        });
      } catch (error) {
        console.error("Failed to fetch device:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDevice();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ipError = validateIp(form.ip);
    const macError = validateMac(form.mac);
    setErrors({ ip: ipError, mac: macError });

    if (ipError || macError) return;

    setSaving(true);
    try {
      await $axios.put(`http://localhost:3000/api/devices/${id}`, form);
      navigate("/devices");
    } catch (error) {
      console.error("Failed to update device:", error);
      alert("Failed to update device. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Chip color="primary" variant="soft">Loading...</Chip>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button
          onClick={() => navigate("/devices")}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Camera className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Edit Device</h1>
            <p className="text-xs text-gray-500">Update device information</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-xl p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Device Name</label>
              <Input
                placeholder="Enter device name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">IP Address</label>
              <Input
                placeholder="192.168.1.1"
                value={form.ip}
                onChange={(e) => {
                  setForm({ ...form, ip: e.target.value });
                  setErrors((prev) => ({ ...prev, ip: validateIp(e.target.value) }));
                }}
              />
              {errors.ip && <p className="text-xs text-red-500 mt-1">{errors.ip}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">MAC Address</label>
              <Input
                placeholder="AA:BB:CC:DD:EE:FF"
                value={form.mac}
                onChange={(e) => {
                  setForm({ ...form, mac: e.target.value });
                  setErrors((prev) => ({ ...prev, mac: validateMac(e.target.value) }));
                }}
              />
              {errors.mac && <p className="text-xs text-red-500 mt-1">{errors.mac}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Location</label>
              <Input
                placeholder="e.g., Front Door, Backyard"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="bordered"
              className="flex-1"
              onClick={() => navigate("/devices")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              className="flex-1"
              isLoading={saving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
