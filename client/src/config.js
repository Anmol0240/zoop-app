import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://zoop-server.onrender.com';

export const api = axios.create({ baseURL: `${API_URL}/api` });
export const SOCKET_URL = API_URL;