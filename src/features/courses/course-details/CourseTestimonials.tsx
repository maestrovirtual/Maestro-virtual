"use client";

import Image from "next/image";
import {
  Star,
  Quote,
} from "lucide-react";

import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

import {
  useRef,
} from "react";


import Container from "@/components/ui/Container";

import type { Course } from "../data/courses";



type CourseTestimonialsProps = {
  course: Course;
};





export default function CourseTestimonials({
  course,
}: CourseTestimonialsProps) {


  const sectionRef = useRef<HTMLDivElement>(null);



  const {
    scrollYProgress
  } = useScroll({

    target:sectionRef,

    offset:[
      "start 80%",
      "end 40%"
    ]

  });



  const lineHeight = useTransform(
    scrollYProgress,
    [0,1],
    ["0%","100%"]
  );

  const backgroundScale = useTransform(
    scrollYProgress,
    [0,1],
    [0.8,1.15]
  );





  if(
    !course.testimonials ||
    course.testimonials.length === 0
  ){

    return null;

  }







return (

<section

ref={sectionRef}

className="
relative
overflow-hidden
py-28
"


>


{/* BACKGROUND */}


<motion.div

style={{
scale: backgroundScale,
backgroundColor: course.color
}}

className="
absolute
left-1/2
top-100
-translate-x-1/2
h-[600px]
w-[600px]
rounded-full
blur-3xl
opacity-20
"

/>







<Container>




{/* HEADER */}



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

className="
text-center
mb-20
"

>



<p

className="
uppercase
tracking-[0.35em]
text-xs
font-semibold
text-text-secondary
"

>

Impacto del aprendizaje

</p>




<h2

className="
mt-4
font-heading
text-4xl
md:text-5xl
text-text-primary
"

>

Historias de nuestros estudiantes

</h2>




<p

className="
mt-5
mx-auto
max-w-2xl
text-text-secondary
"

>

Cada curso busca generar herramientas que puedan
aplicarse directamente dentro del aula.

</p>




</motion.div>









{/* TIMELINE */}



<div

className="
relative
"

>



{/* STATIC LINE */}


<div

className="
absolute
left-1/2
top-0
hidden
h-full
w-[3px]
-translate-x-1/2
rounded-full
bg-black/5
md:block
"

/>






{/* ANIMATED LINE */}


<motion.div

style={{
height:lineHeight,
backgroundColor:course.color
}}

className="
absolute
left-1/2
top-0
hidden
w-[3px]
-translate-x-1/2
rounded-full
md:block
"

/>









<div

className="
space-y-20
"

>


{

course.testimonials.map(

(testimonial,index)=>(


<motion.div


key={testimonial.name}



initial={{

opacity:0,

x:
index % 2 === 0
? -100
: 100

}}



whileInView={{

opacity:1,

x:0

}}



viewport={{

once:true,

margin:"-120px"

}}



transition={{

duration:.8

}}



className={`
relative
flex
md:w-1/2

${
index % 2 === 0
?
"md:pr-12"
:
"md:ml-auto md:pl-12"
}

`}



>




{/* DOT */}



<motion.div


initial={{
scale:0
}}

whileInView={{
scale:1
}}

viewport={{
once:true
}}

transition={{
delay:.3
}}


className="
absolute
hidden
md:flex
top-8
h-6
w-6
rounded-full
border-4
border-white
shadow-xl
"

style={{

backgroundColor:course.color,


left:

index % 2 === 0

?

"calc(100% - 12px)"

:

"-12px"

}}


/>










{/* CARD */}



<motion.div


whileHover={{

y:-8

}}


className="
relative
overflow-hidden
rounded-[2.5rem]
border
border-white/40
bg-white/75
backdrop-blur-xl
p-8
shadow-xl
"

>



{/* COLOR EFFECT */}


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
"

>



<Quote

size={50}

className="
absolute
right-0
top-0
opacity-10
"

/>









{/* USER */}



<div

className="
flex
items-center
gap-4
"

>


<div

className="
relative
flex
h-14
w-14
items-center
justify-center
overflow-hidden
rounded-full
"

style={{

backgroundColor:course.color

}}

>


{

testimonial.avatar

?

<Image

src={testimonial.avatar}

alt={testimonial.name}

fill

className="
object-cover
"

/>

:

<span

className="
text-xl
font-bold
text-white
"

>

{
testimonial.name.charAt(0)
}

</span>


}



</div>





<div>


<h3

className="
font-bold
text-text-primary
"

>

{testimonial.name}

</h3>


<p

className="
text-sm
text-text-secondary
"

>

{testimonial.role}

</p>


</div>


</div>









{/* RATING */}



<div

className="
mt-5
flex
gap-1
"

>


{

Array.from({

length:testimonial.rating ?? 5

}).map((_,i)=>(


<Star

key={i}

size={16}

fill={course.color}

style={{

color:course.color

}}

/>


))


}



</div>









<p

className="
mt-6
leading-7
text-text-secondary
"

>

&quot;{testimonial.message}&quot;

</p>





</div>




</motion.div>





</motion.div>



)

)

}




</div>





</div>





</Container>



</section>

);

}