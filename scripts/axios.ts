import axios from "axios";

const customAxiosInstance = axios.create({
	timeout: 12000,
});
export default customAxiosInstance;
