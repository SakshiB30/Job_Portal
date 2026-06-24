import { Divider } from "@mantine/core";
import { IconMapPin, IconMail, IconPhone, IconLink, IconSchool, IconCode, IconAward } from "@tabler/icons-react";
import ExpCard from "./ExpCard";
import CertifCard from "./CertifCard";
import AnimatedSection from "../AnimatedSection";


const Profile = (props: any) => {
  const {
    name,
    location,
    about,
    skills = [],
    experience = [],
    certifications = [],
    email,
    phone,
    portfolio,
    resumeHeadline,
    education = [],
    projects = [],
    achievements = [],
  } = props;

  const hasBanner = !!props.banner;
  const bannerUrl = hasBanner ? `data:image/jpeg;base64,${props.banner}` : null;
  const profileUrl = props.image ? `/${props.image}` : props.picture ? `data:image/jpeg;base64,${props.picture}` : null;



  return (
    
    <div className="w-full">
      <div className="relative">
        {bannerUrl ? (
          <img className="rounded-t-2xl w-full h-32 sm:h-48 object-cover" src={bannerUrl} alt="" />
        ) : (
          <div className="rounded-t-2xl w-full h-32 sm:h-48 bg-gradient-to-br from-mine-shaft-700/40 via-mine-shaft-800/60 to-mine-shaft-950" />
        )}
        {profileUrl ? (
          <img
            className="h-24 w-24 sm:h-48 sm:w-48 rounded-full -bottom-1/4 sm:-bottom-1/3 absolute left-3 border-mine-shaft-950 border-4 sm:border-8 object-cover"
            src={profileUrl}
            alt={name || "Profile"}
          />
        ) : (
          <div className="h-24 w-24 sm:h-48 sm:w-48 rounded-full -bottom-1/4 sm:-bottom-1/3 absolute left-3 border-mine-shaft-950 border-4 sm:border-8 bg-gradient-to-br from-bright-sun-400 to-yellow-400 flex items-center justify-center text-3xl sm:text-6xl font-bold text-mine-shaft-950">
            {(name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <div className="mt-16 sm:mt-32">
        <div className="text-xl sm:text-3xl font-semibold">
          {name}
        </div>
        <div className="text-base sm:text-lg flex gap-1 items-center text-mine-shaft-300">
          <IconMapPin className="h-5 w-5 shrink-0" stroke={1.5} />
          <span className="truncate">{location}</span>
        </div>

        {/* Contact info row */}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mine-shaft-300">
          {email && (
            <div className="flex items-center gap-1.5">
              <IconMail size={16} className="text-mine-shaft-500 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-1.5">
              <IconPhone size={16} className="text-mine-shaft-500 shrink-0" />
              <span>{phone}</span>
            </div>
          )}
          {portfolio && (
            <div className="flex items-center gap-1.5">
              <IconLink size={16} className="text-mine-shaft-500 shrink-0" />
              <a href={portfolio} target="_blank" rel="noreferrer" className="text-bright-sun-400 hover:underline truncate max-w-[200px]">
                {portfolio}
              </a>
            </div>
          )}
        </div>

        {resumeHeadline && (
          <div className="mt-2 text-sm font-medium text-bright-sun-400">
            {resumeHeadline}
          </div>
        )}
      </div>
      <Divider mx="xs" my="xl" />
      <AnimatedSection animation="fade-in">
      <div>
        <div className="text-2xl font-semibold mb-3">About</div>
        <div className="text-sm text-mine-shaft-300 text-justify">{about}</div>
      </div>
      </AnimatedSection>
      <Divider mx="xs" my="xl" />
      <AnimatedSection animation="fade-in">
      <div>
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
      <div>
        <div className="text-2xl font-semibold mb-5">Experience</div>
        <div className="flex flex-col gap-8">
          {experience?.map((exp: any, index: any) => (
            <ExpCard key={index} {...exp} />
          ))}
        </div>
      </div>
      </AnimatedSection>
      <Divider mx="xs" my="xl" />

      {/* Education section */}
      {education?.length > 0 && (
        <>
          <AnimatedSection animation="slide-up">
            <div>
              <div className="text-2xl font-semibold mb-5 flex items-center gap-2">
                <IconSchool size={28} className="text-bright-sun-400" /> Education
              </div>
              <div className="flex flex-col gap-6">
                {education.map((edu: Record<string, string>, index: number) => (
                  <div key={index} className="flex flex-col gap-1 rounded-lg border border-mine-shaft-800 bg-mine-shaft-900/60 p-4">
                    <div className="font-semibold text-mine-shaft-100">{edu?.degree || edu?.field || "Degree"} {edu?.field ? `in ${edu.field}` : ""}</div>
                    <div className="text-sm text-mine-shaft-300">{edu?.school || edu?.institution || "School"}</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mine-shaft-400">
                      {edu?.grade && <span>Grade: {edu.grade}</span>}
                      {(edu?.startYear || edu?.endYear) && (
                        <span>{edu.startYear || "?"} - {edu.endYear || "Present"}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
          <Divider mx="xs" my="xl" />
        </>
      )}

      {/* Projects section */}
      {projects?.length > 0 && (
        <>
          <AnimatedSection animation="slide-up">
            <div>
              <div className="text-2xl font-semibold mb-5 flex items-center gap-2">
                <IconCode size={28} className="text-bright-sun-400" /> Projects
              </div>
              <div className="flex flex-col gap-6">
                {projects.map((proj: Record<string, string>, index: number) => (
                  <div key={index} className="flex flex-col gap-1 rounded-lg border border-mine-shaft-800 bg-mine-shaft-900/60 p-4">
                    <div className="font-semibold text-mine-shaft-100">{proj?.name || "Project"}</div>
                    {proj?.description && (
                      <div className="text-sm text-mine-shaft-300 text-justify">{proj.description}</div>
                    )}
                    {proj?.technologies && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {proj.technologies.split(",").map((tech: string, i: number) => (
                          <span key={i} className="bg-bright-sun-300/10 text-xs font-medium rounded-2xl text-bright-sun-400 px-2 py-0.5">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mine-shaft-400 mt-1">
                      {(proj?.startDate || proj?.endDate) && (
                        <span>{proj.startDate || "?"} - {proj.endDate || "Present"}</span>
                      )}
                      {proj?.link && (
                        <a href={proj.link} target="_blank" rel="noreferrer" className="text-bright-sun-400 hover:underline truncate">
                          View Project
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
          <Divider mx="xs" my="xl" />
        </>
      )}

      {/* Achievements section */}
      {achievements?.length > 0 && (
        <>
          <AnimatedSection animation="slide-up">
            <div>
              <div className="text-2xl font-semibold mb-5 flex items-center gap-2">
                <IconAward size={28} className="text-bright-sun-400" /> Achievements
              </div>
              <ul className="list-disc list-inside text-sm text-mine-shaft-300 space-y-2">
                {achievements.map((ach: string, index: number) => (
                  <li key={index}>{ach}</li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
          <Divider mx="xs" my="xl" />
        </>
      )}

      <AnimatedSection animation="slide-up">
      <div>
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
 