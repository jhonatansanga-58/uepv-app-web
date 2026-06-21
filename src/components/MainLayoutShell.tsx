"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SideBarComponent } from "./sidebar";
import { NavBarComponent } from "./navbar";

export function MainLayoutShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar drawer automatically on mobile when navigating
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 shrink-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          w-64`}
      >
        <SideBarComponent />
      </div>

      {/* Overlay backdrop for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 max-h-screen overflow-hidden w-full">
        <NavBarComponent onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-light">
          {children}
        </main>
      </div>
    </div>
  );
}
