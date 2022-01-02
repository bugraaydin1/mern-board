import Axios from "axios";
import { config } from "process";
import { toast } from "react-toastify";
import { baseApiUrl, localBaseApiUrl } from "../config.json";

const axios = Axios.create({
	baseURL: !window.location.host.startsWith("localhost")
		? baseApiUrl
		: localBaseApiUrl,
});

axios.interceptors.request.use(
	(conf) => {
		return config;
	},
	(err) => {
		console.log({ err });
		return Promise.reject(err);
	}
);

axios.interceptors.response.use(
	(res) => {
		if ([200, 201].includes(res.status)) {
			toast.success("Succesfully done.");
		}
	},
	(err) => {
		console.log("interceptor Err:", err.response?.data);

		// ABA graphql error array status:
		let errorMessage = "";
		const graphqlErr = err.errors?.[0];

		if (err.response && graphqlErr) {
			switch (err.response?.data /* graphqlErr.status */) {
				case 401:
					errorMessage = graphqlErr.message || "Authorization failed";
					break;
				case 404: // do nothing
					break;
				case 422:
					errorMessage = graphqlErr.message || "Content is not valid";
					break;
				case 500:
				case 501:
				case 502:
				case 503:
				case 504:
				case 505:
				case 506:
				case 507:
				case 508:
				case 509:
				case 510:
				case 511:
					errorMessage = graphqlErr.message || "Unexpected error occured.";
					break;
				default:
					errorMessage = graphqlErr.message || err.response?.statusText;
					break;
			}
			errorMessage && toast.error(errorMessage);
			throw new Error(err);
		}
	}
);

export default axios;
