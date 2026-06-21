import { Button } from "@mantine/core"
import { useState } from "react"
import ExpInput from "./ExpInput";
import { formatDate } from "../../Services/Utilities";
import { useDispatch, useSelector } from "react-redux";
import { successNotification } from "../../Services/NotificationService";
import { changeProfile } from "../../Slices/ProfileSlice";
import { updateProfile } from "../../Services/ProfileService";

const ExpCard = (props:any) => {
  const dispatch = useDispatch();
  const [edit, setEdit] = useState(false);
  const profile = useSelector((state: any) => state.profile);
  const handleDelete = async () => {  
    let exp = [...profile.experiences];
    exp.splice(props.index, 1);
    let updatedProfile = { ...profile, experiences: exp };
    const savedProfile = await updateProfile(updatedProfile);
    dispatch(changeProfile(savedProfile));
    successNotification("Success", "Experience deleted successfully");  
  }

  return (
    !edit?<div className="flex flex-col gap-2">
       <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
        <div className="flex gap-2 items-center min-w-0">
          <div className="p-2 bg-mine-shaft-800 rounded-md shrink-0">
            <img className="h-7" src={`/Icons/${props.company}.png`} alt="" />
          </div>
       
          <div className="flex flex-col min-w-0">
            <div className="font-semibold truncate">{props.title}</div>
            <div className="text-sm text-mine-shaft-300 truncate">{props.company} &#x2022; {props.location}</div>
          </div>
        </div>

        <div className="text-sm text-mine-shaft-300 shrink-0">
            {formatDate(props.startDate)} - {props.working? "Present" : formatDate(props.endDate)} 
        </div>
      </div>

      <div className="text-sm text-mine-shaft-300 text-justify">
        {props.description}
      </div>

     {props.edit &&<div className="flex gap-3 sm:gap-5">
      <Button onClick={()=>setEdit(true)} color="brightSun.4" variant="outline" size="sm" className="flex-1 sm:flex-none"> Edit </Button>
      <Button color="red.8" variant="light" onClick={handleDelete} size="sm" className="flex-1 sm:flex-none"> Delete </Button>
    </div>}
    </div>:<ExpInput {...props} setEdit={setEdit}/>
  )
}

export default ExpCard

