import { Button } from "@mantine/core"
import { IconArrowLeft } from "@tabler/icons-react"
import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"

import { profile } from "../Data/TalentData"
import Profile from "../Components/TalentProfile/Profile"
import RecommandTalent from "../Components/TalentProfile/RecommandTalent"
import { getUser } from "../Services/UserService"
import { getProfile } from "../Services/ProfileService"



const TalentProfilePage = () => {
   const { userId } = useParams();
   const [talentProfile, setTalentProfile] = useState<any>(profile);

   useEffect(() => {
      if (!userId) {
         setTalentProfile(profile);
         return;
      }

      getUser(userId)
         .then((user) => {
            if (!user?.profileId) {
               setTalentProfile({
                  ...profile,
                  name: user?.name || profile.name,
                  email: user?.email,
               });
               return null;
            }

            return getProfile(user.profileId).then((res) => ({
               ...res,
               name: user?.name || res?.name,
               role: res?.jobTitle,
               experience: res?.experiences || [],
               certifications: res?.certifications || [],
            }));
         })
         .then((res) => {
            if (res) setTalentProfile(res);
         })
         .catch((error) => {
            console.log(error);
         });
   }, [userId]);

   return (
    
      <div className="min-h-screen bg-mine-shaft-950 font-['poppins'] p-4">
       
        <Link className="my-4 inline-block" to="/find-talent">
            <Button leftSection={<IconArrowLeft size={20}/>} color="brightSun.4" variant="light" >Back</Button>
        </Link>
        <div className="flex gap-5">
            <Profile {...talentProfile}/>
            <RecommandTalent/>
        </div>
      </div>
  )
}

export default TalentProfilePage
