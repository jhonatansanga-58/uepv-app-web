"use client";

import React, { useEffect, useState } from 'react';
import SubjectCard from '@/components/subjectCard';
import SubjectDisableModal from '@/components/subjectDisableModal';
import AssignCoursesModal from '@/components/assignCoursesModal';

interface Subject {
  id: number;
  name: string;
  active: boolean;
  courses: Course[];
}

interface Course {
  id: number;
  name: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [nextTempId, setNextTempId] = useState(-1);
  const [openDisableModal, setOpenDisableModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<{ id: number; name: string; active: boolean } | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSubjectId, setAssignSubjectId] = useState<number | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const res = await fetch("/api/subjects");
    const data = await res.json();
    setSubjects(data);
  };

  const handleAddNewSubject = () => {
    setSubjects((prevSubjects) => [
      {
        id: nextTempId,
        name: "",
        active: true,
        courses: [],
      },
      ...prevSubjects,
    ]);
    setNextTempId((prev) => prev - 1);
  };

  const handleUpdateSubject = async (
    id: number,
    data: { name: string; }
  ) => {
    if (!data.name.trim()) return;
    if (id < 0) {
      // Create new Subject
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      });
      if (res.ok) {
        fetchSubjects();
      }
    } else {
      // Update existing Subject
      const res = await fetch(`/api/subjects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      });
      if (res.ok) {
        fetchSubjects();
      }
    }
  };

  const handleToggleSubjectStatus = async (id: number) => {
    const subject = subjects.find(c => c.id === id);
    if (subject) {
      setSelectedSubject({
        id: subject.id,
        name: subject.name,
        active: subject.active
      });
      setOpenDisableModal(true);
    }
  };

  const handleViewCourses = (id: number) => {
    setAssignSubjectId(id);
    setAssignModalOpen(true);
  };

  return (
    <div className="w-full h-full overflow-x-auto rounded-md">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddNewSubject}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
        >
          Nueva materia
        </button>
      </div>

      <div className="space-y-3">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            id={subject.id}
            name={subject.name}
            courses={subject.courses}
            active={subject.active}
            startEditing={subject.id < 0}
            onUpdate={handleUpdateSubject}
            onDisable={handleToggleSubjectStatus}
            onViewCourses={handleViewCourses}
          />
        ))}
      </div>
      <AssignCoursesModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        subjectId={assignSubjectId ?? 0}
        onConfirmCourses={async (courseIds: number[]) => {
          if (!assignSubjectId) return;
          try {
            await fetch(`/api/subjects/courses/${assignSubjectId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ courseIds }),
            });
            // refresh subjects to reflect changes
            fetchSubjects();
          } catch (err) {
            console.error('Error assigning courses', err);
          }
        }}
      />
      <SubjectDisableModal
        id={selectedSubject?.id || null}
        name={selectedSubject?.name || ""}
        active={selectedSubject?.active || false}
        open={openDisableModal}
        onClose={() => setOpenDisableModal(false)}
        onUpdated={fetchSubjects}
      />
    </div>
  );
};
