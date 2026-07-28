"use client";


type CategoryFilterProps = {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
};



export default function CategoryFilter({

  categories,
  selectedCategory,
  onSelect,

}: CategoryFilterProps) {


  return (

    <div

      className="
      flex
      flex-wrap
      gap-3
      "

      role="toolbar"

      aria-label="Filtrar cursos por categoría"

    >


      {categories.map((category)=>{


        const isActive =
          selectedCategory === category;



        return (

          <button

            key={category}

            type="button"

            onClick={() => onSelect(category)}

            className={`

            rounded-full
            border
            px-5
            py-2.5
            text-sm
            font-semibold
            transition-all
            duration-300

            ${
              isActive

              ?

              "border-primary bg-primary text-white shadow-lg"

              :

              "border-border bg-surface text-text-secondary hover:border-primary hover:text-primary"

            }

            `}

          >

            {category}


          </button>

        );


      })}


    </div>

  );

}