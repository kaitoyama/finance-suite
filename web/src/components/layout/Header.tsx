"use client";

import { Bell, User, Menu } from "lucide-react"; // Added Menu
import { Button } from "@/components/ui/button";
import { useMeQuery } from "@/hooks/useMeQuery";

// Define props interface
interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export function Header({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  const { user } = useMeQuery();
  const username = user?.username ?? "";
  return (
    <header className="h-16 border-b bg-white px-4 sm:px-6 flex items-center justify-between">
      {/* Adjusted px-4 for smaller screens, sm:px-6 for slightly larger */}
      <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted space-x-2 for smaller screens */}
        {/* Sidebar Toggle Button: visible only on small screens (hidden on md screens and up) */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Title - hidden on very small screens, visible from sm up */}
        <h2 className="hidden sm:block text-lg sm:text-xl font-semibold text-gray-800">財務管理システム</h2>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted space-x-2 for smaller screens */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
            {username ? (
              <img
                src={`https://q.trap.jp/api/v3/public/icon/${username}`}
                alt={username}
                className="w-8 h-8 object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-white" />
            )}
          </div>
          <span className="text-sm font-medium">{username || "ユーザー"}</span>
        </div>
      </div>
    </header>
  );
}