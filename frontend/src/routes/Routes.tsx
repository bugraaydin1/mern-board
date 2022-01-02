import { useRoutes } from "react-router-dom";
import { Navigate, useNavigate } from "react-router";
import { useRecoilState } from "recoil";
import { useMutation } from "@apollo/client";
import { USER_LOGIN, USER_SIGNUP } from "../graphql/query";
import { client } from "../utils/apollo";
import { IsAuth, LoggedUser } from "./../utils/state";
import { User } from "../types/types";
import jwt from "jwt-decode";
import App from "../pages/App";
import Auth from "../pages/Auth";
import { toast } from "react-toastify";

export const RouteElements = () => {
	const [isAuth, setIsAuth] = useRecoilState(IsAuth);
	const [loggedUser, setLoggedUser] =
		useRecoilState<User.LoggedUser>(LoggedUser);

	const navigate = useNavigate();

	const [signupUser] = useMutation(USER_SIGNUP, {
		fetchPolicy: "network-only",
	});
	const [loginUser] = useMutation(USER_LOGIN, { fetchPolicy: "network-only" });

	const handleSignup = (signup: User.ISignup) => {
		signupUser({ variables: { signup } }).then(
			(res) => {
				res.data.signup && navigate("/user/login");
			},
			(reason) => {
				toast.warn(reason.message);
			}
		);
	};

	const handleLogin = (login: User.ILogin) => {
		loginUser({ variables: { login } }).then(
			(res) => {
				const loginData = res.data.login;

				if (loginData?.token) {
					const user = loginData.user;
					setIsAuth(true);
					setLoggedUser({
						token: loginData.token,
						name: user.name,
						email: user.email,
						userId: user._id,
					});

					localStorage.setItem("token", loginData.token);
					localStorage.setItem("userId", loginData.user._id);
					localStorage.setItem("name", loginData.user.name);
					localStorage.setItem("email", loginData.user.email);
					client.resetStore();
					navigate("/board");
				}
			},
			(reason) => {
				toast.warn(reason.message);
			}
		);
	};

	const handleGoogleLogin = (token: string) => {
		const user: User.LoggedUser = jwt(token);

		if (user.userId) {
			setIsAuth(true);
			setLoggedUser({
				token: token,
				name: user.name,
				email: user.email,
				userId: user.userId,
				picture: user.picture,
			});

			localStorage.setItem("token", token);
			localStorage.setItem("userId", user.userId as string);
			localStorage.setItem("name", user.name as string);
			localStorage.setItem("email", user.email as string);
			localStorage.setItem("p_url", user.picture as string);
			client.resetStore();

			setTimeout(() => {
				navigate("/board");
			}, 500);
		}
	};

	const handleLogout = () => {
		setIsAuth(false);
		setLoggedUser({});
		localStorage.removeItem("token");
		localStorage.removeItem("userId");
		localStorage.removeItem("name");
		localStorage.removeItem("email");
		client.resetStore();
		navigate("/user/login");
	};

	return useRoutes([
		{
			path: "/board",
			children: isAuth
				? [
						{
							path: "",
							element: (
								<App
									isAuth={isAuth}
									user={loggedUser}
									interval={-1}
									onLogout={handleLogout}
								/>
							),
						},
						{
							path: "today",
							element: (
								<App
									interval={1}
									isAuth={isAuth}
									user={loggedUser}
									onLogout={handleLogout}
								/>
							),
						},
						{
							path: "weekly",
							element: (
								<App
									interval={7}
									isAuth={isAuth}
									user={loggedUser}
									onLogout={handleLogout}
								/>
							),
						},
						{
							path: "done",
							element: (
								<App
									done={true}
									interval={-1}
									isAuth={isAuth}
									user={loggedUser}
									onLogout={handleLogout}
								/>
							),
						},
				  ]
				: [
						{
							path: "",
							element: (
								<Navigate replace to={isAuth ? "/board" : "/user/login"} />
							),
						},
				  ],
		},
		{
			path: "/user",
			children: [
				{ path: "", element: <Auth /> },
				{
					path: "login",
					element: (
						<Auth
							isLogin
							onLogin={handleLogin}
							onGoogleLogin={handleGoogleLogin}
						/>
					),
				},
				{ path: "signup", element: <Auth onSignup={handleSignup} /> },
			],
		},
		{
			path: "/",
			element: <Navigate replace to={isAuth ? "/board" : "/user/login"} />,
		},
		{
			path: "*",
			element: (
				<div>
					<p className="p-3 text-info text-center text-opacity-50">
						Keep on searching...
					</p>
					<img
						alt="404"
						style={{
							width: "100%",
							height: "92vh",
							objectFit: "cover",
						}}
						src="https://www.mediaclick.com.tr/uploads/2019/11/http-error-404.png"
					></img>
				</div>
			),
		},
	]);
};
