"use client";

import {
  CalendarDays,
  Clock3,
  Users,
  Monitor,
} from "lucide-react";

import { motion } from "framer-motion";

import Container from "@/components/ui/Container";

import type { Course } from "../data/courses";


type CourseStatsProps = {
  course: Course;
};



export default function CourseStats({
  course,
}: CourseStatsProps) {


const stats = [
  {
    icon:<CalendarDays size={24}/>,
    label:"Sesiones",
    value:
      course.sessions
      ? `${course.sessions}`
      : course.duration
  },


  {
    icon:<Clock3 size={24}/>,
    label:"Duración",
    value:
      course.hoursPerSession
      ? `${course.sessions! * course.hoursPerSession} horas`
      : course.duration
  },


  {
    icon:<Users size={24}/>,
    label:"Participantes",
    value:course.participants
  },


  {
    icon:<Monitor size={24}/>,
    label:"Modalidad",
    value:course.modality
  }

];



return (

<section
className="
relative
py-16
"
>


<Container>


<div
className="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-4
gap-5
"
>


{
stats.map((stat,index)=>(


<motion.div

key={stat.label}


initial={{
opacity:0,
y:30
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
duration:.5,
delay:index*.1
}}


className="
group
relative
overflow-hidden
rounded-3xl
border
border-white/40
bg-white/70
backdrop-blur-xl
p-6
shadow-lg
transition-all
hover:-translate-y-2
hover:shadow-xl
"

>


{/* COLOR GLOW */}

<div

className="
absolute
inset-0
opacity-0
group-hover:opacity-20
transition
"

style={{
background:
`linear-gradient(
135deg,
${course.color},
transparent
)`
}}

/>



<div
className="
relative
z-10
"
>


<div

className="
mb-5
flex
h-12
w-12
items-center
justify-center
rounded-2xl
"

style={{
backgroundColor:
course.color
}}

>

<span
className="
text-white
"
>
{stat.icon}
</span>


</div>



<p
className="
text-sm
font-medium
text-text-secondary
"
>
{stat.label}
</p>



<h3

className="
mt-1
text-xl
font-bold
text-text-primary
"

>

{stat.value}

</h3>



</div>



</motion.div>


))

}



</div>


</Container>


</section>

);

}