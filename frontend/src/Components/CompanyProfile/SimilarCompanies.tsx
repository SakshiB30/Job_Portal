import { similar } from "../../Data/CompanyData"
import CompanyCard from "./CompanyCard"

const SimilarCompanies = () => {
  return (
     <div className="w-full lg:w-1/4 mt-6 lg:mt-0">
      <div className="text-lg sm:text-xl font-semibold mb-5">Similar Companies</div>
        <div className="flex flex-row flex-wrap lg:flex-col gap-5">
            {similar.slice(0, 3).map((company,index) => <CompanyCard key={index} {...company}/>)}
        </div>
      </div>
  )
}

export default SimilarCompanies
