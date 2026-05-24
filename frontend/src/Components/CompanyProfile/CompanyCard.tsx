import { ActionIcon } from "@mantine/core"
import { IconExternalLink } from "@tabler/icons-react"
import CompanyLogo from "../CompanyLogo";

const CompanyCard = (props:any) => {
  return (
    <div className="card-standard rounded-lg p-2">
      <div className="flex justify-between bg-transparent items-center w-full gap-2">
        <div className="flex gap-2 items-center min-w-0">
          <div className="p-2 bg-mine-shaft-800 rounded-md shrink-0">
            <CompanyLogo company={props.name} className="h-7 w-7" />
          </div>
          
          <div className="flex flex-col gap-1 min-w-0">
            <div className="font-semibold truncate">{props.name}</div>
            <div className="text-xs text-mine-shaft-300 truncate">{props.employees} Employees </div>
          </div>

        </div>

          <ActionIcon color="brightSun.4" variant="subtle" className="shrink-0">
            <IconExternalLink/>
          </ActionIcon>
        </div>
      </div>
  )
}

export default CompanyCard
