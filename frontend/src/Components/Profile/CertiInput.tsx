import { Button, TextInput } from "@mantine/core";
import SelectInput from "./SelectInput";
import fields from "../../Data/ProfileData";
import { MonthPickerInput } from "@mantine/dates";
import { isNotEmpty, useForm } from "@mantine/form";
import { useDispatch, useSelector } from "react-redux";
import { successNotification } from "../../Services/NotificationService";
import { changeProfile } from "../../Slices/ProfileSlice";
import { updateProfile } from "../../Services/ProfileService";

const CertiInput = (props: any) => {
  const select = fields;
  const profile = useSelector((state: any) => state.profile);
  const dispatch = useDispatch();

  const form = useForm({
    mode: "controlled",
    validateInputOnChange: true,
    initialValues: {
      name: "",
      issuer: "",
      issueDate: new Date(),
      certificateId: "",
    },
    validate: {
      name: isNotEmpty("Name is required"),
      issuer: isNotEmpty("Issuer is required"),
      issueDate: isNotEmpty("Issue Date is required"),
      certificateId: isNotEmpty("Certificate ID is required"),
    },
  });

  const handleSave = async () => {
    form.validate();
    if (!form.isValid()) return;
    let certi = [...profile.certifications];
    certi.push(form.getValues());
    certi[certi.length - 1].issueDate =
      certi[certi.length - 1].issueDate.toISOString();
    let updatedProfile = { ...profile, certifications: certi };
    props.setEdit(false);
    const savedProfile = await updateProfile(updatedProfile);
    dispatch(changeProfile(savedProfile));
    successNotification("Success", "Certificate Added successfully");
  };

  return (
    <div className="flex flex-col gap-3">
      <div>Add Certificate</div>
      <div className="flex gap-10 *:w-1/2">
        <TextInput
          {...form.getInputProps("name")}
          label="Title"
          withAsterisk
          placeholder="Enter Title"
        />
        <SelectInput form={form} name="issuer" {...select[1]} />
      </div>
      <div className="flex gap-10 *:w-1/2">
        <MonthPickerInput
          {...form.getInputProps("issueDate")}
          withAsterisk
          maxDate={new Date()}
          label="Issue Date"
          placeholder="Enter Issue Date"
        />
        <TextInput
          {...form.getInputProps("certificateId")}
          label="Certificate ID"
          withAsterisk
          placeholder="Enter Certificate ID"
        />
      </div>
      <div className="flex gap-5">
        <Button onClick={handleSave} color="green.8" variant="light">
          {" "}
          Save{" "}
        </Button>
        <Button
          color="red.8"
          variant="light"
          onClick={() => props.setEdit(false)}
        >
          {" "}
          Cancel{" "}
        </Button>
      </div>
    </div>
  );
};

export default CertiInput;
