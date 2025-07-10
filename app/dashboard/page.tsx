"use client";

import { useAuth } from "@/lib/auth/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  WormIcon as Virus,
  Pill,
  MessageSquare,
  Users,
  Bell,
  MessageCircle,
} from "lucide-react";
import { useAppContext } from "@/Config/AppProvider";

export default function DashboardPage() {
  const { user, hasRole } = useAuth();

  const {
    farmerStatistics,
    farmerStatisticsLoading,
    farmerStatisticsError,
    farmerStatisticsErrorMessage,
    agronomistStatistics,
    agronomistStatisticsLoading,
    agronomistStatisticsError,
    agronomistStatisticsErrorMessage,
    notificationsData,
    notificationsLoading,
    notificationsError,
    notificationsErrorMessage,
    refetchNotifications,
  } = useAppContext();

  const getRoleSpecificStats = () => {
    if (hasRole("FARMER")) {
      return [
        {
          title: "My Detections",
          value: farmerStatistics?.data?.totalDetections || "0",
          description: "Disease detections uploaded",
          icon: Camera,
          color: "bg-blue-500",
        },
        {
          title: "Advice Received",
          value: farmerStatistics?.data?.adviceStats?.total || "0",
          description: "Expert recommendations",
          icon: MessageSquare,
          color: "bg-green-500",
        },
        {
          title: "Feedback Submitted",
          value: farmerStatistics?.data?.feedbackStatus?.total || "0",
          description: "Feedback on advice",
          icon: MessageCircle,
          color: "bg-yellow-500",
        },
        {
          title: "Notifications",
          value:
            notificationsData?.data?.filter((n) => !n.isRead).length || "0",
          description: "Unread notifications",
          icon: Bell,
          color: "bg-orange-500",
        },
      ];
    } else if (hasRole("AGRONOMIST")) {
      return [
        {
          title: "Detections to Review",
          value: agronomistStatistics?.data?.recentDetections.count || "0",
          description: "Pending farmer detections",
          icon: Camera,
          color: "bg-blue-500",
        },
        {
          title: "Total diseases",
          value: agronomistStatistics?.data?.totalDiseases || "0",
          description: "Diseases tracked in the system",
          icon: Virus,
        },

        {
          title: "Medicines Managed",
          value: agronomistStatistics?.data?.totalMedicines || "0",
          description: "Treatment options available",
          icon: Pill,
          color: "bg-purple-500",
        },

        // {
        //   title: "Advice Given",
        //   value: agronomistStatistics?.data?.advicePerformance?.total || "0",
        //   description: "Expert recommendations provided",
        //   icon: MessageSquare,
        //   color: "bg-green-500",
        // },
        // {
        //   title: "Feedback Responses",
        //   value: agronomistStatistics?.data?.farmerStats?.activeFarmers || "0",
        //   description: "Responses to farmer feedback",
        //   icon: MessageCircle,
        //   color: "bg-yellow-500",
        // },
      ];
    } else {
      return [
        {
          title: "Total Users",
          value: "2,456",
          description: "Registered users",
          icon: Users,
          color: "bg-blue-500",
        },
        {
          title: "Total Detections",
          value: "1,234",
          description: "Disease detections",
          icon: Camera,
          color: "bg-green-500",
        },
        {
          title: "Diseases Tracked",
          value: "23",
          description: "Different disease types",
          icon: Virus,
          color: "bg-red-500",
        },
        {
          title: "System Health",
          value: "99.9%",
          description: "Uptime this month",
          icon: Bell,
          color: "bg-purple-500",
        },
      ];
    }
  };

  const getRoleBasedWelcome = () => {
    if (hasRole("FARMER")) {
      return {
        title: "Farmer Dashboard",
        subtitle: "Upload images and get expert advice on tomato diseases",
      };
    } else if (hasRole("AGRONOMIST")) {
      return {
        title: "Agronomist Dashboard",
        subtitle: "Review detections and provide expert guidance to farmers",
      };
    } else {
      return {
        title: "Admin Dashboard",
        subtitle: "Manage the entire tomato disease detection system",
      };
    }
  };

  const stats = getRoleSpecificStats();
  const welcome = getRoleBasedWelcome();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{welcome.title}</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username || user?.email}
          </p>
          <p className="text-sm text-muted-foreground">{welcome.subtitle}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {user?.role}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hasRole("FARMER") ? (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        New detection uploaded
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Advice received</p>
                      <p className="text-xs text-muted-foreground">
                        1 hour ago
                      </p>
                    </div>
                  </div>
                </>
              ) : hasRole("AGRONOMIST") ? (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        New detection to review
                      </p>
                      <p className="text-xs text-muted-foreground">
                        5 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Advice provided</p>
                      <p className="text-xs text-muted-foreground">
                        30 minutes ago
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        System alert resolved
                      </p>
                      <p className="text-xs text-muted-foreground">
                        10 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registered</p>
                      <p className="text-xs text-muted-foreground">
                        1 hour ago
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {hasRole("FARMER") && (
                <>
                  <button className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                    <Camera className="h-4 w-4" />
                    <span className="text-sm">Upload Detection</span>
                  </button>
                  <button className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">Submit Feedback</span>
                  </button>
                </>
              )}
              {hasRole("AGRONOMIST") && (
                <>
                  <button className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">Create Advice</span>
                  </button>
                  <button className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                    <Pill className="h-4 w-4" />
                    <span className="text-sm">Add Medicine</span>
                  </button>
                </>
              )}
              {hasRole("ADMIN") && (
                <>
                  <button className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Manage Users</span>
                  </button>
                  <button className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                    <Virus className="h-4 w-4" />
                    <span className="text-sm">Add Disease</span>
                  </button>
                </>
              )}
              <button className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                <Bell className="h-4 w-4" />
                <span className="text-sm">View Notifications</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
