import { Button } from "@mantine/core"
import { IconSearch, IconBriefcase, IconUser } from "@tabler/icons-react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { isCompany, isStudent } from "../Services/RoleService"
import type { RootState } from "../Types"

const NotFoundPage = () => {
  const user = useSelector((state: RootState) => state.user)

  const backLink = isCompany(user)
    ? { to: "/posted-job", label: "Posted Jobs", icon: <IconBriefcase size={16} /> }
    : isStudent(user)
    ? { to: "/find-jobs", label: "Find Jobs", icon: <IconSearch size={16} /> }
    : { to: "/login", label: "Login", icon: <IconUser size={16} /> }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl font-bold text-bright-sun-400">404</div>
      <div className="mt-3 text-xl font-semibold text-mine-shaft-100">Page not found</div>
      <div className="mt-2 max-w-md text-sm text-mine-shaft-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </div>
      <Link to={backLink.to} className="mt-6">
        <Button
          leftSection={backLink.icon}
          color="brightSun.4"
          variant="light"
        >
          {backLink.label}
        </Button>
      </Link>
    </div>
  )
}

export default NotFoundPage
