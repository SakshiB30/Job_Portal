import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../../Types"
import { isCompany, isStudent } from "../../Services/RoleService";
import { IconSearch, IconUserPlus, IconFileText, IconBriefcase } from "@tabler/icons-react";

const iconMap: Record<string, React.ReactNode> = {
  "find-jobs": <IconSearch size={16} />,
  "find-talent": <IconUserPlus size={16} />,
  "job-history": <IconBriefcase size={16} />,
  "post-job": <IconFileText size={16} />,
  "posted-job": <IconBriefcase size={16} />,
};

const NavLinks = ({ mobile = false, compact = false }: { mobile?: boolean; compact?: boolean }) => {
  const user = useSelector((state: RootState) => state.user);

  const studentLinks = [
    {name: "Find Jobs", url:"find-jobs"},
    {name:"Applications", url:"job-history"},
  ];

  // Company navbar: only essential items
  const companyLinks = [
    {name:"Find Talent", url:"find-talent"},
    {name:"Post Job", url:"post-job"},
    {name:"Posted Jobs", url:"posted-job"},
  ];

  const guestLinks = [
    {name: "Find Jobs", url:"find-jobs"},
    {name:"Find Talent", url:"find-talent"},
  ];

  const links = isCompany(user) ? companyLinks : isStudent(user) ? studentLinks : guestLinks;
  const location = useLocation();

  if (compact) {
    return (
      <div className="flex flex-col gap-1 px-2 py-3">
        {links.map((link) => {
          const isActive = location.pathname === "/" + link.url;
          return (
            <Link
              key={link.url}
              to={`/${link.url}`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-bright-sun-400/10 text-bright-sun-400 border border-bright-sun-400/20"
                  : "text-mine-shaft-300 hover:bg-mine-shaft-800/50 hover:text-mine-shaft-100 border border-transparent"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                {iconMap[link.url]}
              </span>
              {link.name}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`${mobile ? "flex flex-col gap-1" : "hidden lg:flex gap-5 h-full items-center"} text-mine-shaft-300`}>
      {links.map((link) => {
        const isActive = location.pathname === "/" + link.url;
        return (
          <div
            key={link.url}
            className={`${isActive ? "border-bright-sun-400 text-bright-sun-400 bg-bright-sun-400/5" : "border-transparent hover:text-mine-shaft-100"}
             ${mobile ? "rounded-md border-l-3 px-3 py-3" : "border-b-[3px] h-full flex items-center bg-transparent transition-colors duration-200"}`}
          >
            <Link className="flex items-center gap-1.5 text-sm" to={`/${link.url}`}>
              {iconMap[link.url]}
              {link.name}
            </Link>
          </div>
        );
      })}
    </div>
  )
}

export default NavLinks
