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
    return axios.post(`${base_url}sendOtp/${email}`)
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

const verifyOtp= async(email:any, otp:any)=>{
    return axios.get(`${base_url}verifyOtp/${email}/${otp}`)
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

const changePass= async(email:string, password:string)=>{
    return axios.post(`${base_url}changePass`, {email, password})
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

const sendSelectionEmail = async(selectionDetails:any)=>{
    return axios.post(`${base_url}selection-email`, selectionDetails)
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

export {registerUser, loginUser, getUser, toggleSaveJob, sendOTP, verifyOtp, changePass, sendSelectionEmail }
