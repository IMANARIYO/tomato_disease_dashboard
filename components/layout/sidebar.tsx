"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
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
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Camera,
  WormIcon as Virus,
  Pill,
  MessageSquare,
  MessageCircle,
  Bell,
  Users,
  ChevronUp,
  LogOut,
  Settings,
} from "lucide-react"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: ["*"], // All roles
  },
  {
    title: "Detections",
    url: "/dashboard/detections",
    icon: Camera,
    roles: ["FARMER", "AGRONOMIST", "ADMIN"], // Updated to match specs
  },
  {
    title: "Diseases",
    url: "/dashboard/diseases",
    icon: Virus,
    roles: ["ADMIN"], // Only Admin can access diseases
  },
  {
    title: "Medicines",
    url: "/dashboard/medicines",
    icon: Pill,
    roles: ["AGRONOMIST", "ADMIN"], // Agronomist and Admin only
  },
  {
    title: "Advices",
    url: "/dashboard/advices",
    icon: MessageSquare,
    roles: ["FARMER", "AGRONOMIST", "ADMIN"], // All three main roles
  },
  {
    title: "Feedback",
    url: "/dashboard/feedback",
    icon: MessageCircle,
    roles: ["FARMER", "AGRONOMIST", "ADMIN"], // All three main roles
  },
  {
    title: "Feedback Responses",
    url: "/dashboard/feedback-responses",
    icon: MessageCircle,
    roles: ["AGRONOMIST", "ADMIN"], // Only Agronomist and Admin
  },
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: Bell,
    roles: ["*"], // All roles
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
    roles: ["ADMIN"], // Admin only
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout, hasRole } = useAuth()

  const filteredItems = navigationItems.filter((item) => item.roles.includes("*") || hasRole(item.roles))

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Virus className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">TomatoAI</span>
            <span className="text-xs text-muted-foreground">Disease Detection</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{user?.username || user?.email}</span>
                    <span className="text-xs text-muted-foreground">{user?.role}</span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
