"use client";

import { useState, useEffect } from "react";
import MeetingCard from "@/components/notices/meetingCard";
import MeetingInfoModal from "@/components/notices/meetingInfoModal";
import MeetingCreateModal from "@/components/notices/meetingCreateModal";
import MeetingDisableModal from "@/components/notices/meetingDisableModal";
import { useSession } from "next-auth/react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

interface Student {
  id: number;
  user?: User | null;
}

interface Meeting {
  id: number;
  topic: string;
  message: string;
  createdAt?: string | Date;
  active: boolean;
  student?: Student | null;
  user?: User | null;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDisableModal, setOpenDisableModal] = useState(false);

  const { data: session } = useSession();

  const fetchMeetings = async () => {
    try {
      const res = await fetch("/api/notices/meetings");
      const data = await res.json();
      setMeetings(data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleAddNewMeeting = () => {
    setOpenCreateModal(true);
  };

  const handleViewInfo = (id: number) => {
    const meeting = meetings.find((t) => t.id === id);
    if (meeting) {
      setSelectedMeeting(meeting);
      setOpenInfoModal(true);
    }
  };

  const handleDisable = async (id: number) => {
    const meeting = meetings.find((t) => t.id === id);
    if (meeting) {
      setSelectedMeeting(meeting);
      setOpenDisableModal(true);
    }
  };

  return (
    <div className="w-full h-full overflow-x-auto rounded-md">
      {(session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER") && (

        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddNewMeeting}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
          >
            Nueva reunión
          </button>
        </div>
      )}

      <div className="space-y-3">
        {meetings.map((meeting) => (
          <MeetingCard
            key={meeting.id}
            {...meeting}
            onViewInfo={handleViewInfo}
            onDisable={handleDisable}
          />
        ))}
      </div>

      {selectedMeeting && (
        <>
          <MeetingInfoModal
            open={openInfoModal}
            onClose={() => setOpenInfoModal(false)}
            topic={selectedMeeting.topic}
            message={selectedMeeting.message}
            student={selectedMeeting.student}
            user={selectedMeeting.user}
            createdAt={selectedMeeting.createdAt}
          />

          <MeetingDisableModal
            id={selectedMeeting.id}
            title={selectedMeeting.topic}
            active={selectedMeeting.active}
            open={openDisableModal}
            onClose={() => setOpenDisableModal(false)}
            onUpdated={fetchMeetings}
          />
        </>
      )}

      <MeetingCreateModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreated={fetchMeetings}
      />
    </div>
  );
}
