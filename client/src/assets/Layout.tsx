import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/";

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {!hideSidebar && <AppSidebar />}
        <main className="flex-1 p-6">
          <SidebarTrigger />
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
