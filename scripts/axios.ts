import axios from "axios";

const customAxiosInstance = axios.create({
	timeout: 60000,
	headers: {
		"User-Agent":
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.1.0.0 Safari/537.36",
		"Cache-Control": "no-store",
		Pragma: "no-cache",
		Expires: "0",
	},
});
export default customAxiosInstance;
