import axios from "axios"
const base_url="http://localhost:8080/profiles/"

const getProfile= async(userId:any)=>{
    return axios.get(`${base_url}get/${userId}`)
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

const updateProfile= async( profileData:any)=>{
    return axios.put(`${base_url}update`, profileData)
    .then(res=>res.data)
    .catch(error=>{throw error;});
}

export {getProfile, updateProfile};

