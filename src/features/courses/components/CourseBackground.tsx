type CourseBackgroundProps = {
  pattern:
    | "grid"
    | "waves"
    | "shapes"
    | "cards"
    | "slides"
    | "growth"
    | "chat";

  color:string;
};

export default function CourseBackground({
  pattern,
  color,
}: CourseBackgroundProps) {


switch(pattern){

case "grid":

return(

<div
className="
absolute
inset-0
opacity-[0.24]
pointer-events-none
"
>


<div
className="
absolute
inset-[-20px]
animate-excelMove
"
style={{

backgroundImage:`

linear-gradient(${color} 1px, transparent 1px),
linear-gradient(90deg, ${color} 1px, transparent 1px)

`,

backgroundSize:"32px 32px"

}}
/>


<div
className="
absolute
top-10
left-80
w-20
h-12
rounded-md
border-2
animate-cellSelect
"
style={{
borderColor:color
}}
/>


</div>

);

case "waves":

return(
<>
<div
className="
absolute
right-[-80px]
top-[-80px]
w-80
h-80
rounded-full
border-[8px]
opacity-[0.18]
animate-wave
"
style={{
borderColor:color
}}
/>


<div
className="
absolute
right-[-40px]
top-[-40px]
w-64
h-64
rounded-full
border-[13px]
opacity-[0.14]
animate-wave-delay
"
style={{
borderColor:color
}}
/>


<div
className="
absolute
right-0
top-0
w-48
h-48
rounded-full
border-[15px]
opacity-[0.10]
"
style={{
borderColor:color
}}
/>

</>
);


case "shapes":

return(
<>

{/* Círculo */}
<div
className="
absolute
top-8
right-10
w-28
h-28
rounded-full
opacity-[0.12]
animate-slideFloat
"
style={{
backgroundColor:color
}}
/>



{/* Triángulo */}
<div
className="
absolute
bottom-35
left-57
w-24
h-24
opacity-[0.10]
rotate-12
animate-floatSlow
"
style={{
backgroundColor:color,
clipPath:
"polygon(50% 0%,100% 100%,0% 100%)"
}}
/>



{/* Rectángulo tipo diseño */}
<div
className="
absolute
bottom-5
right-20
w-32
h-16
rounded-xl
opacity-[0.10]
rotate-[-15deg]
"
style={{
backgroundColor:color
}}
/>


</>
);


case "cards":

return(

<>

<div
className="
absolute
top-10
right-10
w-40
h-24
rounded-xl
border-2
opacity-[0.68]
animate-taskFloat
"
style={{
borderColor:color
}}
>

<div
className="
absolute
top-5
left-5
w-20
h-2
rounded-full
opacity-100
"
style={{
backgroundColor:color
}}
/>


<div
className="
absolute
top-10
left-5
w-28
h-2
rounded-full
opacity- 100
"
style={{
backgroundColor:color
}}
/>


</div>





</>

);


case "slides":

return(
<>

<div
className="
absolute
top-8
right-8
w-36
h-24
rounded-xl
border-2
opacity-[0.2]
rotate-6
animate-slideFloat
"
style={{
borderColor:color
}}
/>


<div
className="
absolute
top-20
right-20
w-36
h-24
rounded-xl
border-2
opacity-[0.10]
animate-slideFloat
-rotate-6
"
style={{
borderColor:color
}}
/>


<div
className="
absolute
top-14
right-14
w-8
h-2
rounded-full
animate-slideFloat
opacity-[0.15]
"
style={{
backgroundColor:color
}}
/>

</>

);

case "growth":

return(
<div className="absolute inset-0 pointer-events-none overflow-hidden">


<div
className="
absolute
-bottom-4
right-10
flex
items-end
gap-2
opacity-[0.12]
"
>

<div
className="
w-8
h-12
rounded-t-xl
animate-fadeUp
"
style={{
backgroundColor:color
}}
/>


<div
className="
w-8
h-20
rounded-t-xl
animate-fadeUp
[animation-delay:200ms]
"
style={{
backgroundColor:color
}}
/>


<div
className="
w-8
h-32
rounded-t-xl
animate-fadeUp
[animation-delay:400ms]
"
style={{
backgroundColor:color
}}
/>


<div
className="
w-8
h-48
rounded-t-xl
animate-fadeUp
[animation-delay:600ms]
"
style={{
backgroundColor:color
}}
/>

</div>



<div
className="
absolute
top-10
right-32
w-16
h-16
rounded-full
opacity-[0.08]
animate-pulse
"
style={{
backgroundColor:color
}}
/>


</div>
);



case "chat":

return(
<div className="absolute inset-0 pointer-events-none overflow-hidden">


<div
className="
absolute
top-8
right-12
opacity-[0.42]
"
>

<div
className="
relative
w-28
h-20
rounded-[2rem]
rounded-br-md
animate-slideFloat
"
style={{
backgroundColor:color
}}
/>


<div
className="
absolute
top-14
-left-12
w-20
h-14
rounded-3xl
rounded-bl-md
animate-slideFloat
[animation-delay:300ms]
"
style={{
backgroundColor:color,
opacity:0.8
}}
/>


</div>



<div
className="
absolute
bottom-6
right-40
w-24
h-24
rounded-full
border-[10px]
opacity-[0.08]
animate-wave
"
style={{
borderColor:color
}}
/>


</div>
);

default:
return null;


}



}