"use client";

import {
  Sparkles,
} from "lucide-react";

import { courses } from "../data/courses";

import FeaturedCourseCard from "./FeaturedCourseCard";


const tools = [
  {
    name: "WhatsApp",
    color:
      "bg-[#00BF63] text-white border-[#00BF63]",
  },
  {
    name: "Canva",
    color:
      "bg-[#7a4aff] text-white border-[#7a4aff]",
  },
  {
    name: "Zoom",
    color:
      "bg-[#185ABD] text-white border-[#185ABD]",
  },
  {
    name: "PowerPoint",
    color:
      "bg-[#F97316] text-white border-[#F97316]",
  },
];

const featuredCourses = courses
  .filter(course => course.featured)
  .sort(
    (a, b) =>
      (a.featuredOrder ?? 99) -
      (b.featuredOrder ?? 99)
  );

export default function CoursesHero() {

return (

<section
className="
relative
overflow-hidden
min-h-screen
flex
items-center
bg-bgLight
dark:bg-bgDark
transition-colors
duration-300
"
>


{/* BACKGROUND */}

<div
className="
absolute
inset-0
bg-gradient-to-b
from-primary/10
via-bgLight
to-bgLight
dark:from-primary/20
dark:via-bgDark
dark:to-bgDark
"
/>



<div
className="
absolute
-top-[350px]
left-1/2
-translate-x-1/2
w-[1000px]
h-[1000px]
rounded-full
bg-primary/20
blur-[180px]
animate-pulse-slower
"
/>



<div
className="
absolute
top-20
right-[-300px]
w-[700px]
h-[700px]
rounded-full
bg-yellow-400/15
blur-[170px]
"
/>



<div
className="
absolute
bottom-[350px]
left-[-300px]
w-[900px]
h-[900px]
rounded-full
bg-green-400/10
blur-[200px]
"
/>



{/* GRID */}

<div
className="
absolute
inset-0
opacity-[0.035]
bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]
bg-[size:48px_48px]
"
/>



{/* PARTICLES */}

<div className="absolute inset-0 pointer-events-none">


<div
className="
absolute
top-[20%]
left-[12%]
w-2
h-2
rounded-full
bg-blue-400
shadow-[0_0_20px_rgba(59,130,246,.8)]
"
/>


<div
className="
absolute
top-[35%]
right-[15%]
w-2
h-2
rounded-full
bg-green-400
shadow-[0_0_20px_rgba(52,211,153,.8)]
"
/>


<div
className="
absolute
bottom-[35%]
left-[20%]
w-2
h-2
rounded-full
bg-yellow-400
"
/>


<div
className="
absolute
bottom-[30%]
right-[25%]
w-2
h-2
rounded-full
bg-red-400
"
/>


</div>



{/* SMOOTH END */}

<div
className="
absolute
bottom-0
left-0
right-0
h-[420px]
bg-gradient-to-b
from-transparent
via-bgLight/80
to-bgLight
dark:via-bgDark/80
dark:to-bgDark
"
/>


<div
className="
absolute
bottom-0
left-0
right-0
h-32
bg-gradient-to-b
from-transparent
to-bgLight
dark:to-bgDark
"
/>




<div
className="
relative
z-10
max-w-7xl
mx-auto
px-6
pt-24
pb-20
w-full
"
>


<div
className="
max-w-5xl
mx-auto
text-center
animate-fadeUp
"
>
    <div
className="
inline-flex
items-center
gap-2
rounded-full
bg-primary/10
border
border-primary/20
px-5
py-2
text-sm
font-medium
text-primary
mb-8
backdrop-blur-md
"
>

<Sparkles size={16}/>

Aprende a tu ritmo

</div>





<h1
className="
text-6xl
md:text-7xl
leading-[1.05]
tracking-normal
font-heading
"
>

Aprende tecnología


<span
className="
block
bg-gradient-to-r
from-blue-700
via-cyan-600
to-blue-700
bg-clip-text
text-transparent
bg-[length:200%_auto]
animate-gradient
"
>

de forma sencilla

</span>


</h1>





<p
className="
mt-8
text-lg
md:text-xl
text-muted-foreground
max-w-2xl
mx-auto
"
>

Aprende herramientas digitales paso a paso
para comunicarte, crear y disfrutar la tecnología.

</p>






{/* TOOLS */}

<div
className="
mt-10
flex
justify-center
flex-wrap
gap-4
"
>

{
tools.map(tool => (

<span
key={tool.name}
className={`
rounded-full
border
px-5
py-2.5
text-sm
font-semibold
backdrop-blur-md
shadow-sm
transition-all
duration-300
hover:-translate-y-1
hover:shadow-md
${tool.color}
`}
>

{tool.name}

</span>

))
}

</div>



</div>



{/* FEATURED COURSES */}

<div
  className="
    mt-20
    mb-10
    text-center
    max-w-2xl
    mx-auto
  "
>



<h2
  className="
    text-4xl
    md:text-5xl
    font-heading
    leading-tight
    bg-gradient-to-r
    from-[#16355B]
    via-[#244A78]
    to-[#16355B]
    bg-clip-text
    text-transparent
    bg-[length:200%_100%]
    animate-title-gradient
  "
>
    Cursos destacados
  </h2>



</div>



{/* FEATURED COURSES */}

<div
  className="
    grid
    grid-cols-1
    md:grid-cols-2
    gap-8
    max-w-5xl
    mx-auto
    animate-fadeUp
    [animation-delay:200ms]
  "
>

  {featuredCourses.map((course) => (
    <FeaturedCourseCard
      key={course.id}
      course={course}
    />
  ))}

</div>
</div>


</section>

);

}