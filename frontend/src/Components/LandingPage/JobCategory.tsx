import { Carousel } from "@mantine/carousel"
import { jobCategory } from "../../Data/Data"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"

const JobCategory = () => {
  return (
      <div className="mt-20 pb-5">
            <div className="text-4xl text-center font-semibold mb-3 text-mine-shaft-100">Browse <span className="text-bright-sun-400">Job</span> Category</div>
            <div className="text-lg mb-10 m-auto text-mine-shaft-300 text-center w-1/2">Explore diverse job opportunities tailored to your skills. Start your career journey today!</div>
                <Carousel slideSize="22%" slideGap="md" emblaOptions={{ loop: true }} className="group" classNames={{control: `
                !bg-bright-sun-400 
                !border-none 
                !outline-none
                !opacity-0
                group-hover:!opacity-75
                hover:!opacity-100
                transition-opacity duration-300
                `}}
                nextControlIcon={<IconArrowRight className="h-8 w-8" />}
                previousControlIcon={<IconArrowLeft className="h-8 w-8" />}>
               
            {
                jobCategory.map((category) => <Carousel.Slide key={category.name}>
                <div className="flex flex-col items-center w-64 gap-2 border border-bright-sun-400 p-5 rounded-xl hover:cursor-pointer hover:shadow-[0_0_5px_2px_black] my-5 transition duration-300 ease-in-out shadow-bright-sun-300!">
                <div className="p-2 bg-bright-sun-300 rounded-full">
                    <img className="h-8 w-8" src={`/Category/${category.name}.png`} alt={category.name} />
                </div>
                <div className="text-mine-shaft-100 text-centertext-xl font-semibold">{category.name}</div>
                <div className="text-sm text-center text-mine-shaft-300">{category.desc}</div>
                <div className="text-bright-sun-300 text-center text-lg">{category.jobs}+ new job posted</div>
            </div>
             </Carousel.Slide>)    
            }
            </Carousel>

    </div>
  )
}

export default JobCategory
