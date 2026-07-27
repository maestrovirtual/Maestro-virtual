"use client";

import Image from "next/image";
import { ArrowRight, Clock3, Monitor, Award } from "lucide-react";
import { motion } from "framer-motion";

import Container from "@/components/ui/Container";

import CourseBackground from "../components/CourseBackground";

import type { Course } from "../data/courses";


type CourseHeroProps = {
  course: Course;
};



function hexToRgba(hex: string, alpha: number) {

  const cleanHex = hex.replace("#", "");

  const bigint = parseInt(cleanHex, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;


  return `rgba(${r}, ${g}, ${b}, ${alpha})`;

}




export default function CourseHero({
  course,
}: CourseHeroProps) {


  return (

    <section
      className="
      relative
      overflow-hidden
      min-h-[850px]
      flex
      items-center
      "
      style={{
        background:
        `
        linear-gradient(
        180deg,
        ${hexToRgba(course.color,0.22)} 0%,
        transparent 65%
        )
        `
      }}
    >



      {/* COURSE BACKGROUND IDENTITY */}

      <CourseBackground
        pattern={course.backgroundPattern}
        color={course.color}
      />





      {/* COLOR GLOW */}

      <motion.div

        className="
        absolute
        top-[-200px]
        left-1/2
        -translate-x-1/2
        w-[650px]
        h-[650px]
        rounded-full
        blur-3xl
        pointer-events-none
        "
        
        animate={{
          scale:[1,1.08,1],
          opacity:[0.35,0.5,0.35]
        }}

        transition={{
          duration:8,
          repeat:Infinity,
          ease:"easeInOut"
        }}

        style={{
          backgroundColor:
          hexToRgba(course.color,0.35)
        }}

      />







      {/* GIANT BACKGROUND WORD */}


      <motion.div

        initial={{
          opacity:0,
          y:-40
        }}

        animate={{
          opacity:1,
          y:0
        }}

        transition={{
          duration:1.2
        }}

        className="
        absolute
        top-24
        left-0
        right-0
        flex
        justify-center
        select-none
        pointer-events-none
        overflow-hidden
        "

      >

        <span
        className={`
        font-heading
        leading-none
        uppercase
        text-center
        max-w-full
        px-4
        ${
        course.title.length > 18
        ? "text-[80px] md:text-[130px] xl:text-[170px]"
        : course.title.length > 10
        ? "text-[110px] md:text-[180px] xl:text-[230px]"
        : "text-[150px] md:text-[230px] xl:text-[280px]"
        }
        `}
        style={{
        color: hexToRgba(course.color,0.07)
        }}
        >
        {course.title}
        </span>


      </motion.div>








      <Container>

        <div
          className="
          relative
          z-10
          grid
          lg:grid-cols-2
          gap-12
          items-center
          pt-32
          pb-20
          "
        >






          {/* LEFT CONTENT */}


          <div
          >




            {/* BREADCRUMB */}


            <motion.div

              initial={{
                opacity:0,
                y:20
              }}

              animate={{
                opacity:1,
                y:0
              }}

              transition={{
                duration:.5
              }}

              className="
              flex
              items-center
              gap-2
              text-sm
              text-text-secondary
              mb-8
              "
            >

              <span>
                Cursos
              </span>

              <span>
                /
              </span>

              <span
                className="
                font-medium
                "
                style={{
                  color:course.color
                }}
              >
                {course.title}
              </span>


            </motion.div>








            {/* BADGES */}


            <motion.div

              initial={{
                opacity:0,
                y:20
              }}

              animate={{
                opacity:1,
                y:0
              }}

              transition={{
                delay:.15,
                duration:.5
              }}

              className="
              flex
              flex-wrap
              gap-3
              mb-6
              "
            >


              <Badge>
                {course.type}
              </Badge>


              <Badge>
                {course.categories}
              </Badge>


              <Badge>
                Etapa {course.stage}
              </Badge>


            </motion.div>

            



            {/* TITLE */}


            <motion.h1

              initial={{
                opacity:0,
                y:30
              }}

              animate={{
                opacity:1,
                y:0
              }}

              transition={{
                delay:.25,
                duration:.7
              }}

              className="
              font-heading
              text-5xl
              md:text-6xl
              xl:text-7xl
              leading-[0.95]
              tracking-tight
              text-text-primary
              "
            >

              {course.title}

            </motion.h1>








            {/* DESCRIPTION */}


            <motion.p

              initial={{
                opacity:0,
                y:25
              }}

              animate={{
                opacity:1,
                y:0
              }}

              transition={{
                delay:.4,
                duration:.6
              }}

              className="
              mt-6
              max-w-xl
              text-lg
              leading-8
              text-text-secondary
              "
            >

              {course.shortDescription}

            </motion.p>









            {/* CTA */}


            <motion.div

              initial={{
                opacity:0,
                y:20
              }}

              animate={{
                opacity:1,
                y:0
              }}

              transition={{
                delay:.55,
                duration:.6
              }}

              className="
              mt-8
              flex
              flex-wrap
              gap-4
              "

            >


              <button

                className="
                group
                flex
                items-center
                gap-2
                rounded-full
                px-7
                py-3.5
                font-semibold
                text-white
                shadow-lg
                transition-all
                hover:-translate-y-1
                "

                style={{
                  backgroundColor:course.color
                }}

              >

                Comenzar curso


                <ArrowRight

                  size={18}

                  className="
                  transition-transform
                  group-hover:translate-x-1
                  "

                />


              </button>



              <button

                className="
                rounded-full
                border
                border-border
                bg-white/70
                backdrop-blur
                px-7
                py-3.5
                font-semibold
                text-text-primary
                transition-all
                hover:-translate-y-1
                "

              >

                Ver contenido

              </button>



            </motion.div>









            {/* QUICK STATS */}


            <motion.div

              initial={{
                opacity:0
              }}

              animate={{
                opacity:1
              }}

              transition={{
                delay:.7
              }}

              className="
              mt-10
              flex
              flex-wrap
              gap-3
              "

            >


              <HeroStat
                icon={<Clock3 />}
                text={course.duration}
                color={course.color}
                />

                <HeroStat
                icon={<Award />}
                text={`Etapa ${course.stage}`}
                color={course.color}
                />

                <HeroStat
                icon={<Monitor />}
                text={course.modality}
                color={course.color}
                />


            </motion.div>







          </div>









          {/* RIGHT IMAGE */}



          <motion.div

            initial={{
              opacity:0,
              x:-80
            }}

            animate={{
              opacity:1,
              x:0
            }}

            transition={{
              duration:.9,
              delay:.35,
              ease:"easeOut"
            }}

            className="
            relative
            flex
            justify-center
            "

          >



            {/* IMAGE GLOW */}


            <div

              className="
              absolute
              inset-10
              rounded-full
              blur-3xl
              "

              style={{
                backgroundColor:
                hexToRgba(course.color,0.35)
              }}

            />







            {/* IMAGE CARD */}


            <motion.div

            animate={{
            y:[0,-12,0]
            }}

            transition={{
            duration:5,
            repeat:Infinity,
            ease:"easeInOut"
            }}

            className="
            relative
            z-10
            h-[420px]
            w-[420px]
            rounded-[3rem]
            
            border-white/40
            bg-white/60
            backdrop-blur-xl
            shadow-2xl
            overflow-hidden
            "

            >



             {course.image || course.icon ? (

            <Image
            src={course.image || course.icon!}
            alt={course.title}
            fill
            className="
            object-contain
            scale-180
            drop-shadow-xl
            "
            />

            ) : (

            <div
            className="
            flex
            h-full
            w-full
            items-center
            justify-center
            "
            >

            <span
            className="
            text-7xl
            font-heading
            opacity-20
            "
            style={{
            color:course.color
            }}
            >
            {course.title.charAt(0)}
            </span>

            </div>

            )}


            </motion.div>



          </motion.div>






        </div>


      </Container>


    </section>

  );

}








function Badge({
  children,
}:{
  children:React.ReactNode;
}){

  return (

    <span

      className="
      rounded-full
      border
      border-white/40
      bg-white/70
      backdrop-blur-md
      px-4
      py-2
      text-xs
      font-semibold
      uppercase
      tracking-wider
      text-text-primary
      shadow-sm
      "

    >

      {children}

    </span>

  );

}









function HeroStat({

  icon,
  text,
  color,

}:{

  icon:React.ReactNode;
  text:string;
  color:string;

}){


  return (

    <div

      className="
      flex
      items-center
      gap-2
      rounded-full
      border
      border-white/40
      bg-white/70
      backdrop-blur-md
      px-4
      py-2
      text-sm
      font-medium
      "

    >

      <span
        style={{
          color
        }}
      >

        {icon}

      </span>


      <span>

        {text}

      </span>


    </div>

  );

}