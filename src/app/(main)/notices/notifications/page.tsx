"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import NotificationCard from "@/components/notificationCard";
import NotificationDisableModal from "@/components/notificationDisableModal";
import NotificationInfoModal from "@/components/notificationInfoModal";

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

interface CourseParallel {
  course: {
    name: string;
  };
  parallel: {
    name: string;
  };
}

interface Notification {
  id: number;
  title: string;
  message: string;
  userId: number | null;
  courseParallelId: number | null;
  active: boolean;
  date: Date;
  user: User | null;
  courseParallel: CourseParallel | null;
  creatorId: number;
  creator: User;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openDisableModal, setOpenDisableModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const fetchNotifications = async () => {
    const res = await fetch("/api/notices/notifications");
    const data = await res.json();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAddNewNotification = () => {
    // This will be implemented later when we create the form
    console.log("Add new notification");
  };

  const handleViewInfo = (id: number) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      setSelectedNotification(notification);
      setOpenInfoModal(true);
    }
  };

  const handleDisable = (id: number) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      setSelectedNotification(notification);
      setOpenDisableModal(true);
    }
  };

  return (
    <div className="w-full h-full overflow-x-auto rounded-md">
      {/* Only show add button for admin and teacher */}
      {(session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER") && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddNewNotification}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
          >
            Nuevo comunicado
          </button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            id={notification.id}
            title={notification.title}
            message={notification.message}
            userId={notification.userId}
            courseParallelId={notification.courseParallelId}
            active={notification.active}
            user={notification.user}
            courseParallel={notification.courseParallel}
            creatorId={notification.creatorId}
            creator={notification.creator}
            onViewInfo={handleViewInfo}
            onDisable={handleDisable}
          />
        ))}
      </div>

      {selectedNotification && (
        <>
          <NotificationDisableModal
            id={selectedNotification.id}
            title={selectedNotification.title}
            active={selectedNotification.active}
            open={openDisableModal}
            onClose={() => setOpenDisableModal(false)}
            onUpdated={fetchNotifications}
          />
          <NotificationInfoModal
            open={openInfoModal}
            onClose={() => setOpenInfoModal(false)}
            title={selectedNotification.title}
            message={selectedNotification.message}
            userId={selectedNotification.userId}
            courseParallelId={selectedNotification.courseParallelId}
            user={selectedNotification.user}
            courseParallel={selectedNotification.courseParallel}
            creator={selectedNotification.creator}
            date={selectedNotification.date}
          />
        </>
      )}
    </div>
  );
}