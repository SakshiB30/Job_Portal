import { talents } from "../../Data/TalentData"
import TalentCard from "../FindTalent/TalentCard"


const CompanyEmployee = () => {
  return (
    <div>
      <div className="flex flex-wrap gap-5 mt-10">
             {
              talents.map((talent,index)=>index<6 &&<TalentCard key={index} {...talent}/>)
             }            
        </div>
    </div>
  )
}

export default CompanyEmployee
