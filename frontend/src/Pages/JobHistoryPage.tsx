import AnimatedSection from "../Components/AnimatedSection";
import JobHistory from "../Components/JobHistory/JobHistory"



const JobHistoryPage = () => {
  return (
    
       <div className="site-page">
      <div className="site-container">
        <AnimatedSection animation="slide-up">
          <JobHistory/>
        </AnimatedSection>
      </div>
    </div>
    
  )
}

export default JobHistoryPage
