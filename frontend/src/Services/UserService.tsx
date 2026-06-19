import axios from "axios"
const base_url="/api/users/"

const registerUser= async(user:any)=>{
    return axios.post(`${base_url}register`,user)
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

const loginUser = async (login: any) => {
  return axios.post(`${base_url}login`, login)
    .then(res => {
      const bodyToken = res.data?.token ? `Bearer ${res.data.token}` : null;
      const token = res.headers['authorization'] || res.headers['Authorization'] || bodyToken;
      if (token) {
        try {
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = token;
        } catch (e) {
          console.warn('Failed to store token', e);
        }
      }
      return res.data?.user || res.data;
    })
    .catch(error => {
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Message:", error.response.data);
      } else if (error.request) {
        console.log("No response from server");
      } else {
        console.log("Error:", error.message);
      }
      throw error; 
    });
}

const getUser = async (userId: any) => {
  return axios.get(`${base_url}${userId}`)
    .then(res => res.data)
    .catch(error => { throw error; });
}

const toggleSaveJob = async (userId: any, jobId: any) => {
  return axios.post(`${base_url}${userId}/save/${jobId}`)
    .then(res => res.data)
    .catch(error => { throw error; });
}



const sendOTP= async(email:any)=>{
    return axios.post(`${base_url}sendOtp/${encodeURIComponent(email)}`)
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

const verifyOtp= async(email:any, otp:any)=>{
    return axios.get(`${base_url}verifyOtp/${encodeURIComponent(email)}/${otp}`)
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

const changePass= async(email:string, password:string)=>{
    return axios.post(`${base_url}changePass`, {email, password})
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

const resetPass= async(email:string, otp:string, password:string)=>{
    return axios.post(`${base_url}resetPass`, {email, otp, password})
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

const followProfile = async (userId: any, profileId: any) => {
  return axios.post(`${base_url}${userId}/follow/${profileId}`)
    .then(res => res.data)
    .catch(error => { throw error; });
};

const unfollowProfile = async (userId: any, profileId: any) => {
  return axios.post(`${base_url}${userId}/unfollow/${profileId}`)
    .then(res => res.data)
    .catch(error => { throw error; });
};

const getFollowing = async (userId: any) => {
  return axios.get(`${base_url}${userId}/following`)
    .then(res => res.data)
    .catch(error => { throw error; });
};

const sendSelectionEmail = async(selectionDetails:any)=>{
    return axios.post(`${base_url}selection-email`, selectionDetails)
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

const sendInvitationEmail = async(invitationDetails:any)=>{
    return axios.post(`${base_url}invitation-email`, invitationDetails)
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

const sendInterviewEmail = async(interviewDetails:any)=>{
    return axios.post(`${base_url}interview-email`, interviewDetails)
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

export {registerUser, loginUser, getUser, toggleSaveJob, sendOTP, verifyOtp, changePass, resetPass, sendSelectionEmail, sendInvitationEmail, sendInterviewEmail, followProfile, unfollowProfile, getFollowing }
