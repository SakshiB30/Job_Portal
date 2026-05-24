import { ActionIcon } from "@mantine/core"
import { IconTrash } from "@tabler/icons-react"
import { formatDate } from "../../Services/Utilities"
import { successNotification } from "../../Services/NotificationService"
import { changeProfile } from "../../Slices/ProfileSlice"
import { useDispatch, useSelector } from "react-redux"
import { updateProfile } from "../../Services/ProfileService"

const CartifCard = (props:any) => {
  const profile = useSelector((state: any) => state.profile);
  const dispatch = useDispatch();
  const handleDelete = async () => {  
    let cert = [...profile.certifications];
    cert.splice(props.index, 1);
    let updatedProfile = { ...profile, certifications: cert };
    const savedProfile = await updateProfile(updatedProfile);
    dispatch(changeProfile(savedProfile));
    successNotification("Success", "Certificate deleted successfully");  
  }
  return (
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
        <div className="flex gap-2 items-center min-w-0">
          <div className="p-2 bg-mine-shaft-800 rounded-md shrink-0">
            <img className="h-7" src={`/Icons/Google.png`} alt="" />
          </div>
          
          <div className="flex flex-col min-w-0">
            <div className="font-semibold truncate">{props.name}</div>
            <div className="text-sm text-mine-shaft-300 truncate">{props.issuer}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto" >
        <div className="flex flex-col items-start sm:items-end">
           <div className="text-sm text-mine-shaft-300">Issued {formatDate(props.issueDate)}</div> 
           <div className="text-sm text-mine-shaft-300">ID: {props.certificateId}</div>
        </div>
        {props.edit &&<ActionIcon onClick={handleDelete} size="lg" color="red.8" variant="subtle"> <IconTrash className="h-4/5 w-4/5"/> </ActionIcon>}
        </div>

        
      </div>

    
  )
}

export default CartifCard
