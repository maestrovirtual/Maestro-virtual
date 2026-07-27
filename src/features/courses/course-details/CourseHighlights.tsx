"use client";

import {
  Target,
  Brain,
  ClipboardCheck,
  Check,
} from "lucide-react";

import { motion } from "framer-motion";

import Container from "@/components/ui/Container";

import type { Course } from "../data/courses";


type CourseHighlightsProps = {
  course: Course;
};



export default function CourseHighlights({
  course,
}: CourseHighlightsProps) {


return (

<section
className="
relative
py-24
"
>


<Container>


{/* TITLE */}


<motion.div

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

className="
mb-12
text-center
"

>


<h2

className="
font-heading
text-4xl
md:text-5xl
text-text-primary
"

>

Todo lo que aprenderás

</h2>


<p

className="
mt-4
text-text-secondary
"

>

Conoce las habilidades y conocimientos que desarrollarás durante este curso.

</p>


</motion.div>









{/* OBJECTIVE */}



<motion.div

initial={{
opacity:0,
y:40
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
duration:.6
}}

className="
relative
overflow-hidden
rounded-[2.5rem]
border
border-white/40
bg-white/70
backdrop-blur-xl
p-8
shadow-xl
"

>


<div

className="
absolute
inset-0
opacity-[0.08]
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
flex-col
md:flex-row
gap-6
items-start
"
>



<div

className="
flex
h-16
w-16
shrink-0
items-center
justify-center
rounded-3xl
"

style={{
backgroundColor:course.color
}}

>

<Target
size={30}
className="text-white"
/>


</div>





<div>


<span
className="
text-sm
uppercase
tracking-widest
font-semibold
text-text-secondary
"
>
Objetivo principal
</span>



<h3

className="
mt-2
text-2xl
font-bold
text-text-primary
"

>

{course.objective}

</h3>



</div>


</div>



</motion.div>









<div

className="
mt-8
grid
md:grid-cols-2
gap-8
"

>








{/* SKILLS */}



<motion.div

initial={{
opacity:0,
x:-30
}}

whileInView={{
opacity:1,
x:0
}}

viewport={{
once:true
}}

transition={{
duration:.6
}}

className="
rounded-[2.5rem]
border
border-white/40
bg-white/70
backdrop-blur-xl
p-8
shadow-xl
"

>


<div

className="
flex
items-center
gap-4
"

>


<div

className="
flex
h-12
w-12
items-center
justify-center
rounded-2xl
"

style={{
backgroundColor:course.color
}}

>

<Brain
size={24}
className="text-white"
/>


</div>



<h3

className="
text-xl
font-bold
text-text-primary
"

>

Habilidades desarrolladas

</h3>


</div>







<div

className="
mt-6
flex
flex-wrap
gap-3
"

>


{

course.skills.map((skill)=>(


<span

key={skill}

className="
rounded-full
border
px-4
py-2
text-sm
font-medium
bg-white/70
"

style={{
borderColor:course.color,
color:course.color
}}

>

{skill}

</span>


))

}


</div>



</motion.div>










{/* REQUIREMENTS */}



<motion.div

initial={{
opacity:0,
x:30
}}

whileInView={{
opacity:1,
x:0
}}

viewport={{
once:true
}}

transition={{
duration:.6
}}

className="
rounded-[2.5rem]
border
border-white/40
bg-white/70
backdrop-blur-xl
p-8
shadow-xl
"

>



<div

className="
flex
items-center
gap-4
"

>


<div

className="
flex
h-12
w-12
items-center
justify-center
rounded-2xl
"

style={{
backgroundColor:course.color
}}

>

<ClipboardCheck
size={24}
className="text-white"
/>


</div>




<h3

className="
text-xl
font-bold
text-text-primary
"

>

Requisitos

</h3>


</div>






<div

className="
mt-6
space-y-4
"

>


{

course.requirements
.split(",")
.map((requirement,index)=>(


<div

key={index}

className="
flex
items-start
gap-3
"

>

<div

className="
mt-1
flex
h-5
w-5
items-center
justify-center
rounded-full
"

style={{
backgroundColor:course.color
}}

>

<Check
size={12}
className="text-white"
/>

</div>


<p

className="
text-sm
leading-6
text-text-secondary
"

>

{requirement}

</p>



</div>


))

}


</div>





</motion.div>





</div>





</Container>


</section>

);

}