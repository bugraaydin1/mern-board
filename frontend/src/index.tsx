import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { RouteElements } from "./routes/Routes";
import { ApolloProvider } from "@apollo/client";
import { ToastContainer } from "react-toastify";
import { client } from "./utils/apollo";
import reportWebVitals from "./reportWebVitals";
import "@asseinfo/react-kanban/dist/styles.css";
import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import "flatpickr/dist/themes/airbnb.css";
import "./index.css";

ReactDOM.render(
	<React.StrictMode>
		<ApolloProvider client={client}>
			<BrowserRouter>
				<RecoilRoot>
					<RouteElements />
				</RecoilRoot>
			</BrowserRouter>
		</ApolloProvider>
		<ToastContainer />
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
