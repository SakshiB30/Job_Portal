import { Avatar, Divider, Tabs } from "@mantine/core";
import { IconBuilding, IconMapPin } from "@tabler/icons-react";
import AboutComp from "./AboutComp";
import CompanyJobs from "./CompanyJobs";
import CompanyEmployee from "./CompanyEmployee";
import type { ProfileState } from "../../Types";

const Company = ({ data }: { data: ProfileState | null }) => {
  const companyName = data?.company || "Company";
  const companyLocation = data?.headquarters || data?.location || "Location not specified";
  const bannerSrc = data?.banner
    ? `data:image/jpeg;base64,${data.banner}`
    : "/Profile/banner2.jpg";
  const logoUrl = data?.picture
    ? `data:image/jpeg;base64,${data.picture}`
    : `/Icons/${companyName}.png`;

  return (
    <div className="w-3/4">
      <div className="relative">
        <img className="rounded-t-2xl h-48 w-full object-cover" src={bannerSrc} alt="" />
        <img
          className="h-48 w-48 rounded-3xl -bottom-1/4 absolute left-5 p-2 border-mine-shaft-950 border-8 bg-mine-shaft-950 object-contain"
          src={logoUrl}
          alt={companyName}
        />
      </div>

      <div className="px-3 mt-20">
        <div className="text-3xl font-semibold flex justify-between">
          {companyName}
          <Avatar.Group>
            <Avatar src="A1.png" />
            <Avatar src="A2.png" />
            <Avatar src="A3.png" />
            <Avatar>+10k</Avatar>
          </Avatar.Group>
        </div>

        <div className="flex gap-4 items-center mt-1">
          <div className="flex gap-1 items-center text-mine-shaft-300">
            <IconMapPin className="h-5 w-5" stroke={1.5} />
            {companyLocation}
          </div>
          {data?.industry && (
            <div className="flex gap-1 items-center text-mine-shaft-300">
              <IconBuilding className="h-5 w-5" stroke={1.5} />
              {data.industry}
            </div>
          )}
          {data?.companySize && (
            <div className="rounded-full bg-mine-shaft-800 px-3 py-1 text-xs text-bright-sun-400">
              {data.companySize}
            </div>
          )}
        </div>
      </div>
      <Divider my="xl" />
      <div>
        <Tabs variant="outline" radius="lg" defaultValue="about">
          <Tabs.List className="[&_button]:text-lg! font-semibold! mb-5 [&_button[data-active='true']]:text-bright-sun-400!">
            <Tabs.Tab value="about">About</Tabs.Tab>
            <Tabs.Tab value="jobs">Jobs</Tabs.Tab>
            <Tabs.Tab value="employees">Employees</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="about"><AboutComp data={data} /></Tabs.Panel>
          <Tabs.Panel value="jobs"><CompanyJobs companyName={companyName || data?.company || ""} /></Tabs.Panel>
          <Tabs.Panel value="employees"><CompanyEmployee companyName={companyName || data?.company || ""} /></Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};

export default Company;
