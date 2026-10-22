"use client";

import { createContext, useContext, useState } from "react";
import type { CourseSlug } from "@/lib/site";

// Lets the course cards preselect a course in the booking section.
type CourseSelection = {
  course: CourseSlug;
  setCourse: (course: CourseSlug) => void;
};

const CourseSelectionContext = createContext<CourseSelection | null>(null);

export function CourseSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [course, setCourse] = useState<CourseSlug>("adulti");
  return (
    <CourseSelectionContext.Provider value={{ course, setCourse }}>
      {children}
    </CourseSelectionContext.Provider>
  );
}

export function useCourseSelection() {
  const ctx = useContext(CourseSelectionContext);
  if (!ctx) {
    throw new Error("useCourseSelection must be used inside CourseSelectionProvider");
  }
  return ctx;
}
