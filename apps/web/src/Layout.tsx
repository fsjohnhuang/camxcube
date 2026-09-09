import { Image, Activity, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {children}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 z-20">
        <div className="flex justify-around items-center">
          <Link
            to="/"
            className={`flex flex-col items-center gap-0.5 py-1 px-4 ${
              isActive("/") ? "text-blue-500" : "text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </Link>

          <Link
            to="/gallery"
            className={`flex flex-col items-center gap-0.5 py-1 px-4 ${
              isActive("/gallery") ? "text-blue-500" : "text-gray-400"
            }`}
          >
            <Image className="w-6 h-6" />
            <span className="text-xs font-medium">Gallery</span>
          </Link>

          <Link
            to="/devices"
            className={`flex flex-col items-center gap-0.5 py-1 px-4 ${
              isActive("/devices") ? "text-blue-500" : "text-gray-400"
            }`}
          >
            <Activity className="w-6 h-6" />
            <span className="text-xs font-medium">Devices</span>
          </Link>

          <Link
            to="/settings"
            className={`flex flex-col items-center gap-0.5 py-1 px-4 ${
              isActive("/settings") ? "text-blue-500" : "text-gray-400"
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
