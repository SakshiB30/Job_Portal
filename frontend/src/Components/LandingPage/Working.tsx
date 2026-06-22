import { Avatar } from "@mantine/core"
import { workForStudents } from "../../Data/Data"
import AnimatedSection from "../AnimatedSection"


const Working = () => {
  return (
      <AnimatedSection animation="slide-up" className="site-container py-14">
            <div className="text-3xl sm:text-4xl text-center font-semibold mb-3 text-mine-shaft-100">How it <span className="text-bright-sun-400">Works</span></div>
            <div className="text-sm sm:text-lg mb-10 m-auto text-mine-shaft-300 text-center w-full sm:w-3/4 md:w-1/2">Find and land your dream job in three simple steps.</div>
            <div className="flex flex-col lg:flex-row justify-center lg:justify-between items-center gap-8">
                <div className="relative w-full max-w-md lg:max-w-none lg:w-auto flex justify-center">
                    <img className="w-72 sm:w-96 md:w-110 lg:w-120" src="/Working/Girl.png" alt="girl" />
                    <div className="w-36 flex top-[15%] right-2 sm:right-0 absolute flex-col gap-1 items-center border border-bright-sun-400 rounded-xl py-3 px-1 backdrop-blur-md bg-mine-shaft-900/60">
                        <Avatar className="h-16! w-16!" src="A2.png" alt="it's me"/>
                        <div className="text-sm font-semibold text-mine-shaft-200 text-center">Complete your profile</div>
                        <div className="text-xs text-mine-shaft-300">70% Completed</div>
                    </div>
                </div>
                <div className="flex flex-col gap-6 sm:gap-10 w-full lg:w-auto">
                    {
                    workForStudents.map((item, index) => 
                    <div key={index} className="flex flex-col items-center gap-5 w-full sm:w-100">
                        <div>
                            <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-bright-sun-300 rounded-full shrink-0">
                            <img className="h-10 w-10 sm:h-12 sm:w-12" src={`/Working/${item.name}.png`} alt={item.name} />
                            </div>
                            <div>
                                <div className="text-mine-shaft-200 text-lg sm:text-xl font-semibold">{item.name}</div>
                                <div className="text-sm sm:text-base text-mine-shaft-300">{item.desc}</div>
                            </div>
                            </div>
                        </div>
                    </div>)}
                </div>
            </div>
    </AnimatedSection>
  )
}

export default Working
