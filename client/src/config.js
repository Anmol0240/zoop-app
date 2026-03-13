import axios from 'axios';

const API_URL = 'https://zoop-app.onrender.com';

export const api = axios.create({ baseURL: `${API_URL}/api` });
export const SOCKET_URL = API_URL;
