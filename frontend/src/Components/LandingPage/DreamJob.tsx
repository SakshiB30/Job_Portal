import { Avatar, TextInput } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AnimatedSection from "../AnimatedSection"

const DreamJob = () => {
  const [searchTitle, setSearchTitle] = useState("");
  const [searchType, setSearchType] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const query = [searchTitle, searchType].filter(Boolean).join(" ");
    const params = query ? `?q=${encodeURIComponent(query)}` : "";
    navigate(`/find-jobs${params}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <AnimatedSection animation="fade-in" duration={0.6} className="min-h-[calc(100vh-76px)]">
    <div className="site-container flex min-h-[calc(100vh-76px)] flex-col-reverse items-center justify-center py-10 lg:flex-row">
      <AnimatedSection animation="slide-left" delay={100} className="flex flex-col w-full lg:w-[45%] gap-3 mt-6 lg:mt-0">
        <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-mine-shaft-100 [&>span]:text-bright-sun-400">Find your <span>Dream job</span> with us</div>
        <div className="text-sm sm:text-base md:text-lg text-mine-shaft-200">Good life begins with a good company. Start explore thousands of jobs in one place.</div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end w-full mt-5">
            <div className="w-full sm:flex-1">
              <TextInput
                className="w-full [&_input]:h-11 [&_input]:px-3 bg-mine-shaft-900 rounded-xl text-mine-shaft-100 [&_input]:text-mine-shaft-100! [&_input]:rounded-xl"
                variant="unstyled"
                label="Job Title"
                placeholder="Software Engineer"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="w-full sm:flex-1">
              <TextInput
                className="w-full [&_input]:h-11 [&_input]:px-3 bg-mine-shaft-900 rounded-xl text-mine-shaft-100 [&_input]:text-mine-shaft-100! [&_input]:rounded-xl"
                variant="unstyled"
                label="Type"
                placeholder="Full Time"
                value={searchType}
                onChange={(e) => setSearchType(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center justify-center gap-2.5 h-11 w-full sm:w-auto shrink-0 bg-gradient-to-r from-bright-sun-400 to-yellow-400 text-mine-shaft-950 font-semibold text-base sm:text-lg rounded-xl hover:from-bright-sun-500 hover:to-yellow-500 active:scale-95 cursor-pointer transition-all duration-200 shadow-lg shadow-bright-sun-400/25 hover:shadow-xl hover:shadow-bright-sun-400/40 px-6 sm:px-8"
              aria-label="Search jobs"
            >
                <IconSearch className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>Search</span>
            </button>    
        </div>
      </AnimatedSection>
 

      <AnimatedSection animation="slide-right" delay={200} className="w-full lg:w-[55%] flex items-center justify-center lg:justify-end">
        <div className="w-72 sm:w-96 md:w-110 lg:w-120 relative">
        <img src="/Boy.png" alt="boy" />
        <div className="absolute right-2 sm:right-10 w-fit top-[28%] border-bright-sun-400 border rounded-lg p-2 backdrop-blur-md bg-mine-shaft-900/60">
            <div className="text-center text-mine-shaft-100 mb-1 text-sm ">10K+ got jobs</div>
            <Avatar.Group>
            <Avatar color="brightSun.4">JD</Avatar>
            <Avatar color="blue.4">SK</Avatar>
            <Avatar color="green.4">RM</Avatar>
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
