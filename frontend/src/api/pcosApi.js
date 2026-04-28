import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const predictPCOS = async (formData) => {
  const response = await axios.post(`${API_URL}/predict`, formData);
  return response.data;
};