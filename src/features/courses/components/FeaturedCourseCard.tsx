import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

import type { Course } from "../data/courses";
import CourseBackground from "./CourseBackground";


type FeaturedCourseCardProps = {
  course: Course;
};


export default function FeaturedCourseCard({
  course,
}: FeaturedCourseCardProps) {

  const content = (
    <div
      className="
      relative
      overflow-hidden
      rounded-3xl
      bg-white/80
      dark:bg-white/5
      backdrop-blur-xl
      border
      border-white/40
      dark:border-white/10
      p-8
      shadow-xl
      transition-all
      duration-500
      group-hover:-translate-y-3
      group-hover:shadow-2xl
      h-full
      "
    >

      <CourseBackground
        pattern={course.backgroundPattern}
        color={course.color}
      />


      {/* COLOR EFFECT */}

      <div
        className="
        absolute
        inset-0
        opacity-0
        group-hover:opacity-20
        transition
        duration-500
        "
        style={{
          background:
          `linear-gradient(135deg, ${course.color}, transparent)`
        }}
      />



      <div className="relative">


        {/* ICON */}

        <div
          className="
          w-14
          h-14
          rounded-2xl
          flex
          items-center
          justify-center
          shadow-md
          transition-transform
          duration-300
          group-hover:scale-110
          "
          style={{
            backgroundColor: course.color
          }}
        >

          {course.icon ? (

          <Image
          src={course.icon}
          alt={course.title}
          width={38}
          height={38}
          className="object-contain"
          />

          ) : (

          <div
          className="
          h-[38px]
          w-[38px]
          rounded-lg
          flex
          items-center
          justify-center
          "
          style={{
          backgroundColor:`${course.color}22`
          }}
          >
          </div>

          )}

        </div>



        <h3
          className="
          mt-3
          text-2xl
          font-bold
          text-text-primary
          "
        >
          {course.title}
        </h3>



        <p
          className="
          mt-3
          text-muted-foreground
          "
        >
          {course.shortDescription}
        </p>



        <div
          className="
          mt-4
          flex
          items-center
          gap-2
          font-semibold
          transition-transform
          duration-300
          group-hover:translate-x-1
          "
          style={{
            color: course.color
          }}
        >

          Explorar curso

          <ArrowRight size={18}/>

        </div>


      </div>


    </div>
  );


  if(!course.clickable){
    return (
      <div className="opacity-75">
        {content}
      </div>
    )
  }


  return (
    <Link
      href={`/courses/${course.slug}`}
      className="
      group
      block
      h-full
      focus:outline-none
      focus-visible:ring-2
      focus-visible:ring-primary
      "
    >
      {content}
    </Link>
  )

}