import { useEffect, useState } from "react";
import { Button, Input, InputGroup } from "@heroui/react";
import { Eye, EyeOff, LoaderCircle, Wifi, X } from "lucide-react";
import { readWifiConfig, writeWifiConfig } from "./bleClient";
import type { BleDevice } from "./BleDeviceItem";

interface BleWifiConfigDialogProps {
  device: BleDevice | null;
  onClose: () => void;
}

export default function BleWifiConfigDialog({ device, onClose }: BleWifiConfigDialogProps) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [readError, setReadError] = useState("");
  const [writeError, setWriteError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!device?.device) return;

    let cancelled = false;
    setLoading(true);
    setReadError("");
    setWriteError("");
    setSaved(false);
    setSsid("");
    setPassword("");

    readWifiConfig(device.device)
      .then((config) => {
        if (cancelled) return;
        setSsid(config.ssid);
        setPassword(config.password);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setReadError(err.message || "Failed to read the Wi-Fi configuration from the device");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [device]);

  if (!device) return null;

  const handleSave = async () => {
    if (!device.device) return;
    setSaving(true);
    setWriteError("");
    setSaved(false);
    try {
      await writeWifiConfig(device.device, { ssid, password });
      setSaved(true);
      setTimeout(onClose, 800);
    } catch (err: any) {
      setWriteError(err.message || "Failed to save the Wi-Fi configuration");
    } finally {
      setSaving(false);
    }
  };

  const error = readError || writeError;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">Wi-Fi Configuration</h2>
            <p className="text-xs text-gray-500">{device.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {saved && !error && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">Configuration saved to the device.</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
              <LoaderCircle className="w-5 h-5 animate-spin" />
              <span className="text-sm">Reading configuration...</span>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">SSID</label>
                <Input
                  placeholder="Wi-Fi network name"
                  value={ssid}
                  disabled={saving}
                  onChange={(e) => setSsid(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <InputGroup>
                  <InputGroup.Input
                    placeholder="Wi-Fi password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    disabled={saving}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputGroup.Suffix>
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-gray-400 hover:text-gray-600 px-2"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </InputGroup.Suffix>
                </InputGroup>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex gap-3 border-t border-gray-100">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            isDisabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSave}
            isPending={saving}
            isDisabled={loading || !!readError}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
