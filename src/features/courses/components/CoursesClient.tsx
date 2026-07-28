"use client";

import { useMemo, useState } from "react";

import CategoryFilter from "./CategoryFilter";
import CourseGrid from "./CourseGrid";

import type { Course } from "../data/courses";



type CoursesClientProps = {
  courses: Course[];
};



export default function CoursesClient({
  courses,
}: CoursesClientProps) {


  const [selectedCategory, setSelectedCategory] =
    useState("Todos");



  /*
    Generamos categorías automáticamente
    desde courses.ts
  */


  const categories = useMemo(() => {

    const uniqueCategories = Array.from(
      new Set(
        courses.flatMap(
          course => course.categories
        )
      )
    );


    return [
      "Todos",
      ...uniqueCategories
    ];


  }, [courses]);






  const filteredCourses = useMemo(() => {


    if(selectedCategory === "Todos"){
      return courses;
    }


    return courses.filter(
      course =>
        course.categories.includes(selectedCategory)
    );


  },[
    courses,
    selectedCategory
  ]);







  return (

    <section

      className="
      space-y-10
      "

    >



      <CategoryFilter

        categories={categories}

        selectedCategory={selectedCategory}

        onSelect={setSelectedCategory}

      />





      <CourseGrid

        courses={filteredCourses}

      />





    </section>


  );

}