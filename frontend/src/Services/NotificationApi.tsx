import axios from "axios";
const base_url = "http://localhost:8080/notifications/";

export type WebsiteNotification = {
  id?: string | number;
  recipientId?: string | number;
  title?: string;
  message?: string;
  link?: string;
  timeStamp?: string;
  read?: boolean;
  type?: string;
};

const getNotifications = async (userId: string | number) => {
  return axios.get(`${base_url}user/${userId}`)
    .then(res => res.data)
    .catch(error => { throw error; });
}

const markRead = async (id: string | number) => {
  return axios.put(`${base_url}${id}/read`)
    .then(res => res.data)
    .catch(error => { throw error; });
}

const markAllRead = async (userId: string | number) => {
  return axios.put(`${base_url}user/${userId}/readAll`)
    .then(res => res.data)
    .catch(error => { throw error; });
}

export { getNotifications, markRead, markAllRead };
