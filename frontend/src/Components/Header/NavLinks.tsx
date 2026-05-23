import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../../Types"
import { isCompany, isStudent } from "../../Services/RoleService";

const NavLinks = ({ mobile = false }: { mobile?: boolean }) => {
  const user = useSelector((state: RootState) => state.user);
  const studentLinks = [
    {name: "Find Jobs", url:"find-jobs"},
    {name:"Applications", url:"job-history"},
    {name:"Profile", url:"profile"},
  ];
  const companyLinks = [
    {name:"Find Students", url:"find-talent"},
    {name:"Post Job", url:"post-job"},
    {name:"Posted Jobs", url:"posted-job"},
    {name:"Company Profile", url:"profile"},
  ];
  const guestLinks = [
    {name: "Find Jobs", url:"find-jobs"},
    {name:"Find Talent", url:"find-talent"},
    {name:"Sign Up", url:"sign-up"},
  ];
  const links = isCompany(user) ? companyLinks : isStudent(user) ? studentLinks : guestLinks;
  const location = useLocation();

  return (
        <div className={`${mobile ? "flex flex-col gap-1" : "hidden lg:flex gap-5 h-full items-center"} text-mine-shaft-300`}>
          {
            links.map((link,index)=>
            <div key={link.url ?? index} className={`${location.pathname=="/"+link.url?" border-bright-sun-400 text-bright-sun-400 bg-bright-sun-400/5": "border-transparent"}
             ${mobile ? "rounded-md border-l-3 px-3 py-3" : "border-b-[3px] h-full flex items-center bg-transparent"}`}>
              <Link className="block" to={`/${link.url}`} >{link.name}</Link>
              </div>
            )
          }
                    
        </div>
    
  )
}

export default NavLinks
