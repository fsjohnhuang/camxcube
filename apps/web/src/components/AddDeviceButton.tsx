import { useNavigate } from "react-router-dom";

export default function AddDeviceButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/ble-scan")}
      className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 active:scale-98 transition-transform"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      One-Click Setup
    </button>
  );
}
