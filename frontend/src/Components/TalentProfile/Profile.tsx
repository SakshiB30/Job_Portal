import { Button, Divider } from "@mantine/core";
import { IconBriefcase, IconMapPin } from "@tabler/icons-react";
import ExpCard from "./ExpCard";
import CertifCard from "./CertifCard";
import AnimatedSection from "../AnimatedSection";


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
    
    <div className="w-full lg:w-2/3">
      <div className="relative">
        <img className="rounded-t-2xl w-full h-32 sm:h-48 object-cover" src="/Profile/banner2.jpg" alt="" />
        <img
          className="h-24 w-24 sm:h-48 sm:w-48 rounded-full -bottom-1/4 sm:-bottom-1/3 absolute left-3 border-mine-shaft-950 border-4 sm:border-8 object-cover"
          src={props.image ? `/${props.image}` : props.picture ? `data:image/jpeg;base64,${props.picture}` : "/A1.png"}
          alt={name || "Profile"}
        />
      </div>

      <div className="px-3 mt-16 sm:mt-32">
        <div className="text-xl sm:text-3xl font-semibold flex flex-col sm:flex-row sm:justify-between gap-2">
          {name}
          <Button color="brightSun.4" variant="light" size="sm" className="self-start sm:self-auto">
            Message
          </Button>
        </div>
        <div className="text-base sm:text-xl flex gap-1 items-center">
          <IconBriefcase className="h-5 w-5 shrink-0" stroke={1.5} /> <span className="truncate">{role} &bull; {company}</span>
        </div>
        <div className="text-base sm:text-lg flex gap-1 items-center text-mine-shaft-300">
          <IconMapPin className="h-5 w-5 shrink-0" stroke={1.5} />
          <span className="truncate">{location}</span>
        </div>
      </div>
      <Divider mx="xs" my="xl" />
      <AnimatedSection animation="fade-in">
      <div className="px-3">
        <div className="text-2xl font-semibold mb-3">About</div>
        <div className="text-sm text-mine-shaft-300 text-justify">{about}</div>
      </div>
      </AnimatedSection>
      <Divider mx="xs" my="xl" />
      <AnimatedSection animation="fade-in">
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
      </AnimatedSection>
      <Divider mx="xs" my="xl" />
      <AnimatedSection animation="slide-up">
      <div className="px-3">
        <div className="text-2xl font-semibold mb-5">Experience</div>
        <div className="flex flex-col gap-8">
          {experience?.map((exp: any, index: any) => (
            <ExpCard key={index} {...exp} />
          ))}
        </div>
      </div>
      </AnimatedSection>
      <Divider mx="xs" my="xl" />
      <AnimatedSection animation="slide-up">
      <div className="px-3">
        <div className="text-2xl font-semibold mb-5">Certifications</div>
        <div className="flex flex-col gap-8">
          {certifications?.map((certi: any, index: any) => (
            <CertifCard key={index} {...certi} />
          ))}
        </div>
      </div>
      </AnimatedSection>
    </div>
  );
};

export default Profile;
 