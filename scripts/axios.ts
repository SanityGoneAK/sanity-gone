import axios from "axios";

const customAxiosInstance = axios.create({
	timeout: 60000,
});
export default customAxiosInstance;
