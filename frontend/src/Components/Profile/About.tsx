import { useState } from "react";
import { ActionIcon, Textarea } from "@mantine/core";
import {
  IconCheck,
  IconPencil,
  IconX,
} from "@tabler/icons-react";
import {  useDispatch, useSelector } from "react-redux";
import { changeProfile } from "../../Slices/ProfileSlice";
import { successNotification } from "../../Services/NotificationService";
import type { RootState } from "../../Types";
import { isCompany } from "../../Services/RoleService";
import { updateProfile } from "../../Services/ProfileService";

const About = () => {
const [edit, setEdit] = useState(false);
  const [about, setAbout] = useState("");
  const profile = useSelector((state: RootState) => state.profile);
  const user = useSelector((state: RootState) => state.user);
  const companyProfile = isCompany(user);
  const dispatch = useDispatch();

  const handleClick = () => {
    if (!edit) {
        setEdit(true);
        setAbout(profile?.about || "");
    } else setEdit(false);
  };

  const handleSave = async () => {
      setEdit(false);
      const updatedProfile = {...profile, id: profile?.id || user?.profileId, about: about};
      const savedProfile = await updateProfile(updatedProfile);
      dispatch(changeProfile(savedProfile));
      successNotification("Success","Profile updated successfully");
  
  }

  return (
    <div>
      <div className="text-2xl font-semibold mb-3 flex justify-between">
        About
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
        <Textarea
          value={about}
          autosize
          minRows={3}
          placeholder={companyProfile ? "Enter About Company" : "Enter About Yourself"}
          onChange={(e) => setAbout(e.target.value)}
        />
      ) : (
        <div className="text-sm text-mine-shaft-300 text-justify">
          {profile?.about || (companyProfile ? "Add a short company summary for students and applicants." : "Add a short summary so employers understand your background and goals.")}
        </div>
      )}
    </div>
  );
};

export default About;
