import { ActionIcon, TagsInput } from "@mantine/core"
import { IconCheck, IconPencil, IconX } from "@tabler/icons-react"
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { successNotification } from "../../Services/NotificationService";
import { changeProfile } from "../../Slices/ProfileSlice";
import type { RootState } from "../../Types";
import { updateProfile } from "../../Services/ProfileService";


const Skills = () => {
    const [edit, setEdit] = useState(false);
  const profile = useSelector((state: RootState) => state.profile);
  const dispatch = useDispatch();
   const [skills, setSkills] = useState<string[]>(profile?.skills || []);
    const handleClick = () => {
    if (!edit) {
        setEdit(true);
        setSkills(profile?.skills || []);
    } else setEdit(false);
  };

  const handleSave = async () => {
      setEdit(false);
      const updatedProfile = {...profile, skills: skills};
      const savedProfile = await updateProfile(updatedProfile);
      dispatch(changeProfile(savedProfile));
      successNotification("Success","Profile updated successfully");
  
  }
  return (
        <div>
          <div className="text-2xl font-semibold mb-3 flex justify-between">
            Skills 
            <div>
          {edit && (
            <ActionIcon
              onClick={handleSave}
              variant="subtle"
              color="green.8"
              size="lg"
            >
              <IconCheck className="h-4/5 w-4/5" stroke={1.5} />
            </ActionIcon>
          )}
          <ActionIcon
            onClick={handleClick}
            variant="subtle"
            color={edit ? "red.8" : "brightSun.4"}
            size="lg"
          >
            {edit ? (
              <IconX className="h-4/5 w-4/5" />
            ) : (
              <IconPencil className="h-4/5 w-4/5" />
            )}
          </ActionIcon>
          </div>
        </div>
          {edit ? (
            <TagsInput
              placeholder="Add Skills"
              value={skills}
              onChange={setSkills}
              splitChars={[",", " ", "|"]}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.length ? profile.skills.map((skill: string, index: number) => (
                <div
                  key={index}
                  className=" bg-bright-sun-300/15 text-sm font-medium rounded-3xl text-bright-sun-400 px-3 py-1"
                >
                  {skill}
                </div>
              )) : <div className="text-sm text-mine-shaft-300">Add skills to improve your profile visibility.</div>}
            </div>
          )}
        </div>
          
  )}

export default Skills
