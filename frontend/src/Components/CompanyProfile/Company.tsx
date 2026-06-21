import { Avatar, Divider, Tabs } from "@mantine/core";
import { IconBuilding, IconMapPin } from "@tabler/icons-react";
import AboutComp from "./AboutComp";
import CompanyJobs from "./CompanyJobs";
import CompanyEmployee from "./CompanyEmployee";
import CompanyLogo from "../CompanyLogo";
import type { ProfileState } from "../../Types";
import AnimatedSection from "../AnimatedSection";

const Company = ({ data }: { data: ProfileState | null }) => {
  const companyName = data?.company || "Company";
  const companyLocation = data?.headquarters || data?.location || "Location not specified";
  const bannerSrc = data?.banner
    ? `data:image/jpeg;base64,${data.banner}`
    : "/Profile/banner2.jpg";

  return (
    <div className="w-full lg:w-3/4">
      <div className="relative">
        <img className="rounded-t-2xl h-32 sm:h-48 w-full object-cover" src={bannerSrc} alt="" />
        <div className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 -bottom-1/4 absolute left-3 sm:left-5 p-2 border-mine-shaft-950 border-4 sm:border-8 bg-mine-shaft-950 rounded-3xl overflow-hidden">
          <CompanyLogo logo={data?.companyLogo} picture={data?.picture} company={companyName} className="h-full w-full" />
        </div>
      </div>

      <div className="px-3 mt-12 sm:mt-16 md:mt-20">
        <div className="text-xl sm:text-2xl md:text-3xl font-semibold flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between">
          {companyName}
          <Avatar.Group>
            <Avatar src="A1.png" />
            <Avatar src="A2.png" />
            <Avatar src="A3.png" />
            <Avatar>+10k</Avatar>
          </Avatar.Group>
        </div>

        <div className="flex flex-wrap gap-3 items-center mt-1">
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
      <AnimatedSection animation="fade-in">
      <div>
        <Tabs variant="outline" radius="lg" defaultValue="about">
          <Tabs.List className="[&_button]:text-base! sm:[&_button]:text-lg! font-semibold! mb-5 [&_button[data-active='true']]:text-bright-sun-400!">
            <Tabs.Tab value="about">About</Tabs.Tab>
            <Tabs.Tab value="jobs">Jobs</Tabs.Tab>
            <Tabs.Tab value="employees">Employees</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="about"><AboutComp data={data} /></Tabs.Panel>
          <Tabs.Panel value="jobs"><CompanyJobs companyName={companyName || data?.company || ""} /></Tabs.Panel>
          <Tabs.Panel value="employees"><CompanyEmployee companyName={companyName || data?.company || ""} /></Tabs.Panel>
        </Tabs>
      </div>
      </AnimatedSection>
    </div>
  );
};

export default Company;
