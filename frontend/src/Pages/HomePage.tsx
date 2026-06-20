import { Button } from "@mantine/core"
import { IconBriefcase, IconChartBar, IconFileText, IconUsers } from "@tabler/icons-react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import Companies from "../Components/LandingPage/Companies"
import DreamJob from "../Components/LandingPage/DreamJob"
import JobCategory from "../Components/LandingPage/JobCategory"
import Subscribe from "../Components/LandingPage/Subscribe"
import Testimonials from "../Components/LandingPage/Testimonials"
import Working from "../Components/LandingPage/Working"
import { isCompany } from "../Services/RoleService"
import type { RootState } from "../Types"

const HomePage = () => {
  const user = useSelector((state: RootState) => state.user)

  if (isCompany(user)) return <CompanyHome />

  return (
    <div className="min-h-screen bg-mine-shaft-950 font-['poppins'] text-mine-shaft-100">
      <DreamJob />
      <Companies />
      <JobCategory />
      <Working />
      <Testimonials />
      <Subscribe />
      <div className="h-14 bg-mine-shaft-900" />
    </div>
  )
}

const CompanyHome = () => {
  const profile = useSelector((state: RootState) => state.profile)
  const user = useSelector((state: RootState) => state.user)
  const companyName = profile?.company || user?.name || "your company"

  const actions = [
    {
      title: "Post a Job",
      desc: "Create a new opening and start collecting applications.",
      icon: IconFileText,
      path: "/post-job",
      primary: true,
    },
    {
      title: "Manage Jobs",
      desc: "Review, close, and track your posted job listings.",
      icon: IconBriefcase,
      path: "/posted-job",
    },
    {
      title: "Dashboard",
      desc: "View applicants, interviews, offers, and hiring analytics.",
      icon: IconChartBar,
      path: "/dashboard",
    },
  ]

  return (
    <div className="min-h-screen bg-mine-shaft-950 font-['poppins'] text-mine-shaft-100">
      <section className="site-container grid min-h-[calc(100vh-76px)] items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-bright-sun-400/30 bg-bright-sun-400/10 px-3 py-1 text-xs font-semibold text-bright-sun-400">
            <IconUsers size={14} />
            Recruiter workspace
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-mine-shaft-50 sm:text-5xl lg:text-6xl">
            Hire smarter for <span className="text-bright-sun-400">{companyName}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-mine-shaft-300 sm:text-lg">
            Post roles, manage applicants, review candidate profiles, and move your hiring pipeline forward from one focused workspace.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/post-job">
              <Button size="md" autoContrast leftSection={<IconFileText size={18} />}>Post New Job</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="md" variant="light" color="brightSun.4" leftSection={<IconChartBar size={18} />}>Open Dashboard</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.path}
                to={action.path}
                className={`rounded-lg border p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(255,189,32,0.55)] ${
                  action.primary
                    ? "border-bright-sun-400/50 bg-bright-sun-400/10"
                    : "border-mine-shaft-800 bg-mine-shaft-900"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-bright-sun-400 text-mine-shaft-950">
                  <Icon size={22} />
                </div>
                <div className="mt-4 text-lg font-semibold text-mine-shaft-50">{action.title}</div>
                <div className="mt-2 text-sm leading-6 text-mine-shaft-400">{action.desc}</div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="border-y border-mine-shaft-800 bg-mine-shaft-900/50">
        <div className="site-container grid gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="rounded-md bg-mine-shaft-950 p-5">
            <div className="text-3xl font-semibold text-bright-sun-400">1</div>
            <div className="mt-1 font-medium">Post roles</div>
            <div className="mt-1 text-sm text-mine-shaft-400">Publish openings with the right skills, type, and location.</div>
          </div>
          <div className="rounded-md bg-mine-shaft-950 p-5">
            <div className="text-3xl font-semibold text-bright-sun-400">2</div>
            <div className="mt-1 font-medium">Review applicants</div>
            <div className="mt-1 text-sm text-mine-shaft-400">Shortlist, interview, reject, or offer from your application board.</div>
          </div>
          <div className="rounded-md bg-mine-shaft-950 p-5">
            <div className="text-3xl font-semibold text-bright-sun-400">3</div>
            <div className="mt-1 font-medium">Hire faster</div>
            <div className="mt-1 text-sm text-mine-shaft-400">Track pipeline progress and keep every role moving.</div>
          </div>
        </div>
      </section>

      <div className="h-14 bg-mine-shaft-900" />
    </div>
  )
}

export default HomePage
