import axios from "axios";

const customAxiosInstance = axios.create({
    timeout: 5000,
});
export default customAxiosInstance;
