import axios from "axios";
import { API_BASE_URL } from "../config/api";
const base_url = `${API_BASE_URL}/jobs/`;


const postJob = async (job: any) => {
  return axios
    .post(`${base_url}post`, job)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

const getAllJobs = async () => {
  return axios
    .get(`${base_url}getAll`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

const getAppliedJobs = async (userId: any) => {
  return axios
    .get(`${base_url}applications/${userId}`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

const applyJob = async (jobId: any, applicant: any) => {
  return axios
    .post(`${base_url}apply/${jobId}`, applicant)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

const getJob = async (id: any) => {
    return axios.get(`${base_url}get/${id}`)
    .then(res=>res.data)
    .catch(error=>{throw error;});
};

const updateApplicationStatus = async (jobId: string | number, applicantId: string | number, status: "APPLIED" | "INTERVIEWING" | "OFFERED" | "REJECTED" | "ACCEPTED" | "DECLINED") => {
  return axios
    .put(`${base_url}${jobId}/applicants/${applicantId}/status/${status}`)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
};

const deleteJob = async (id: any) => {
  return axios
    .delete(`${base_url}delete/${id}`)
    .then((res) => res.data)
    .catch((error) => { throw error; });
}

const closeJob = async (id: any) => {
  return axios
    .put(`${base_url}close/${id}`)
    .then((res) => res.data)
    .catch((error) => { throw error; });
}

const scheduleInterview = async (jobId: any, applicantId: any, interviewDetails: Record<string, string>) => {
  return axios
    .post(`${base_url}${jobId}/applicants/${applicantId}/schedule-interview`, interviewDetails)
    .then((res) => res.data)
    .catch((error) => { throw error; });
}

const getJobsByCompany = async (companyName: string) => {
  return axios
    .get(`${base_url}company/${encodeURIComponent(companyName)}`)
    .then((res) => res.data)
    .catch((error) => { throw error; });
};

const getMyJobs = async () => {
  return axios
    .get(`${base_url}my`)
    .then((res) => res.data)
    .catch((error) => { throw error; });
};export { postJob, getAllJobs, getAppliedJobs, getJob, applyJob, updateApplicationStatus, deleteJob, closeJob, getJobsByCompany, getMyJobs, scheduleInterview };
