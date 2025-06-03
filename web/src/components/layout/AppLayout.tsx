"use client";

import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSidebarOpen(window.innerWidth >= 768); // Tailwind 'md' breakpoint
    };

    // Check on initial mount
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup listener on component unmount
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white overflow-y-auto transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:block md:w-64 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out md:ml-64`}>
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