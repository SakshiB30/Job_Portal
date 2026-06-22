import { Avatar } from "@mantine/core"
import { workForStudents, workForCompanies } from "../../Data/Data"
import AnimatedSection from "../AnimatedSection"


const Working = () => {
  return (
      <AnimatedSection animation="slide-up" className="site-container py-14">
            <div className="text-3xl sm:text-4xl text-center font-semibold mb-3 text-mine-shaft-100">How it <span className="text-bright-sun-400">Works</span></div>
            <div className="text-sm sm:text-lg mb-10 m-auto text-mine-shaft-300 text-center w-full sm:w-3/4 md:w-1/2">Whether you are a job seeker or an employer, we make the process simple and efficient.</div>
            
            {/* For Job Seekers */}
            <div className="mb-14">
                <div className="text-xl sm:text-2xl text-center font-semibold mb-2 text-mine-shaft-100">For <span className="text-bright-sun-400">Job Seekers</span></div>
                <div className="text-sm sm:text-base mb-8 m-auto text-mine-shaft-300 text-center w-full sm:w-3/4 md:w-1/2">Find and land your dream job in three simple steps.</div>
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
            </div>

            {/* For Companies */}
            <div>
                <div className="text-xl sm:text-2xl text-center font-semibold mb-2 text-mine-shaft-100">For <span className="text-bright-sun-400">Companies</span></div>
                <div className="text-sm sm:text-base mb-8 m-auto text-mine-shaft-300 text-center w-full sm:w-3/4 md:w-1/2">Post jobs and hire the best talent in three easy steps.</div>
                <div className="flex flex-col lg:flex-row justify-center lg:justify-between items-center gap-8">
                    <div className="flex flex-col gap-6 sm:gap-10 w-full lg:w-auto order-2 lg:order-1">
                        {
                        workForCompanies.map((item, index) => 
                        <div key={index} className="flex flex-col items-center gap-5 w-full sm:w-100">
                            <div>
                                <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-bright-sun-300 rounded-full shrink-0">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-mine-shaft-950 font-bold text-lg">{index + 1}</div>
                                </div>
                                <div>
                                    <div className="text-mine-shaft-200 text-lg sm:text-xl font-semibold">{item.name}</div>
                                    <div className="text-sm sm:text-base text-mine-shaft-300">{item.desc}</div>
                                </div>
                                </div>
                            </div>
                        </div>)}
                    </div>
                    <div className="relative w-full max-w-md lg:max-w-none lg:w-auto flex justify-center order-1 lg:order-2">
                        <div className="w-72 sm:w-96 md:w-110 lg:w-120 h-64 sm:h-80 rounded-2xl bg-gradient-to-br from-mine-shaft-800 to-mine-shaft-900 border border-mine-shaft-700 flex flex-col items-center justify-center p-6">
                            <div className="w-16 h-16 rounded-full bg-bright-sun-400 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-mine-shaft-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <div className="text-mine-shaft-100 text-xl font-semibold text-center">Hire Smarter, Faster</div>
                            <div className="text-mine-shaft-300 text-sm text-center mt-2">Manage your entire hiring pipeline from one powerful dashboard.</div>
                        </div>
                    </div>
                </div>
            </div>
    </AnimatedSection>
  )
}

export default Working
