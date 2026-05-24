import { Avatar, TextInput } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import AnimatedSection from "../AnimatedSection"

const DreamJob = () => {
  return (
    <AnimatedSection animation="fade-in" duration={0.6} className="min-h-[calc(100vh-76px)]">
    <div className="site-container flex min-h-[calc(100vh-76px)] flex-col-reverse items-center justify-center px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
      <AnimatedSection animation="slide-left" delay={100} className="flex flex-col w-full lg:w-[45%] gap-3 mt-6 lg:mt-0">
        <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-mine-shaft-100 [&>span]:text-bright-sun-400">Find your <span>Dream job</span> with us</div>
        <div className="text-sm sm:text-base md:text-lg text-mine-shaft-200">Good life begins with a good company. Start explore thousands of jobs in one place.</div>

        <div className="flex flex-col sm:flex-row gap-4 items-center w-full mt-5">
            <TextInput className="w-full sm:w-auto bg-mine-shaft-900 rounded-lg p-1 px-2 text-mine-shaft-100 [&_input]:text-mine-shaft-100!" variant="unstyled" label="Job Title" placeholder="Software Engineer"/>
            <TextInput className="w-full sm:w-auto bg-mine-shaft-900 rounded-lg p-1 px-2 text-mine-shaft-100 [&_input]:text-mine-shaft-100!" variant="unstyled" label="Type" placeholder="Full Time"/>   
            <div className="flex items-center justify-center h-full w-20 bg-bright-sun-400 text-mine-shaft-100 rounded-lg p-2 hover:bg-bright-sun-500 cursor-pointer shrink-0">
                <IconSearch className="h-[85%] w-[85%]" />
            </div>    
        </div>
      </AnimatedSection>
 

      <AnimatedSection animation="slide-right" delay={200} className="w-full lg:w-[55%] flex items-center justify-center lg:justify-end">
        <div className="w-72 sm:w-96 md:w-110 lg:w-120 relative">
        <img src="/Boy.png" alt="boy" />
        <div className="absolute right-2 sm:right-10 w-fit top-[28%] border-bright-sun-400 border rounded-lg p-2 backdrop-blur-md bg-mine-shaft-900/60">
            <div className="text-center text-mine-shaft-100 mb-1 text-sm ">10K+ got jobs</div>
            <Avatar.Group>
            <Avatar src="A1.png" />
            <Avatar src="A2.png" />
            <Avatar src="A3.png" />
            <Avatar>+9K</Avatar>
            </Avatar.Group>
        </div>

        <div className="absolute left-2 sm:left-5 w-fit top-[50%] border-bright-sun-400 border rounded-lg p-2 backdrop-blur-md bg-mine-shaft-900/60 gap-3 flex flex-col">
            <div className="flex gap-2 items-center"> 
                <div className="w-12 h-10 p-1 bg-mine-shaft-900 rounded-lg">
                    <img src="/google.png" alt="" />
                </div>
                <div className="text-sm text-mine-shaft-200">
                    <div>Software Engineer</div>
                    <div className="text-mine-shaft-200 text-xs">New York</div>
                </div>
            </div>
            <div className="flex gap-2 justify-around text-mine-shaft-100 text-xs">
                <span>1 Day ago</span>
                <span>120 Application</span>
            </div>
        </div>

        </div>
      </AnimatedSection>

    </div>
    </AnimatedSection>
  )
}

export default DreamJob
