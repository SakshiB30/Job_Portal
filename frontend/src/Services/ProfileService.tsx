import axios from "axios"
import { API_BASE_URL } from "../config/api";
const base_url=`${API_BASE_URL}/profiles/`

const getProfile= async(userId:any)=>{
    return axios.get(`${base_url}get/${userId}`)
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

const getCompanyProfile = async (companyName: string) => {
  return axios.get(`${base_url}company/${encodeURIComponent(companyName)}`)
    .then(res => res.data)
    .catch(error => { throw error; });
};

const getCompanyEmployees = async (companyName: string) => {
  return axios.get(`${base_url}company/${encodeURIComponent(companyName)}/employees`)
    .then(res => res.data)
    .catch(error => { throw error; });
};

const getApplicantProfiles = async () => {
  return axios.get(`${base_url}applicants`)
    .then(res => res.data)
    .catch(error => { throw error; });
};

const updateProfile= async( profileData:any)=>{
    return axios.put(`${base_url}update`, profileData)
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

export {getProfile, getCompanyProfile, getCompanyEmployees, getApplicantProfiles, updateProfile};

