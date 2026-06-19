import axios from "axios";

const baseUrl = "/api/admin";

export const getAdminProfile = async () => (await axios.get(`${baseUrl}/profile`)).data;
export const updateAdminProfile = async (payload: any) => (await axios.put(`${baseUrl}/profile`, payload)).data;
export const getAdminStats = async () => (await axios.get(`${baseUrl}/stats`)).data;
export const getAdminUsers = async (search = "") => (await axios.get(`${baseUrl}/users`, { params: { search } })).data;
export const getAdminCompanies = async (search = "") => (await axios.get(`${baseUrl}/companies`, { params: { search } })).data;
export const setUserBlocked = async (id: string | number, blocked: boolean) => (await axios.patch(`${baseUrl}/block-user/${id}`, null, { params: { blocked } })).data;
export const setCompanyBlocked = async (id: string | number, blocked: boolean) => (await axios.patch(`${baseUrl}/block-company/${id}`, null, { params: { blocked } })).data;
