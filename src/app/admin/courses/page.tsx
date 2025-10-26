"use client";

import { useState, useEffect } from "react";
import CourseCard from "@/components/courseCard";
import CourseDisableModal from "@/components/courseDisableModal";


interface Parallel {
  id: number;
  name: string;
  active?: boolean;
}


interface Course {
  id: number;
  name: string;
  parallels: Parallel[];
  active: boolean;
}


export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [allParallels, setAllParallels] = useState<Parallel[]>([]);
  const [nextTempId, setNextTempId] = useState(-1); // Negative IDs for new courses
  const [openDisableModal, setOpenDisableModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: number; name: string; active: boolean } | null>(null);

  // Fetch all parallels (A, B, C, ...)
  const fetchParallels = async () => {
    try {
      const res = await fetch("/api/parallels");
      if (res.ok) {
        const data = await res.json();
        setAllParallels(data);
      } else {
        setAllParallels([
          { id: 1, name: "A" },
          { id: 2, name: "B" },
          { id: 3, name: "C" },
        ]);
      }
    } catch {
      setAllParallels([
        { id: 1, name: "A" },
        { id: 2, name: "B" },
        { id: 3, name: "C" },
      ]);
    }
  };

  const fetchCourses = async () => {
    const res = await fetch("/api/courses/all");
    const data = await res.json();
    setCourses(data);
  };

  useEffect(() => {
    fetchCourses();
    fetchParallels();
  }, []);

  const handleAddNewCourse = () => {
    setCourses((prevCourses) => [
      {
        id: nextTempId,
        name: "",
        parallels: [],
        active: true,
      },
      ...prevCourses,
    ]);
    setNextTempId((prev) => prev - 1);
  };

  const handleUpdateCourse = async (
    id: number,
    data: { name: string; parallelIds: number[] }
  ) => {
    if (!data.name.trim() || data.parallelIds.length === 0) return;
    if (id < 0) {
      // Create new course
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, parallelIds: data.parallelIds }),
      });
      if (res.ok) {
        fetchCourses();
      }
    } else {
      // Update existing course
      const res = await fetch(`/api/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, parallelIds: data.parallelIds }),
      });
      if (res.ok) {
        fetchCourses();
      }
    }
  };

  const handleToggleCourseStatus = async (id: number) => {
    const course = courses.find(c => c.id === id);
    if (course) {
      setSelectedCourse({
        id: course.id,
        name: course.name,
        active: course.active
      });
      setOpenDisableModal(true);
    }
  };

  return (
    <div className="w-full h-full overflow-x-auto rounded-md">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddNewCourse}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
        >
          Nuevo curso
        </button>
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            name={course.name}
            parallels={course.parallels}
            active={course.active}
            allParallels={allParallels}
            startEditing={course.id < 0}
            onUpdate={handleUpdateCourse}
            onDisable={handleToggleCourseStatus}
          />
        ))}
      </div>
      <CourseDisableModal
        id={selectedCourse?.id || null}
        name={selectedCourse?.name || ""}
        active={selectedCourse?.active || false}
        open={openDisableModal}
        onClose={() => setOpenDisableModal(false)}
        onUpdated={fetchCourses}
      />
    </div>
  );
}
