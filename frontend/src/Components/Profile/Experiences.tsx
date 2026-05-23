import { ActionIcon } from "@mantine/core";
import {  IconPencil, IconPlus, IconX } from "@tabler/icons-react";
import { useState } from "react";
import {  useSelector } from "react-redux";
import ExpInput from "./ExpInput";
import ExpCard from "./ExpCard";
import type { RootState } from "../../Types";

const Experiences = () => {
  const [edit, setEdit] = useState(false);
  const profile = useSelector((state: RootState) => state.profile);
  const [addExp, setAddExp] = useState(false);

  const handleClick = () => {
    setEdit(!edit);
  };



  return (
    <div>
          <div className="text-2xl font-semibold mb-5 flex justify-between">
            Experience
            <div className="flex gap-2">
              <ActionIcon
                onClick={() => setAddExp(true)}
                variant="subtle"
                color="brightSun.4"
                size="lg"
              >
                <IconPlus className="h-4/5 w-4/5" />
              </ActionIcon>
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

          <div className="flex flex-col gap-8">
            {profile?.experiences?.length ? profile.experiences.map((exp, index: number) => (
              <ExpCard key={index} index={index} {...exp} edit={edit} />
            )) : !addExp && <div className="rounded-md border border-dashed border-mine-shaft-700 p-5 text-sm text-mine-shaft-300">Add work experience to show your career timeline.</div>}
            {addExp && <ExpInput add setEdit={setAddExp} />}
          </div>
        </div>

  );
};

export default Experiences;
