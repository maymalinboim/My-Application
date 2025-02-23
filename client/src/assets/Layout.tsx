import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/";

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        {!hideSidebar && <AppSidebar />}
        <main className="flex-1 p-6 h-full w-full relative">
          <SidebarTrigger className="absolute top-[-15px] left-[-25px] hover:border-gray-300 focus:outline-none focus:ring-0" />
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
