import { useState } from "react";
import { Bell, Heart, MessageCircle, User, Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";

interface NotificationWithUser extends Notification {
  sender?: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

export function NotificationDropdown() {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<NotificationWithUser[]>({
    queryKey: ["/api/notifications"],
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest("/api/notifications/mark-all-read", "POST", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Mark single as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest(`/api/notifications/${notificationId}/read`, "PUT", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <User className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-accent transition-colors"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96 overflow-y-auto modern-dropdown"
        data-testid="dropdown-notifications"
      >
        <div className="flex items-center justify-between p-3 border-b">
          <DropdownMenuLabel className="font-semibold text-base">
            Notifikasi
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="text-xs"
              data-testid="button-mark-all-read"
            >
              <Check className="h-3 w-3 mr-1" />
              Tandai semua terbaca
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Memuat notifikasi...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Belum ada notifikasi</p>
            <p className="text-sm">Notifikasi akan muncul di sini</p>
          </div>
        ) : (
          <div className="py-2">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-4 cursor-pointer hover:bg-accent/50 border-l-4 transition-all ${
                  notification.isRead 
                    ? 'border-l-transparent opacity-75' 
                    : 'border-l-primary bg-accent/30'
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsReadMutation.mutate(notification.id);
                  }
                }}
                data-testid={`notification-${notification.id}`}
              >
                <div className="flex items-start space-x-3 w-full">
                  {notification.sender ? (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage 
                        src={notification.sender.avatar} 
                        alt={notification.sender.displayName} 
                      />
                      <AvatarFallback className="text-xs">
                        {notification.sender.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getNotificationIcon(notification.type)}
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium mt-1 text-foreground">
                      {notification.message}
                    </p>

                    {notification.metadata && typeof notification.metadata === 'object' && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {(notification.metadata as { postPreview?: string })?.postPreview}
                      </p>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full text-center text-xs"
                data-testid="button-view-all-notifications"
              >
                Lihat semua notifikasi
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}