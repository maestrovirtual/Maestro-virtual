"use client";

import {
  ArrowRight,
  Clock3,
  Users,
  Monitor
} from "lucide-react";

import { motion } from "framer-motion";

import Container from "@/components/ui/Container";

import type { Course } from "../data/courses";


type CourseCTAProps = {
  course: Course;
};



function hexToRgba(
  hex:string,
  alpha:number
){

const cleanHex = hex.replace("#","");

const bigint=parseInt(cleanHex,16);

const r=(bigint>>16)&255;
const g=(bigint>>8)&255;
const b=bigint&255;

return `rgba(${r}, ${g}, ${b}, ${alpha})`;

}






export default function CourseCTA({
course
}:CourseCTAProps){



return(


<section

className="
relative
overflow-hidden
py-28
"


>


{/* BASE COLOR */}

<div

className="
absolute
inset-0
"

style={{

background:
`
linear-gradient(
135deg,
${course.color},
#111827
)
`

}}

/>





{/* MOVING GLOW */}


<motion.div

animate={{
x:[-100,100,-100],
y:[0,50,0],
scale:[1,1.2,1]
}}

transition={{
duration:12,
repeat:Infinity,
ease:"easeInOut"
}}

className="
absolute
top-[-200px]
left-1/3
h-[500px]
w-[500px]
rounded-full
bg-white/30
blur-[120px]
"

/>





<Container>


<motion.div


initial={{
opacity:0,
y:60
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
duration:.8
}}


className="
relative
rounded-[3rem]
border
border-white/20
bg-black/30
backdrop-blur-2xl
shadow-2xl
p-10
md:p-16
overflow-hidden
"


>





<div

className="
absolute
inset-0
"

style={{

background:
`
radial-gradient(
circle at top right,
${hexToRgba(course.color,.45)},
transparent 45%
)
`

}}

/>






<div

className="
relative
z-10
grid
lg:grid-cols-[1.3fr_.7fr]
gap-12
items-center
"

>







{/* LEFT */}



<div>


<motion.p

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

className="
uppercase
tracking-[0.35em]
text-sm
font-bold
text-white/70
"

>

Comienza ahora

</motion.p>






<motion.h2


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
delay:.2
}}


className="
mt-5
font-heading
text-5xl
md:text-7xl
leading-[.95]
text-white
"

>


¿Listo para transformar
<br/>

<span
style={{
color:course.color
}}
>

tu aprendizaje?

</span>



</motion.h2>







<motion.p


initial={{
opacity:0
}}

whileInView={{
opacity:1
}}

viewport={{
once:true
}}

transition={{
delay:.4
}}


className="
mt-6
max-w-xl
text-lg
leading-8
text-white/80
"

>

Desarrolla nuevas habilidades,
mejora tus competencias y forma parte
de una experiencia diseñada para docentes.

</motion.p>







<motion.button


whileHover={{
scale:1.05
}}

whileTap={{
scale:.96
}}


className="
mt-10
group
flex
items-center
gap-4
rounded-full
px-10
py-5
text-lg
font-bold
shadow-2xl
transition
"

style={{

backgroundColor:"white",

color:course.color

}}

>


Inscribirme al curso


<span

className="
transition-transform
group-hover:translate-x-2
"

>

<ArrowRight size={24}/>

</span>



</motion.button>




</div>









{/* RIGHT STATS */}



<div

className="
grid
gap-5
"

>


<CTAStat

icon={<Clock3/>}

title="Duración"

value={course.duration}

/>


<CTAStat

icon={<Users/>}

title="Participantes"

value={course.participants}

/>


<CTAStat

icon={<Monitor/>}

title="Modalidad"

value={course.modality}

/>



</div>






</div>


</motion.div>



</Container>


</section>



)


}








function CTAStat({

icon,
title,
value

}:{

icon:React.ReactNode;
title:string;
value:string;

}){


return(

<motion.div

whileHover={{
y:-5
}}

className="
flex
items-center
gap-4
rounded-2xl
bg-white/10
border
border-white/20
px-6
py-5
backdrop-blur-xl
text-white
"


>


<div

className="
rounded-xl
bg-white/20
p-3
"

>

{icon}

</div>


<div>

<p

className="
text-sm
text-white/60
"

>

{title}

</p>


<p

className="
font-bold
"

>

{value}

</p>


</div>


</motion.div>


)

}