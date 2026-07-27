"use client";

import {
  Target,
  Play,
  Sparkles,
} from "lucide-react";

import { motion } from "framer-motion";

import Container from "@/components/ui/Container";

import type { Course } from "../data/courses";


type CourseDescriptionProps = {
  course: Course;
};



export default function CourseDescription({
  course,
}: CourseDescriptionProps) {


return (

<section
className="
relative
py-24
"
>


<Container>


<div
className="
grid
lg:grid-cols-2
gap-14
items-center
"
>


{/* LEFT CONTENT */}


<motion.div

initial={{
opacity:0,
x:-40
}}

whileInView={{
opacity:1,
x:0
}}

viewport={{
once:true
}}

transition={{
duration:.7
}}

>


{/* SECTION LABEL */}

<div
className="
flex
items-center
gap-2
mb-5
"
>

<div

className="
flex
h-8
w-8
items-center
justify-center
rounded-full
"

style={{
backgroundColor:course.color
}}

>

<Sparkles
size={16}
className="text-white"
/>

</div>


<span
className="
text-sm
font-semibold
uppercase
tracking-wider
text-text-secondary
"
>
Sobre el curso
</span>


</div>





<h2

className="
font-heading
text-4xl
md:text-5xl
leading-tight
text-text-primary
"

>

Aprende,
crea y mejora tus habilidades digitales


</h2>





<p

className="
mt-6
text-lg
leading-8
text-text-secondary
max-w-xl
"

>

{course.description}

</p>









{/* OBJECTIVE CARD */}



<motion.div

whileHover={{
y:-5
}}

className="
mt-8
relative
overflow-hidden
rounded-3xl
border
border-white/40
bg-white/70
backdrop-blur-xl
p-6
shadow-lg
"

>


<div

className="
absolute
inset-0
opacity-10
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
flex
gap-4
"
>


<div

className="
flex
h-12
w-12
shrink-0
items-center
justify-center
rounded-2xl
"

style={{
backgroundColor:course.color
}}

>

<Target
size={22}
className="text-white"
/>

</div>




<div>


<h3
className="
font-bold
text-text-primary
"
>
Objetivo del curso
</h3>


<p
className="
mt-2
text-sm
leading-6
text-text-secondary
"
>

{course.objective}

</p>


</div>



</div>


</motion.div>



</motion.div>









{/* RIGHT VIDEO */}



<motion.div

initial={{
opacity:0,
x:40
}}

whileInView={{
opacity:1,
x:0
}}

viewport={{
once:true
}}

transition={{
duration:.7,
delay:.15
}}

className="
relative
"

>



<div

className="
absolute
inset-0
rounded-[3rem]
blur-3xl
opacity-30
"

style={{
backgroundColor:course.color
}}

/>






<div

className="
relative
overflow-hidden
aspect-video
rounded-[3rem]
border
border-white/40
bg-white/70
backdrop-blur-xl
shadow-2xl
flex
items-center
justify-center
"

>


{/* VIDEO FUTURE */}

{

course.video

?

<video
src={course.video}
controls
className="
h-full
w-full
object-cover
"
/>

:

<div
className="
text-center
px-8
"
>


<div

className="
mx-auto
flex
h-20
w-20
items-center
justify-center
rounded-full
shadow-xl
"

style={{
backgroundColor:course.color
}}

>

<Play
size={32}
className="text-white ml-1"
/>

</div>



<h3

className="
mt-6
text-xl
font-bold
text-text-primary
"

>

Video del curso

</h3>


<p

className="
mt-2
text-sm
text-text-secondary
"

>

Próximamente podrás visualizar una introducción del curso.

</p>


</div>

}


</div>




</motion.div>





</div>


</Container>


</section>

);

}