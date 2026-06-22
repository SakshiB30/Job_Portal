import { Avatar, Badge, Rating } from "@mantine/core"
import { testimonials } from "../../Data/Data"
import AnimatedSection from "../AnimatedSection"

const Testimonials = () => {
  return (
        <AnimatedSection animation="slide-up" className="site-container py-14">
            <div className="text-3xl sm:text-4xl text-center font-semibold mb-3 text-mine-shaft-100">What <span className="text-bright-sun-400">Users</span> Say About Us</div>
            <div className="text-sm sm:text-lg mb-10 m-auto text-mine-shaft-300 text-center w-full sm:w-3/4 md:w-1/2">Trusted by thousands of job seekers and companies worldwide.</div>
            <div className="flex flex-wrap justify-center site-grid-gap">
                {
                testimonials.map((data, index) =>
                     <AnimatedSection key={index} animation="slide-up" delay={index * 80} className="flex flex-col gap-3 w-full sm:w-[48%] lg:w-[23%] border border-bright-sun-400 rounded-xl p-3 mt-10">
                <div className="flex gap-2 items-center">
                    <Avatar className="h-12! w-12! sm:h-16! sm:w-16!" src="A3.png" alt="it's me" />
                    <div>
                        <div className="text-base sm:text-lg text-mine-shaft-100 font-semibold">{data.name}</div>
                        <Rating value={data.rating} fractions={2} readOnly />
                    </div> 
                </div>
                <Badge 
                    variant="light" 
                    color={data.role === "company" ? "blue" : "brightSun"}
                    size="sm"
                    className="w-fit"
                >
                    {data.role === "company" ? "Company" : "Job Seeker"}
                </Badge>
                <div className="text-xs sm:text-sm text-mine-shaft-300">
                        {data.testimonial}
                </div>
            </AnimatedSection>
            
            )}
            </div>
            

        </AnimatedSection>
  )
}

export default Testimonials
