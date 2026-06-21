import Marquee from "react-fast-marquee"
import { companies } from "../../Data/Data"
import AnimatedSection from "../AnimatedSection"

const Companies = () => {
    return (
        <AnimatedSection animation="slide-up" className="py-14">
            <div className="site-container px-4 text-3xl sm:px-6 lg:px-8 sm:text-4xl text-center font-semibold mb-10 text-mine-shaft-100">Trusted by <span className="text-bright-sun-400">1000+</span> Companies</div>
            <Marquee pauseOnHover={true}>
                {
                    companies.map((company, index) => <div key={index} className="mx-3 px-1 py-1 hover:bg-mine-shaft-900 rounded-xl cursor-pointer">
                        <img className="h-14 mx-5 object-contain" src={`/Companies/${company}.png`} alt={company}  />
                    </div>)
                }
            </Marquee>
        </AnimatedSection>
    )
}


export default Companies

