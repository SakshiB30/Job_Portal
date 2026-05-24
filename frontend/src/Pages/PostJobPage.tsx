import PostJob from "../Components/PostJob/PostJob"
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

const PostJobPage = () => {
  const user = useSelector((state:any) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
      <div className="site-page">
        <PostJob/>
      </div>
  )
}

export default PostJobPage
