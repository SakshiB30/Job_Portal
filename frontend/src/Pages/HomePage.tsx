import { Avatar, Badge, Button, Rating } from "@mantine/core"
import { IconBriefcase, IconChartBar, IconFileText, IconUsers, IconBuilding, IconUser, IconCheck, IconArrowRight, IconRocket, IconBolt, IconStar, IconMail } from "@tabler/icons-react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import DreamJob from "../Components/LandingPage/DreamJob"
import JobCategory from "../Components/LandingPage/JobCategory"
import Working from "../Components/LandingPage/Working"
import Companies from "../Components/LandingPage/Companies"
import Testimonials from "../Components/LandingPage/Testimonials"
import AnimatedSection from "../Components/AnimatedSection"
import { isCompany } from "../Services/RoleService"
import { workForStudents, workForCompanies, testimonials as testimonialsData } from "../Data/Data"
import type { RootState } from "../Types"

const HomePage = () => {
  const user = useSelector((state: RootState) => state.user)

  if (isCompany(user)) return <CompanyHome />

  if (!user) return <GuestHome />

  return (
    <div className="bg-mine-shaft-950 font-['poppins'] text-mine-shaft-100">
      <DreamJob />
      <Companies />
      <JobCategory />
      <Working />
      <Testimonials role="student" />
    </div>
  )
}

const GuestHome = () => {
  return (
    <div className="bg-mine-shaft-950 font-['poppins'] text-mine-shaft-100">
      <GuestHero />
      <GuestStats />
      <GuestAudienceSplit />
      <GuestHowItWorks />
      <GuestTestimonials />
      <GuestFinalCTA />
    </div>
  )
}

/* ───── Guest Hero ───── */
const GuestHero = () => {
  return (
    <AnimatedSection animation="fade-in" duration={0.6} className="relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1000px] h-[800px] rounded-full bg-bright-sun-400/[0.04] blur-[160px] pointer-events-none" />
      <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-bright-sun-400/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[350px] h-[350px] rounded-full bg-bright-sun-400/[0.03] blur-[100px] pointer-events-none" />
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,189,32,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,189,32,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="site-container relative z-10 flex min-h-[calc(100vh-76px)] flex-col items-center justify-center py-16 text-center">
        <AnimatedSection animation="slide-up" delay={50}>
          <div className="inline-flex items-center gap-2 rounded-full border border-bright-sun-400/30 bg-bright-sun-400/10 px-5 py-2 text-xs font-semibold text-bright-sun-400 mb-6 backdrop-blur-sm">
            <IconRocket size={14} />
            The #1 Job Portal for Talent & Companies
          </div>
        </AnimatedSection>
        <AnimatedSection animation="slide-up" delay={100}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-mine-shaft-50 max-w-4xl">
            Where <span className="bg-gradient-to-r from-bright-sun-400 to-yellow-300 bg-clip-text text-transparent">Talent</span> Meets {" "}
            <span className="bg-gradient-to-r from-bright-sun-400 to-yellow-300 bg-clip-text text-transparent">Opportunity</span>
          </h1>
        </AnimatedSection>
        <AnimatedSection animation="slide-up" delay={200}>
          <p className="mt-6 max-w-2xl text-base sm:text-lg text-mine-shaft-300 leading-8">
            Whether you are looking for your dream job or hiring top talent, we connect the right people with the right opportunities.
          </p>
        </AnimatedSection>
        <AnimatedSection animation="slide-up" delay={300} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/sign-up" className="group">
            <Button size="lg" className="shadow-lg shadow-bright-sun-400/20 group-hover:shadow-xl group-hover:shadow-bright-sun-400/30 transition-shadow" leftSection={<IconUser size={18} />}>Find a Job</Button>
          </Link>
          <Link to="/sign-up" className="group">
            <Button size="lg" variant="light" color="brightSun.4" className="group-hover:bg-bright-sun-400/10 transition-colors" leftSection={<IconBuilding size={18} />}>Hire Talent</Button>
          </Link>
        </AnimatedSection>

      </div>
    </AnimatedSection>
  )
}


/* ───── Guest Stats ───── */
const GuestStats = () => {
  const stats = [
    { value: "10K+", label: "Active Job Seekers", color: "brightSun" },
    { value: "1K+", label: "Companies Hiring", color: "blue" },
    { value: "5K+", label: "Jobs Posted", color: "green" },
    { value: "95%", label: "Satisfaction Rate", color: "violet" },
  ]
  const colorMap: Record<string, string> = {
    brightSun: "bg-bright-sun-400/10 text-bright-sun-400",
    blue: "bg-blue-400/10 text-blue-400",
    green: "bg-green-400/10 text-green-400",
    violet: "bg-violet-400/10 text-violet-400",
  }
  return (
    <AnimatedSection animation="slide-up" className="relative py-12">
      <div className="site-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-6 rounded-2xl border border-mine-shaft-800/50 bg-mine-shaft-900/30 hover:bg-mine-shaft-900/60 hover:border-mine-shaft-700 transition-all duration-300">
              <div className={`text-3xl sm:text-4xl font-bold ${colorMap[stat.color]}`}>{stat.value}</div>
              <div className="text-xs sm:text-sm text-mine-shaft-400 text-center">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ───── Guest How It Works ───── */
const GuestHowItWorks = () => {
  return (
    <AnimatedSection animation="slide-up" className="relative py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-mine-shaft-900/50 via-transparent to-mine-shaft-900/50 pointer-events-none" />
      <div className="site-container relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-mine-shaft-700 bg-mine-shaft-900/50 px-4 py-1.5 text-xs font-medium text-mine-shaft-300 mb-4">
            <IconBolt size={12} className="text-bright-sun-400" />
            Simple Process
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-mine-shaft-50">How It <span className="bg-gradient-to-r from-bright-sun-400 to-yellow-300 bg-clip-text text-transparent">Works</span></h2>
          <p className="mt-4 text-mine-shaft-300 text-sm sm:text-base max-w-xl mx-auto">A simple process designed for both job seekers and employers.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="relative p-6 sm:p-8 rounded-2xl border border-mine-shaft-800/60 bg-mine-shaft-900/30">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-bright-sun-400/20 to-bright-sun-400/5 border border-bright-sun-400/20"><IconUser size={18} className="text-bright-sun-400" /></div>
              <h3 className="text-lg font-bold text-mine-shaft-50">For Job Seekers</h3>
            </div>
            <div className="space-y-5">
              {workForStudents.map((step, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-bright-sun-400 to-yellow-400 text-mine-shaft-950 font-bold text-sm shadow-lg shadow-bright-sun-400/20 group-hover:scale-110 transition-all duration-300">{i + 1}</div>
                  <div className="pt-1.5"><div className="text-mine-shaft-100 font-semibold">{step.name}</div><div className="text-sm text-mine-shaft-400 mt-1">{step.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative p-6 sm:p-8 rounded-2xl border border-mine-shaft-800/60 bg-mine-shaft-900/30">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400/20 to-blue-400/5 border border-blue-400/20"><IconBuilding size={18} className="text-blue-400" /></div>
              <h3 className="text-lg font-bold text-mine-shaft-50">For Companies</h3>
            </div>
            <div className="space-y-5">
              {workForCompanies.map((step, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-400/20 group-hover:scale-110 transition-all duration-300">{i + 1}</div>
                  <div className="pt-1.5"><div className="text-mine-shaft-100 font-semibold">{step.name}</div><div className="text-sm text-mine-shaft-400 mt-1">{step.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ───── Guest Testimonials ───── */
const GuestTestimonials = () => {
  return (
    <AnimatedSection animation="slide-up" className="site-container py-16">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-mine-shaft-700 bg-mine-shaft-900/50 px-4 py-1.5 text-xs font-medium text-mine-shaft-300 mb-4">
          <IconStar size={12} className="text-bright-sun-400" />
          Testimonials
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-mine-shaft-50">What <span className="bg-gradient-to-r from-bright-sun-400 to-yellow-300 bg-clip-text text-transparent">Users</span> Say</h2>
        <p className="mt-4 text-mine-shaft-300 text-sm sm:text-base max-w-xl mx-auto">Trusted by thousands of job seekers and companies worldwide.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {testimonialsData.map((data, i) => (
          <AnimatedSection key={i} animation="slide-up" delay={i * 80}>
            <div className="group h-full flex flex-col gap-3 border border-mine-shaft-800/60 bg-mine-shaft-900/30 rounded-2xl p-6 transition-all duration-300 hover:border-bright-sun-400/20 hover:bg-mine-shaft-900/50 hover:shadow-[0_0_30px_-10px_rgba(255,189,32,0.12)]">
              <div className="text-4xl text-bright-sun-400/20 font-serif leading-none">&ldquo;</div>
              <div className="flex items-center gap-3">
                <Avatar className="h-11! w-11! rounded-full ring-2 ring-mine-shaft-800 group-hover:ring-bright-sun-400/30 transition-all" src="A3.png" alt={data.name} />
                <div><div className="text-sm font-semibold text-mine-shaft-100">{data.name}</div><Rating value={data.rating} fractions={2} readOnly size="xs" /></div>
              </div>
              <Badge variant="light" color={data.role === "company" ? "blue" : "brightSun"} size="sm" className="w-fit">{data.role === "company" ? "Company" : "Job Seeker"}</Badge>
              <div className="text-xs sm:text-sm text-mine-shaft-300 leading-relaxed flex-1">{data.testimonial}</div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </AnimatedSection>
  )
}

/* ───── Guest Final CTA ───── */
const GuestFinalCTA = () => {
  return (
    <AnimatedSection animation="slide-up" className="site-container py-16">
      <div className="relative overflow-hidden rounded-3xl border border-mine-shaft-800 bg-mine-shaft-900/60 backdrop-blur-sm px-6 py-20 sm:px-12 text-center">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[400px] rounded-full bg-bright-sun-400/[0.07] blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 w-[400px] h-[350px] rounded-full bg-bright-sun-400/[0.05] blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,189,32,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,189,32,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
        <div className="relative z-10">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-bright-sun-400 to-yellow-400 shadow-lg shadow-bright-sun-400/30">
            <IconBolt className="h-8 w-8 text-mine-shaft-950" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-mine-shaft-50">Ready to Get <span className="bg-gradient-to-r from-bright-sun-400 to-yellow-300 bg-clip-text text-transparent">Started</span>?</h2>
          <p className="mt-5 mx-auto max-w-xl text-base text-mine-shaft-300 sm:text-lg">Join thousands of professionals and companies already growing with us.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/sign-up" className="group">
              <Button size="lg" className="shadow-lg shadow-bright-sun-400/20 group-hover:shadow-xl group-hover:shadow-bright-sun-400/30 transition-shadow" leftSection={<IconUser size={18} />}>Find a Job</Button>
            </Link>
            <Link to="/sign-up" className="group">
              <Button size="lg" variant="light" color="brightSun.4" className="group-hover:bg-bright-sun-400/10 transition-colors" leftSection={<IconBuilding size={18} />}>Hire Talent</Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-mine-shaft-400">
            <IconMail size={14} />
            <span>Have questions? <Link to="/about" className="text-bright-sun-400 hover:underline">Contact us</Link></span>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ───── Guest Audience Split ───── */
const GuestAudienceSplit = () => {
  return (
    <AnimatedSection animation="slide-up" className="site-container py-16">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-mine-shaft-700 bg-mine-shaft-900/50 px-4 py-1.5 text-xs font-medium text-mine-shaft-300 mb-4">
          <IconBolt size={12} className="text-bright-sun-400" />
          Choose Your Path
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-mine-shaft-50">Built for <span className="bg-gradient-to-r from-bright-sun-400 to-yellow-300 bg-clip-text text-transparent">Everyone</span></h2>
        <p className="mt-4 text-mine-shaft-300 text-sm sm:text-base max-w-xl mx-auto">Two powerful experiences, one platform. Choose what fits you.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <AnimatedSection animation="slide-left" delay={100}>
          <div className="group relative h-full rounded-2xl border border-mine-shaft-800 bg-mine-shaft-900/40 backdrop-blur-sm p-8 transition-all duration-500 hover:border-bright-sun-400/30 hover:bg-mine-shaft-900/60 hover:shadow-[0_0_60px_-15px_rgba(255,189,32,0.2)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-bright-sun-400/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-bright-sun-400/10 transition-colors duration-500" />
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-bright-sun-400/20 to-bright-sun-400/5 border border-bright-sun-400/20 mb-6 group-hover:scale-110 transition-transform duration-300"><IconUser className="h-7 w-7 text-bright-sun-400" /></div>
              <h3 className="text-xl sm:text-2xl font-bold text-mine-shaft-50 mb-2">For Job Seekers</h3>
              <p className="text-mine-shaft-300 text-sm sm:text-base mb-6">Build your profile, explore thousands of opportunities, and land your dream job.</p>
              <ul className="space-y-3 mb-8">
                {["Browse jobs across 50+ categories", "Build a standout resume and profile", "Apply with one click and track status", "Get matched with the right roles"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-mine-shaft-200"><IconCheck size={16} className="text-bright-sun-400 shrink-0 mt-0.5" />{item}</li>
                ))}
              </ul>
              <Link to="/sign-up"><Button size="md" className="w-full shadow-lg shadow-bright-sun-400/10 group-hover:shadow-xl group-hover:shadow-bright-sun-400/20 transition-shadow" rightSection={<IconArrowRight size={16} />}>Sign Up as Job Seeker</Button></Link>
            </div>
          </div>
        </AnimatedSection>
        <AnimatedSection animation="slide-right" delay={200}>
          <div className="group relative h-full rounded-2xl border border-mine-shaft-800 bg-mine-shaft-900/40 backdrop-blur-sm p-8 transition-all duration-500 hover:border-blue-400/30 hover:bg-mine-shaft-900/60 hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.2)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-blue-400/10 transition-colors duration-500" />
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-400/5 border border-blue-400/20 mb-6 group-hover:scale-110 transition-transform duration-300"><IconBuilding className="h-7 w-7 text-blue-400" /></div>
              <h3 className="text-xl sm:text-2xl font-bold text-mine-shaft-50 mb-2">For Companies</h3>
              <p className="text-mine-shaft-300 text-sm sm:text-base mb-6">Post roles, manage applicants, and hire the best talent, all from one dashboard.</p>
              <ul className="space-y-3 mb-8">
                {["Post unlimited job listings", "Access a pool of qualified candidates", "AI-powered applicant screening", "Full hiring pipeline management"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-mine-shaft-200"><IconCheck size={16} className="text-blue-400 shrink-0 mt-0.5" />{item}</li>
                ))}
              </ul>
              <Link to="/sign-up"><Button size="md" variant="light" color="blue" className="w-full group-hover:bg-blue-400/10 transition-colors" rightSection={<IconArrowRight size={16} />}>Sign Up as Company</Button></Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </AnimatedSection>
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
    },
    {
      title: "Manage Jobs",
      desc: "Review, close, and track your posted job listings.",
      icon: IconBriefcase,
      path: "/posted-job",
    },
    {
      title: "Dashboard",
      desc: "View job activity, applicant counts, and hiring summaries.",
      icon: IconChartBar,
      path: "/dashboard",
    },
    {
      title: "Company Profile",
      desc: "Update company details, branding, contact info, and overview.",
      icon: IconBuilding,
      path: "/profile",
    },
  ]

  return (
    <div className="bg-mine-shaft-950 font-['poppins'] text-mine-shaft-100">
      <section className="site-container grid min-h-[calc(100vh-76px)] items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr]">
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
              <Button size="md" leftSection={<IconFileText size={18} />}>Post New Job</Button>
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
                className="rounded-lg border border-mine-shaft-800 bg-mine-shaft-900 p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(255,189,32,0.55)]"
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
        <div className="site-container grid gap-4 py-8 sm:grid-cols-3">
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

      <Testimonials role="company" />
    </div>
  )
}

export default HomePage
