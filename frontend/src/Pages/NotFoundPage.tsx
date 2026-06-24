import { Button } from "@mantine/core"
import { IconArrowLeft } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl font-bold text-bright-sun-400">404</div>
      <div className="mt-3 text-xl font-semibold text-mine-shaft-100">Page not found</div>
      <div className="mt-2 max-w-md text-sm text-mine-shaft-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </div>
      <Button
        onClick={() => navigate(-1)}
        leftSection={<IconArrowLeft size={16} />}
        color="brightSun.4"
        variant="light"
        className="mt-6"
      >
        Go Back
      </Button>
    </div>
  )
}

export default NotFoundPage
