"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";

import {
Clock3,
ArrowUpRight
} from "lucide-react";


import Card from "@/components/ui/Card";

import type { Course } from "../data/courses";



type CourseCardProps={
course:Course;
};



export default function CourseCard({
course
}:CourseCardProps){



const content=(


<Card

variant="elevated"

className="
group
relative
flex
h-full
flex-col
overflow-hidden
p-0
transition-all
duration-500
hover:-translate-y-2
hover:shadow-2xl
"

>



{/* IMAGE */}


<div

className="
relative
h-56
overflow-hidden
"

style={{

background:
`
linear-gradient(
135deg,
${course.color}55,
transparent
)
`

}}

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
${course.color}55,
transparent 50%
)
`

}}

/>





{course.image ? (

<Image

src={course.image}

alt={course.title}

fill

className="
object-cover
transition-transform
duration-700
group-hover:scale-110
"

/>

) : course.icon ? (

<Image

src={course.icon}

alt={course.title}

fill

className="
object-contain
p-10
"

/>

) : (

<div

className="
flex
h-full
items-center
justify-center
"

>

<span

className="
text-6xl
font-heading
opacity-20
"

style={{
color: course.color
}}

>

{course.title.charAt(0)}

</span>

</div>

)}




{/* OVERLAY */}


<div

className="
absolute
inset-0
bg-gradient-to-t
from-black/50
via-transparent
to-transparent
"

/>





{/* TYPE */}


<div

className="
absolute
top-4
left-4
rounded-full
bg-white/90
px-4
py-1
text-xs
font-bold
uppercase
tracking-wider
"

style={{

color:course.color

}}

>

{course.type}

</div>




</div>









{/* CONTENT */}



<div

className="
flex
flex-1
flex-col
p-6
"

>


<h3

className="
text-2xl
font-bold
tracking-tight
text-text-primary
"

>

{course.title}

</h3>





<p

className="
mt-3
text-sm
leading-6
text-text-secondary
"

>

{course.shortDescription}

</p>








<div

className="
mt-5
flex
flex-wrap
gap-3
"

>


<div

className="
flex
items-center
gap-2
rounded-full
bg-background
px-3
py-2
text-sm
"

>


<Clock3

size={15}

style={{
color:course.color
}}

/>


{course.duration}


</div>





<div

className="
rounded-full
border
border-border
px-3
py-2
text-sm
"

>

Etapa {course.stage}

</div>


</div>







<div

className="
mt-auto
pt-6
flex
items-center
justify-between
font-semibold
"

style={{
color:course.color
}}

>


<span>

Explorar curso

</span>


<ArrowUpRight

className="
transition-transform
duration-300
group-hover:-translate-y-1
group-hover:translate-x-1
"

/>


</div>




</div>



</Card>



);






if(!course.clickable){

return(

<div className="opacity-60">

{content}

</div>

)

}




return(

<Link

href={`/courses/${course.slug}`}

className="
block
h-full
"

>

{content}

</Link>


)


}