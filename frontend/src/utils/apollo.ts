import {
	ApolloClient,
	createHttpLink,
	InMemoryCache,
	from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { toast } from "react-toastify";
import { graphqlUrl, localGraphqlUrl } from "../config.json";

const httpLink = createHttpLink({
	uri: !window.location.host.startsWith("localhost")
		? graphqlUrl
		: localGraphqlUrl,
});

const errorLink = onError(
	({ graphQLErrors, networkError, response, operation, forward }) => {
		console.log({ graphQLErrors }, { networkError }, { operation });

		if (graphQLErrors) {
			graphQLErrors.forEach(({ message, locations, path }) =>
				console.log(
					`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
				)
			);

			//@ts-ignore
			// response.errors = null;  to ignore errors to be thrown
			// return forward(operation); // to retry fetch operation
		}

		if (networkError) {
			// console.log(`[Network error]: ${networkError}`);
			toast.error("Network problem occured.");
			handleLogout();
		}
	}
);

const authLink = setContext((_, { headers }) => {
	const token = localStorage.getItem("token");
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : "",
		},
	};
});

export const client = new ApolloClient({
	link: authLink.concat(from([errorLink, httpLink])),
	cache: new InMemoryCache(),
	// uri: graphqlUrl, // error link added so this does not needed
});

const handleLogout = () => {
	localStorage.removeItem("token");
	localStorage.removeItem("userId");
	localStorage.removeItem("name");
	localStorage.removeItem("email");
	client.resetStore();

	window.location.href = "/user/login";
};
