"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import NotificationCard from "@/components/notices/notificationCard";
import NotificationDisableModal from "@/components/notices/notificationDisableModal";
import NotificationInfoModal from "@/components/notices/notificationInfoModal";
import NotificationCreateModal from "@/components/notices/notificationCreateModal";

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
  active: boolean;
  date: Date;
  user: User | null;
  courseParallel: CourseParallel | null;
  creator: User;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openDisableModal, setOpenDisableModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
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
    setOpenCreateModal(true);
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

      <table className="w-full table-auto text-left text-sm text-gray-700">
        <thead className="bg-gray-100">
          <tr className="border-b border-gray-300">
            <th className="px-6 py-3 w-1/2 font-semibold text-gray-800">
              Título
            </th>
            <th className="px-6 py-3 w-1/4 font-semibold text-gray-800">
              {session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER"
                ? "Destinatario"
                : "Remitente"}
            </th>
            <th className="px-6 py-3 w-auto font-semibold text-gray-800">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <br />

      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            id={notification.id}
            title={notification.title}
            active={notification.active}
            user={notification.user}
            courseParallel={notification.courseParallel}
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
            user={selectedNotification.user}
            courseParallel={selectedNotification.courseParallel}
            creator={selectedNotification.creator}
            date={selectedNotification.date}
          />
        </>
      )}

      <NotificationCreateModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreated={fetchNotifications}
      />
    </div>
  );
}