"use client";

import { Card } from "flowbite-react";
import { HiEye, HiTrash } from "react-icons/hi";
import { useSession } from "next-auth/react";

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

interface NotificationProps {
  id: number;
  title: string;
  message: string;
  userId: number | null;
  courseParallelId: number | null;
  active: boolean;
  user?: User | null;
  courseParallel?: CourseParallel | null;
  creatorId: number;
  creator?: User;
  onViewInfo: (id: number) => void;
  onDisable: (id: number) => void;
}

export default function NotificationCard({
  id,
  title,
  message,
  userId,
  courseParallelId,
  active,
  user,
  courseParallel,
  creator,
  onViewInfo,
  onDisable,
}: NotificationProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const currentUserId = parseInt(session?.user?.id || "0");

  // Function to determine the destinatary text
  const getDestinataryText = () => {
    if (userId) {
      return user ? `${user.firstName} ${user.lastName}` : "Usuario no encontrado";
    }
    if (courseParallelId) {
      return courseParallel 
        ? `${courseParallel.course.name} ${courseParallel.parallel.name}`
        : "Curso no encontrado";
    }
    return "Para todos";
  };

  // For admin/teacher show destinatary, for others show creator
  const secondColumnText = (userRole === "ADMIN" || userRole === "TEACHER")
    ? getDestinataryText()
    : creator
      ? `${creator.firstName} ${creator.lastName}`
      : "Usuario no encontrado";

  return (
    <Card className="max-w-full">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            {/* Title column */}
            <div className="flex-1">
              <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {title}
              </h5>
            </div>
            
            {/* Destinatary/Creator column */}
            <div className="flex-1">
              <p className="font-normal text-gray-700 dark:text-gray-400">
                {secondColumnText}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewInfo(id)}
            className="text-gray-500 hover:text-primary-500"
          >
            <HiEye className="w-5 h-5" />
          </button>

          {/* Only show disable button for admin/teacher if they created the notification */}
          {(userRole === "ADMIN" || userRole === "TEACHER") && 
           creator?.id === currentUserId && (
            <button
              onClick={() => onDisable(id)}
              className={`${
                active
                  ? "text-red-500 hover:text-red-600"
                  : "text-green-500 hover:text-green-600"
              }`}
            >
              <HiTrash className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}