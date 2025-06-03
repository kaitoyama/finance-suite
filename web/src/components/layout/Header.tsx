"use client";

import { Bell, Settings, User, Menu } from "lucide-react"; // Added Menu
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define props interface
interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export function Header({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-white px-4 sm:px-6 flex items-center justify-between">
      {/* Adjusted px-4 for smaller screens, sm:px-6 for slightly larger */}
      <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted space-x-2 for smaller screens */}
        {/* Sidebar Toggle Button - visible only on small screens */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden" {/* Hidden on md screens and up */}
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium">ユーザー</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>アカウント</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              設定
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}