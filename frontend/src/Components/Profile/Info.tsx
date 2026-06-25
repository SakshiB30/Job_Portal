import { ActionIcon, TextInput } from "@mantine/core";
import {
  IconCheck,
  IconMapPin,
  IconPencil,
  IconWorld,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "@mantine/form";
import { useDispatch, useSelector } from "react-redux";
import { changeProfile } from "../../Slices/ProfileSlice";
import { successNotification } from "../../Services/NotificationService";
import type { RootState } from "../../Types";
import { updateProfile } from "../../Services/ProfileService";


const Info = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const profile = useSelector((state: RootState) => state.profile);
  const [edit, setEdit] = useState(false);

  const handleClick = () => {
    if (!edit) {
      setEdit(true);
      form.setValues({
        location: profile?.location || "",
        portfolio: profile?.portfolio || "",
      });
    } else setEdit(false);
  };

  const form = useForm({
    mode: "controlled",
    validateInputOnChange: true,
    initialValues: { location: "", portfolio: "" },
    validate: {
      location: (value) => {
        if (!value || !value.trim()) return "Location is required for job applications";
        return null;
      },
      portfolio: (value) => {
        if (!value || !value.trim()) return null; // optional
        const url = value.trim();
        if (!/^https?:\/\/.+\..+/i.test(url)) return "Please enter a valid URL (e.g. https://your-portfolio.com)";
        return null;
      },
    },
  });

  const handleSave = async () => {
      const hasErrors = form.validate().hasErrors;
      if (hasErrors) return;
      setEdit(false);
      const updatedProfile = {...profile, id: profile?.id || user?.profileId, ...form.values};
      const savedProfile = await updateProfile(updatedProfile);
      dispatch(changeProfile(savedProfile));
      successNotification("Success","Profile updated successfully");
  
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-3 text-2xl sm:text-3xl font-semibold sm:flex-row sm:items-center">
        {user?.name || profile?.name || "Your Profile"}
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
        <>
          <TextInput
            {...form.getInputProps("location")}
            leftSection={<IconMapPin size={18} stroke={1.5} />}
            label="Location"
            withAsterisk
            placeholder="Enter your location"
            description="Required for job applications"
          />
          <TextInput
            {...form.getInputProps("portfolio")}
            leftSection={<IconWorld size={18} stroke={1.5} />}
            label="Website / Portfolio"
            placeholder="https://your-portfolio.com"
            description="Share a link to your portfolio, GitHub, or LinkedIn"
          />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-1 text-base text-mine-shaft-300 sm:text-lg">
              <IconMapPin className="h-5 w-5" stroke={1.5} />
              {profile?.location || "Add location"}
            </div>
            {profile?.portfolio && (
              <div className="flex items-center gap-1 text-base text-mine-shaft-300 sm:text-lg">
                <IconWorld className="h-5 w-5" stroke={1.5} />
                <a href={profile.portfolio} target="_blank" rel="noreferrer" className="text-bright-sun-400 hover:underline truncate max-w-[200px] sm:max-w-[300px]">
                  {profile.portfolio}
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
export default Info;
