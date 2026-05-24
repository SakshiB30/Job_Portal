import AnimatedSection from "../Components/AnimatedSection";
import Profile from "../Components/Profile/Profile";


const ProfilePage = () => {
  return (
    <div className="site-page">
      <AnimatedSection animation="slide-up">
        <Profile />
      </AnimatedSection>
    </div>
  )
}

export default ProfilePage
 
