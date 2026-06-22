import { Carousel } from "@mantine/carousel"
import { jobCategory } from "../../Data/Data"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import AnimatedSection from "../AnimatedSection"

const JobCategory = () => {
  return (
    <AnimatedSection animation="slide-up" className="w-full py-14">

      {/* Text block — keeps its own padding */}
      <div className="site-container">
        <div className="text-4xl text-center font-semibold mb-3 text-mine-shaft-100">
          Browse <span className="text-bright-sun-400">Job</span> Category
        </div>
        <div className="text-sm sm:text-lg mb-10 m-auto text-mine-shaft-300 text-center w-full sm:w-3/4 md:w-1/2">
          Explore diverse job opportunities across industries. Whether you are hiring or job hunting, find your fit.
        </div>
      </div>

      {/* Carousel — full width, no side padding */}
      <Carousel
        slideSize={{ base: "72%", sm: "38%", lg: "21%" }}
        slideGap="md"
        emblaOptions={{ loop: true, align: "start" }}
        className="group w-full overflow-hidden"
        classNames={{
          control: `
            !bg-bright-sun-400 
            !border-none 
            !outline-none
            !opacity-0
            group-hover:!opacity-75
            hover:!opacity-100
            transition-opacity duration-300
          `,
        }}
        nextControlIcon={<IconArrowRight className="h-8 w-8" />}
        previousControlIcon={<IconArrowLeft className="h-8 w-8" />}
      >
        {jobCategory.map((category) => (
          <Carousel.Slide key={category.name}>
            <div className="flex min-h-56 w-full flex-col items-center justify-center gap-2.5 border border-mine-shaft-700 p-4 rounded-xl hover:cursor-pointer hover:border-bright-sun-400/40 hover:shadow-[0_0_20px_-6px_rgba(255,189,32,0.25)] my-4 transition-all duration-300 ease-in-out">
              <div className="p-2 bg-bright-sun-300 rounded-full">
                <img className="h-7 w-7" src={`/Category/${category.name}.png`} alt={category.name} />
              </div>
              <div className="text-mine-shaft-100 text-center text-lg font-semibold">{category.name}</div>
              <div className="text-xs text-center text-mine-shaft-300">{category.desc}</div>
              <div className="text-bright-sun-300 text-center text-base">{category.jobs}+ new job posted</div>
            </div>
          </Carousel.Slide>
        ))}
      </Carousel>

    </AnimatedSection>
  )
}

export default JobCategory
