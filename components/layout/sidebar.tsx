"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Camera,
  // ShieldVirus,
  Pill,
  MessageSquare,
  MessageCircle,
  Bell,
  Users,
  ChevronUp,
  LogOut,
  Settings,
  AlignVerticalJustifyStartIcon,
  Biohazard,
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: ["*"],
  },
  {
    title: "Detections",
    url: "/dashboard/detections",
    icon: Camera,
    roles: ["FARMER", "AGRONOMIST", "ADMIN"],
  },
  {
    title: "Diseases",
    url: "/dashboard/diseases",
    icon: AlignVerticalJustifyStartIcon,
    roles: ["AGRONOMIST", "ADMIN", "FARMER"],
  },
  {
    title: "Medicines",
    url: "/dashboard/medicines",
    icon: Pill,
    roles: ["AGRONOMIST", "ADMIN"],
  },
  {
    title: "Advices",
    url: "/dashboard/advices",
    icon: MessageSquare,
    roles: ["FARMER", "AGRONOMIST", "ADMIN"],
  },
  {
    title: "Feedback",
    url: "/dashboard/feedback",
    icon: MessageCircle,
    roles: ["FARMER", "AGRONOMIST"],
  },
  {
    title: "Feedback Responses",
    url: "/dashboard/feedback-responses",
    icon: MessageCircle,
    roles: ["AGRONOMIST"],
  },
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: Bell,
    roles: ["FARMER"],
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
    roles: ["ADMIN"],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();

  const filteredItems = navigationItems.filter(
    (item) => item.roles.includes("*") || hasRole(item.roles)
  );

  return (
    <Sidebar className="border-r bg-white shadow-sm">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
            <Biohazard className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight">TomatoAI</span>
            <span className="text-xs text-muted-foreground">
              Disease Detection
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground px-2 text-xs uppercase tracking-widest">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="group"
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex w-full items-center gap-3 cursor-pointer rounded-md px-2 py-2 hover:bg-accent transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profilePicture || "/placeholder.svg"} />
                <AvatarFallback>
                  {user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none">
                  {user?.username || user?.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.role}
                </span>
              </div>
              <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" className="w-[220px]">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-red-500">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
