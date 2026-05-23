import { Avatar, Divider, Tabs } from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import AboutComp from "./AboutComp";
import CompanyJobs from "./CompanyJobs";
import CompanyEmployee from "./CompanyEmployee";

const Company = () => {
  return (
    <div className="w-3/4">
      <div className="relative">
        <img className="rounded-t-2xl" src="/Profile/banner2.jpg" alt="" />
        <img
          className="h-48 w-48 rounded-3xl -bottom-1/4 absolute left-5 p-2  border-mine-shaft-950 border-8 bg-mine-shaft-950"
          src="/Icons/Google.png"
          alt=""
        />
      </div>

      <div className="px-3 mt-20">
        <div className="text-3xl font-semibold flex justify-between">
          Google
          <Avatar.Group>
            <Avatar src="A1.png" />
            <Avatar src="A2.png" />
            <Avatar src="A3.png" />
            <Avatar>+10k</Avatar>
          </Avatar.Group>
        </div>

        <div className="text-lg flex gap-1 items-center text-mine-shaft-300">
          <IconMapPin className="h-5 w-5" stroke={1.5} />
          New York, United States
        </div>
      </div>
      <Divider my="xl" />
      <div>
        <Tabs variant="outline" radius="lg" defaultValue="about">
          <Tabs.List className="[&_button]:text-lg! font-semibold! mb-5  [&_button[data-active='true']]:text-bright-sun-400! ">
            <Tabs.Tab value="about">About</Tabs.Tab>
            <Tabs.Tab value="jobs">Jobs</Tabs.Tab>
            <Tabs.Tab value="employees">Employees</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="about"><AboutComp/></Tabs.Panel>
          <Tabs.Panel value="jobs"><CompanyJobs/></Tabs.Panel>
          <Tabs.Panel value="employees"><CompanyEmployee/></Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};

export default Company;
