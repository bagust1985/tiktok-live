"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Settings,
  LogOut,
  ListTodo,
  Shield,
} from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { useRouter } from "next/navigation";

const allMenuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "ADMIN"], // Available to all admins
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: CreditCard,
    roles: ["SUPER_ADMIN", "ADMIN"], // Available to all admins
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["SUPER_ADMIN"], // Super admin only
  },
  {
    title: "Tasks",
    href: "/admin/tasks",
    icon: ListTodo,
    roles: ["SUPER_ADMIN"], // Super admin only
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN"], // Super admin only
  },
  {
    title: "Admin Management",
    href: "/admin/admins",
    icon: Shield,
    roles: ["SUPER_ADMIN"], // Super admin only
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, admin } = useAdminStore();
  
  // Filter menu items based on admin role
  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(admin?.admin_role || "ADMIN")
  );

  const handleLogout = () => {
    logout(); // This will handle remove admin-token and admin-user (no need to manually clear)
    router.push("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

