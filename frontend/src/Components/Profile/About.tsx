import { useState } from "react";
import { ActionIcon, Textarea } from "@mantine/core";
import {
  IconCheck,
  IconPencil,
  IconX,
} from "@tabler/icons-react";
import {  useDispatch, useSelector } from "react-redux";
import { changeProfile } from "../../Slices/ProfileSlice";
import { successNotification, errorNotification } from "../../Services/NotificationService";
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
      if (!about?.trim()) {
        errorNotification("Validation Error", "About section cannot be empty.");
        setEdit(true);
        return;
      }
      // Strip binary fields (banner, picture, companyLogo) to prevent Base64 decode crashes
      const { banner, picture, companyLogo, ...cleanProfile } = profile || {};
      const updatedProfile = {...cleanProfile, id: profile?.id || user?.profileId, about: about};
      try {
        const savedProfile = await updateProfile(updatedProfile);
        dispatch(changeProfile(savedProfile));
        successNotification("Success","Profile updated successfully");
      } catch (error) {
        errorNotification("Error", "Failed to save about section. Please try again.");
        setEdit(true);
      }
  
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
          withAsterisk
          placeholder={companyProfile ? "Enter About Company" : "Enter About Yourself"}
          description="Required for job applications — write a short summary of your background and goals"
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
