import axios from "axios";

const customAxiosInstance = axios.create({
	timeout: 8000,
});
export default customAxiosInstance;
