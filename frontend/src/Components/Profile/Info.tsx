import { ActionIcon } from "@mantine/core";
import {
  IconBuilding,
  IconBriefcase,
  IconCheck,
  IconMapPin,
  IconPencil,
  IconX,
} from "@tabler/icons-react";
import SelectInput from "./SelectInput";
import { useState } from "react";
import { useForm } from "@mantine/form";
import fields from "../../Data/ProfileData";
import { useDispatch, useSelector } from "react-redux";
import { changeProfile } from "../../Slices/ProfileSlice";
import { successNotification } from "../../Services/NotificationService";
import type { RootState } from "../../Types";
import { isCompany } from "../../Services/RoleService";
import { updateProfile } from "../../Services/ProfileService";


const Info = () => {
  const select = fields;
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const profile = useSelector((state: RootState) => state.profile);
  const companyProfile = isCompany(user);
  const [edit, setEdit] = useState(false);

  const handleClick = () => {
    if (!edit) {
      setEdit(true);
      form.setValues({
        jobTitle: profile?.jobTitle || "",
        company: profile?.company || user?.name || "",
        location: profile?.location || "",
      });
    } else setEdit(false);
  };

  const form = useForm({
    mode: "controlled",
    initialValues: { jobTitle: "", company: "", location: "" },
  });

  const handleSave = async () => {
      setEdit(false);
      const updatedProfile = {...profile, id: profile?.id || user?.profileId, ...form.values};
      const savedProfile = await updateProfile(updatedProfile);
      dispatch(changeProfile(savedProfile));
      successNotification("Success","Profile updated successfully");
  
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-3 text-3xl font-semibold sm:flex-row sm:items-center">
        {companyProfile ? profile?.company || user?.name || "Company Profile" : user?.name || profile?.name || "Your Profile"}
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
          {companyProfile ? (
            <SelectInput form={form} name="company" {...select[1]} label="Company Name" placeholder="Enter Company Name" leftSection={IconBuilding} />
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-10 sm:*:w-1/2">
              <SelectInput form={form} name="jobTitle" {...select[0]} />
              <SelectInput form={form} name="company" {...select[1]} />
            </div>
          )}
          <SelectInput form={form} name="location" {...select[2]} />
        </>
      ) : (
        <>
          {companyProfile ? (
            <div className="flex items-center gap-1 text-lg sm:text-xl">
              <IconBuilding className="h-5 w-5" stroke={1.5} />
              {profile?.company || user?.name || "Add company name"}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-lg sm:text-xl">
              <IconBriefcase className="h-5 w-5" stroke={1.5} />{" "}
              {profile?.jobTitle || "Add job title"} &bull; {profile?.company || "Add company"}
            </div>
          )}
          <div className="flex items-center gap-1 text-base text-mine-shaft-300 sm:text-lg">
            <IconMapPin className="h-5 w-5" stroke={1.5} />
            {profile?.location || "Add location"}
          </div>
        </>
      )}
    </>
  );
};
export default Info;
