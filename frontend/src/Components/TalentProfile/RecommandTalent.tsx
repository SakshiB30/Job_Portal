import { talents } from "../../Data/TalentData"
import TalentCard from "../FindTalent/TalentCard"

const RecommandTalent = () => {
  return (
    <div>
      <div className="text-xl font-semibold mb-5">Recommended Talent</div>
        <div className="flex flex-col flex-wrap gap-5 justify-between ">
            {talents.map((talent,index) => index<3 && <TalentCard keys={index} {...talent}/>)}
        </div>
      </div>
    
  )
}

export default RecommandTalent
