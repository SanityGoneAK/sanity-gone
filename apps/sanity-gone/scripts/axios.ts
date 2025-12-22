import axios from "axios";

const customAxiosInstance = axios.create({
	timeout: 60000,
	headers: {
		"User-Agent":
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.479 (KHTML, like Gecko) Version/12.1.1 Safari/601.1.84",
		// "Cache-Control": "no-store",
		// Pragma: "no-cache",
		// Expires: "0",
	},
});
export default customAxiosInstance;
