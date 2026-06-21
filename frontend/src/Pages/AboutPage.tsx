import { IconAnchor, IconBriefcase, IconUsers, IconSearch, IconFileCheck, IconMessages } from "@tabler/icons-react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../Types"
import { isCompany } from "../Services/RoleService"

const features = [
  {
    icon: IconSearch,
    title: "Smart Job Search",
    desc: "Find the perfect role with intelligent filters, skill-based matching, and real-time job alerts tailored to your profile.",
  },
  {
    icon: IconUsers,
    title: "Talent Discovery",
    desc: "Employers can browse candidate profiles with verified skills, certifications, and work experience to find the right fit.",
  },
  {
    icon: IconFileCheck,
    title: "Seamless Applications",
    desc: "Apply with a single click using your built-in resume and portfolio. Track every application in real time.",
  },
  {
    icon: IconBriefcase,
    title: "Job Management",
    desc: "Employers can post openings, review applicants, schedule interviews, and manage the entire hiring pipeline effortlessly.",
  },
  {
    icon: IconMessages,
    title: "Real-Time Updates",
    desc: "Get instant notifications on application status changes, interview invites, offers, and more — never miss an update.",
  },
  {
    icon: IconAnchor,
    title: "Profile Building",
    desc: "Build a standout profile with skills, certifications, projects, experience, and career achievements all in one place.",
  },
]

const AboutPage = () => {
  const user = useSelector((state: RootState) => state.user);

  return (
    <div className="site-page px-0 py-0">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-bright-sun-400/5 to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 pt-24 pb-16 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-bright-sun-400/10 px-4 py-1.5 text-sm text-bright-sun-400 mb-6">
            
            <span>JobNexus</span>
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl leading-tight">
            Where{" "}
            <span className="bg-linear-to-r from-bright-sun-400 to-yellow-300 bg-clip-text text-transparent">
              Talent
            </span>{" "}
            Meets{" "}
            <span className="bg-linear-to-r from-bright-sun-400 to-yellow-300 bg-clip-text text-transparent">
              Opportunity
            </span>
          </h1>
          <p className="mt-6 text-lg text-mine-shaft-300 max-w-2xl mx-auto leading-relaxed">
            JobNexus is a modern career platform built to bridge the gap between skilled professionals 
            and forward-thinking companies. Whether you're taking the next step in your career or 
            building your dream team, JobNexus gives you the tools to make it happen.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-mine-shaft-900/60 border border-mine-shaft-800/80 p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-mine-shaft-300 leading-relaxed text-base sm:text-lg">
            To simplify and humanize the hiring process. We believe every candidate deserves a fair shot 
            and every company deserves to find the right talent. JobNexus combines smart technology with 
            a clean, intuitive experience — making job hunting and recruitment feel less like a chore 
            and more like an opportunity.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white text-center mb-12">What We Offer</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="rounded-xl bg-mine-shaft-900/60 border border-mine-shaft-800/80 p-6 
                  hover:border-bright-sun-400/30 hover:shadow-[0_0_20px_-8px_rgba(255,189,32,0.15)]
                  transition-all duration-300 group"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-bright-sun-400/10 text-bright-sun-400 group-hover:bg-bright-sun-400/20 transition-colors">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-mine-shaft-300 leading-relaxed">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-mine-shaft-900/60 border border-mine-shaft-800/80 p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Built With</h2>
          <p className="text-mine-shaft-300 mb-6 max-w-xl mx-auto">
            A full-stack personal project powered by modern technologies:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["React", "TypeScript", "Tailwind CSS", "Spring Boot", "Java", "MongoDB", "Mantine UI", "Redux Toolkit"].map(
              (tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-mine-shaft-800/80 border border-mine-shaft-700/60 px-4 py-1.5 
                    text-sm text-mine-shaft-200"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-5xl px-4 pb-24 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          {isCompany(user)
            ? "Manage your hiring pipeline"
            : user
            ? "Continue your job search"
            : "Ready to get started?"}
        </h2>
        <p className="text-mine-shaft-300 mb-8 max-w-md mx-auto">
          {isCompany(user)
            ? "Post roles, review applicants, and move your hiring forward from one place."
            : user
            ? "Track applications, explore new opportunities, and take the next step."
            : "Join JobNexus today and take the next step in your career journey."}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {!user && (
            <Link
              to="/sign-up"
              className="rounded-full bg-bright-sun-400 text-mine-shaft-950 font-semibold px-8 py-3 
                hover:bg-bright-sun-500 transition-colors duration-300"
            >
              Create Account
            </Link>
          )}
          <Link
            to={isCompany(user) ? "/dashboard" : "/find-jobs"}
            className="rounded-full border border-bright-sun-400/50 text-bright-sun-400 font-semibold px-8 py-3 
              hover:bg-bright-sun-400/10 transition-colors duration-300"
          >
            {isCompany(user) ? "Go to Dashboard" : "Browse Jobs"}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
