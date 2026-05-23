import { Button, Divider } from "@mantine/core";
import { IconBriefcase, IconMapPin } from "@tabler/icons-react";
import ExpCard from "./ExpCard";
import CertifCard from "./CertifCard";


const Profile = (props: any) => {
  console.log(props);
  const {
    name,
    role,
    company,
    location,
    about,
    skills = [],
    experience = [],
    certifications = [],
  } = props;



  return (
    
    <div className="w-2/3">
      <div className="relative">
        <img className="rounded-t-2xl" src="/Profile/banner2.jpg" alt="" />
        <img
          className="h-48 w-48 rounded-full -bottom-1/3 absolute left-3 border-mine-shaft-950 border-8"
          src="/A1.png"
          alt=""
        />
      </div>

      <div className="px-3 mt-30">
        <div className="text-3xl font-semibold flex justify-between">
          {name}
          <Button color="brightSun.4" variant="light">
            Message
          </Button>
        </div>
        <div className="text-xl flex gap-1 items-center">
          <IconBriefcase className="h-5 w-5" stroke={1.5} /> {role} &bull;{" "}
          {company}
        </div>
        <div className="text-lg flex gap-1 items-center text-mine-shaft-300">
          <IconMapPin className="h-5 w-5" stroke={1.5} />
          {location}
        </div>
      </div>
      <Divider mx="xs" my="xl" />
      <div className="px-3!">
        <div className="text-2xl font-semibold mb-3">About</div>
        <div className="text-sm text-mine-shaft-300 text-justify">{about}</div>
      </div>
      <Divider mx="xs" my="xl" />
      <div className="px-3">
        <div className="text-2xl font-semibold mb-3">Skills</div>
        <div className="flex flex-wrap gap-2">
          {skills?.map((skill: any, index: any) => (
            <div
              key={index}
              className=" bg-bright-sun-300/15 text-sm font-medium rounded-3xl text-bright-sun-400 px-3 py-1"
            >
              {skill}
            </div>
          ))}
        </div>
      </div>
      <Divider mx="xs" my="xl" />
      <div className="px-3">
        <div className="text-2xl font-semibold mb-5">Experience</div>
        <div className="flex flex-col gap-8">
          {experience?.map((exp: any, index: any) => (
            <ExpCard key={index} {...exp} />
          ))}
        </div>
      </div>
      <Divider mx="xs" my="xl" />
      <div className="px-3">
        <div className="text-2xl font-semibold mb-5">Certifications</div>
        <div className="flex flex-col gap-8">
          {certifications?.map((certi: any, index: any) => (
            <CertifCard key={index} {...certi} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
 