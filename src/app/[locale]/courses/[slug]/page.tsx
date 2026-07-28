import { notFound } from "next/navigation";

import { courses } from "@/features/courses/data/courses";


import CourseHero from "@/features/courses/course-details/CourseHero";
import CourseStats from "@/features/courses/course-details/CoursesStats";
import CourseDescription from "@/features/courses/course-details/CourseDescription";
import CourseHighlights from "@/features/courses/course-details/CourseHighlights";
import CourseTestimonials from "@/features/courses/course-details/CourseTestimonials";
import CourseCTA from "@/features/courses/course-details/CourseCTA";

type CoursePageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function CoursePage({
  params,
}: CoursePageProps) {
  const { slug } = await params;

  const course = courses.find(
    (course) => course.slug === slug
  );

  if (!course) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <CourseHero course={course} />
      <CourseStats course={course} />
      <CourseDescription course={course} />
      <CourseHighlights course={course} />
      <CourseTestimonials course={course} />
      <CourseCTA course={course} />


      {/*
      

      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-14 lg:flex-row">
        <CourseDescription course={course} />
        <CourseVideo course={course} />
      </div>

      <CourseHighlights course={course} />
      */}
    </main>
  );
}