import { IconAnchor, IconBrandFacebook, IconBrandInstagram, IconBrandX } from "@tabler/icons-react"
import { footerLinks } from "../../Data/Data"
import { useLocation } from "react-router-dom"

const Footer = () => {
  const location = useLocation();
  return (
    location.pathname!="/sign-up" && location.pathname!="/login" ?<div className="pt-20 pb-5 flex gap-5 justify-around bg-mine-shaft-950 font-['poppins']">
      <div className="w-1/4 flex flex-col gap-4">
        <div className="flex gap-1 items-center text-bright-sun-400">
            <IconAnchor className="h-6 w-6" stroke={2.5}/>
            <div className="text-xl font-semibold">JobHook</div>
        </div>  
        <div className="text-sm text-mine-shaft-300">Job portal with user Profiles, skills updates, certifications, work experience and admin job postings.</div>
        <div className="flex gap-3 text-bright-sun-400 [&>div]:bg-mine-shaft-900 [&>div]:p-2 [&>div]:rounded-full hover:[&>div]:cursor-pointer [&>div]:hover:bg-mine-shaft-800 duration-300">
          <div><IconBrandFacebook /></div> 
          <div><IconBrandInstagram/></div>
          <div><IconBrandX/></div>
        </div>
      </div>

      {
        footerLinks.map((item, index) => <div key={index}>
          <div className="text-lg font-semibold mb-4 text-bright-sun-400">{item.title}</div>
          {
            item.links.map((link, linkIndex) => <div key={linkIndex} className="text-sm text-mine-shaft-300 hover:text-bright-sun-400 cursor-pointer mb-1 hover:translate-x-2 transition duration-300 ease-in-out ">{link}</div>)
          }

        </div>)
      }
    </div>:
    <>
    </>
    
  )
}

export default Footer
