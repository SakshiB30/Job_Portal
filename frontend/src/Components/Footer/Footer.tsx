import { IconMail, IconExternalLink, IconSearch, IconUserPlus, IconFileText, IconBriefcase, IconUserCheck } from "@tabler/icons-react"
import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../../Types"
import { isCompany, isStudent } from "../../Services/RoleService"

interface FooterLink {
  label: string
  url: string
  icon: React.ReactNode
}

const studentLinks: FooterLink[] = [
  { label: "Find Jobs",    url: "/find-jobs",   icon: <IconSearch    size={15} /> },
  { label: "Applications", url: "/job-history",  icon: <IconBriefcase size={15} /> },
]

const employerLinks: FooterLink[] = [
  { label: "Find Talent", url: "/find-talent", icon: <IconUserPlus  size={15} /> },
  { label: "Post Job",    url: "/post-job",     icon: <IconFileText  size={15} /> },
  { label: "Posted Jobs", url: "/posted-job",   icon: <IconBriefcase size={15} /> },
]

const guestLinks: FooterLink[] = [
  { label: "Find Jobs",   url: "/find-jobs",   icon: <IconSearch    size={15} /> },
  { label: "Find Talent", url: "/find-talent", icon: <IconUserPlus  size={15} /> },
]

const Footer = () => {
  const location = useLocation()
  const user = useSelector((state: RootState) => state.user)

  if (location.pathname === "/sign-up" || location.pathname === "/login") {
    return null
  }

  const links = isCompany(user)
    ? employerLinks
    : isStudent(user)
    ? studentLinks
    : guestLinks

  return (
    <footer className="bg-mine-shaft-900 font-['poppins']">
      <div className="max-w-7xl mx-auto px-16 pt-10 pb-6">

        <div className="grid grid-cols-3 gap-0">

          {/* ── Col 1: Brand ── */}
          <div className="flex flex-col gap-4 pr-10">
            <span className="text-2xl font-bold text-bright-sun-400 tracking-wide">
              JobNexus
            </span>
            <p className="text-sm text-mine-shaft-400 leading-6">
              Where Talent Meets Opportunity
            </p>
            <a
              href="mailto:jobnexus.portal@gmail.com"
              className="flex items-center gap-2 text-sm text-mine-shaft-300 hover:text-bright-sun-400 transition-colors duration-300 group w-fit"
            >
              <IconMail size={15} className="shrink-0 text-bright-sun-400 group-hover:scale-110 transition-transform duration-300" />
              jobnexus.portal@gmail.com
            </a>
          </div>

          {/* ── Col 2: About ── */}
          <div className="flex flex-col gap-4 px-10 border-x border-mine-shaft-800/40">
            <h3 className="text-base font-semibold text-bright-sun-400">
              About
            </h3>
            <p className="text-sm text-mine-shaft-300 leading-6">
              A modern career network connecting ambitious talent with top companies across India and beyond.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-sm text-bright-sun-400 hover:text-bright-sun-300 transition-colors duration-300 w-fit"
            >
              Learn more <IconExternalLink size={13} />
            </Link>
          </div>

          {/* ── Col 3: Quick Links ── */}
          <div className="flex flex-col gap-4 pl-10">
            <h3 className="text-base font-semibold text-bright-sun-400">
              Quick Links
            </h3>
            <div className="flex flex-col gap-3">
              {links.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.url}
                  className="flex items-center gap-2.5 text-sm text-mine-shaft-300 hover:text-bright-sun-400 hover:translate-x-1.5 transition-all duration-300 group w-fit"
                >
                  <span className="text-bright-sun-400 group-hover:text-bright-sun-300 transition-colors duration-300">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-8 pt-4 border-t border-mine-shaft-800/50 text-center text-xs text-mine-shaft-500 tracking-wide">
          &copy; {new Date().getFullYear()} JobNexus. All rights reserved.
        </div>

      </div>
    </footer>
  )
}

export default Footer
