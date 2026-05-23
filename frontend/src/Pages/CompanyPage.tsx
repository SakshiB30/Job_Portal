import { Button } from "@mantine/core"
import { IconArrowLeft } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import Company from "../Components/CompanyProfile/Company";
import SimilarCompanies from "../Components/CompanyProfile/SimilarCompanies";

const CompanyPage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="min-h-screen bg-mine-shaft-950 font-['poppins'] p-4">
       
          {/* <Divider size="xs"/> */}
            <Button my="md" onClick={()=>navigate(-1)} leftSection={<IconArrowLeft size={20}/>} color="brightSun.4" variant="light" >Back</Button>
        
        <div className="flex gap-5 justify-between">
          <Company/>
          <SimilarCompanies/>
        </div>
      </div>
    </div>
  )
}

export default CompanyPage
