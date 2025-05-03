import axios from "axios";

const customAxiosInstance = axios.create({
	timeout: 60000,
	headers: {
		"User-Agent":
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2; rv:041.252.851) Gecko/20100101 Firefox/041.252.851",
		// "Cache-Control": "no-store",
		// Pragma: "no-cache",
		// Expires: "0",
	},
});
export default customAxiosInstance;
