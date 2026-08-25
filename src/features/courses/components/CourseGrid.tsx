import CourseCard from "./CourseCard";

import type { Course } from "../data/courses";


type CourseGridProps = {
 courses:Course[];
};



export default function CourseGrid({
courses
}:CourseGridProps){


return(

<div

className="
grid
gap-8
md:grid-cols-2
xl:grid-cols-3
"

>


{

courses.map(course=>(

<CourseCard

key={course.id}

course={course}

/>

))

}


</div>


)

}