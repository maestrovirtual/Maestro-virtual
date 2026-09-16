"use client";

import { useMemo, useState } from "react";
import { BookOpen, SearchX } from "lucide-react";

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







  // Empty state global: el backend devolvió 0 cursos publicados (MV-27).
  if (courses.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BookOpen className="h-8 w-8" aria-hidden />
        </div>
        <h3 className="font-heading text-2xl font-bold text-text-primary">
          Aún no hay cursos publicados
        </h3>
        <p className="mt-3 text-text-secondary">
          Estamos preparando nuevos cursos. Vuelve pronto para descubrirlos.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-10">
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Empty state por filtro: hay cursos pero ninguno en la categoría elegida. */}
      {filteredCourses.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <SearchX className="h-7 w-7" aria-hidden />
          </div>
          <p className="text-text-secondary">
            No encontramos cursos en la categoría{' '}
            <span className="font-semibold text-text-primary">
              {selectedCategory}
            </span>
            . Prueba con otra.
          </p>
        </div>
      ) : (
        <CourseGrid courses={filteredCourses} />
      )}
    </section>
  );

}