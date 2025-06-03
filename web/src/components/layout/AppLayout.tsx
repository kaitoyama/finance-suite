"use client";

import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // クライアントサイドでマウントされたことを記録
    
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile); // デスクトップでは開く、モバイルでは閉じる
    };

    // Check on initial mount
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup listener on component unmount
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // ESCキーでサイドバーを閉じる
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isSidebarOpen && isMobile) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen, isMobile]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile overlay - only show on mobile when sidebar is open and client-side */}
      {isClient && isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate bg-opacity-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white overflow-y-auto transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:block md:w-64 
          ${isClient && isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${!isClient ? "md:translate-x-0" : ""}
        `}
      >
        <Sidebar 
          onNavigate={() => {
            if (isMobile) {
              setIsSidebarOpen(false);
            }
          }}
        />
      </div>
      
      {/* Main content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out`}>
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}