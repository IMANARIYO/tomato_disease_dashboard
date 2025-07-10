export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: NotificationItem[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string; // or Date if you parse it
  updatedAt: string; // or Date if you parse it
}
