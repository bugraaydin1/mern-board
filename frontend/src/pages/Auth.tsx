import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { User } from "../types/types";
import { isEmail } from "../utils/validator";
import NavBar from "./../components/NavBar";
import {
	Button,
	Card,
	CardBody,
	CardTitle,
	Form,
	FormFeedback,
	FormGroup,
	FormText,
	Input,
	Label,
} from "reactstrap";
import jwt from "jwt-decode";

interface AuthProps {
	isLogin?: boolean;
	onLogin?: (login: User.ILogin) => void;
	onGoogleLogin?: (token: string) => void;
	onSignup?: (signup: User.ISignup) => void;
	onLogout?: () => void;
}

export default function Auth({
	isLogin,
	onGoogleLogin,
	onSignup,
	onLogin,
	onLogout,
}: AuthProps) {
	let [searchParams] = useSearchParams("token");
	const googleLoginRef = useRef<HTMLFormElement | null>(null);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState<User.IFormError>({
		name: false,
		email: false,
		password: false,
		confirmPassword: false,
	});

	const token = searchParams.get("token");
	useEffect(() => {
		try {
			if (token && jwt<User.LoggedUser>(token).userId) {
				onGoogleLogin && onGoogleLogin(token);
			}
		} catch (err) {}
	}, [token]);

	const submitForm = () => {
		let errors: User.IFormError = {
			email: email.length < 4 || !isEmail(email),
			password: password.length < 7,
		};

		if (!isLogin) {
			errors.name = !name || name.length > 32;
			errors.confirmPassword = !confirmPassword || password !== confirmPassword;
		}

		setErrors(errors);

		if (Object.values(errors).every((val) => !val)) {
			if (isLogin) {
				onLogin && onLogin({ email, password });
			} else {
				onSignup && onSignup({ name, email, password });
			}
		}
	};

	return (
		<div id="auth">
			<NavBar />

			<div id="login" className="d-flex justify-content-center mt-5">
				<Card
					style={{ minWidth: 400 }}
					className="align-items-center w-25 my-3 p-3"
				>
					<CardBody className="w-75">
						<CardTitle
							className="react-kanban-card__title mt-3 mb-5 pb-2"
							tag="h5"
						>
							{isLogin ? "Login" : "Signup"}
						</CardTitle>

						<Form ref={() => googleLoginRef} action={"auth/google"}>
							<Button
								type="submit"
								color="primary"
								className="google-button w-100 mb-4"
							>
								<span className="google-button-icon">
									<svg viewBox="0 0 366 372">
										<path
											d="M125.9 10.2c40.2-13.9 85.3-13.6 125.3 1.1 22.2 8.2 42.5 21 59.9 37.1-5.8 6.3-12.1 12.2-18.1 18.3l-34.2 34.2c-11.3-10.8-25.1-19-40.1-23.6-17.6-5.3-36.6-6.1-54.6-2.2-21 4.5-40.5 15.5-55.6 30.9-12.2 12.3-21.4 27.5-27 43.9-20.3-15.8-40.6-31.5-61-47.3 21.5-43 60.1-76.9 105.4-92.4z"
											fill="#EA4335"
										/>
										<path
											d="M20.6 102.4c20.3 15.8 40.6 31.5 61 47.3-8 23.3-8 49.2 0 72.4-20.3 15.8-40.6 31.6-60.9 47.3C1.9 232.7-3.8 189.6 4.4 149.2c3.3-16.2 8.7-32 16.2-46.8z"
											fill="#FBBC05"
										/>
										<path
											d="M361.7 151.1c5.8 32.7 4.5 66.8-4.7 98.8-8.5 29.3-24.6 56.5-47.1 77.2l-59.1-45.9c19.5-13.1 33.3-34.3 37.2-57.5H186.6c.1-24.2.1-48.4.1-72.6h175z"
											fill="#4285F4"
										/>
										<path
											d="M81.4 222.2c7.8 22.9 22.8 43.2 42.6 57.1 12.4 8.7 26.6 14.9 41.4 17.9 14.6 3 29.7 2.6 44.4.1 14.6-2.6 28.7-7.9 41-16.2l59.1 45.9c-21.3 19.7-48 33.1-76.2 39.6-31.2 7.1-64.2 7.3-95.2-1-24.6-6.5-47.7-18.2-67.6-34.1-20.9-16.6-38.3-38-50.4-62 20.3-15.7 40.6-31.5 60.9-47.3z"
											fill="#34A853"
										/>
									</svg>
								</span>
								<span className="google-button-text">Login with Google</span>
							</Button>
						</Form>

						<hr className="m-3" />

						<Form className="mt-4">
							{!isLogin && (
								<FormGroup>
									<Label for="name">Name</Label>
									<Input
										id="name"
										name="name"
										type="text"
										value={name}
										invalid={errors.name}
										onChange={(evt) => setName(evt.target.value)}
										placeholder="Name"
									/>
									<FormFeedback valid={!errors.name}>
										{errors.name && "Enter your name"}
									</FormFeedback>
								</FormGroup>
							)}
							<FormGroup>
								<Label for="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									value={email}
									invalid={errors.email}
									onChange={(evt) => setEmail(evt.target.value)}
									placeholder="Email"
								/>
								<FormFeedback valid={!errors.email}>
									{errors.email && "Enter a valid email"}
								</FormFeedback>
							</FormGroup>
							<FormGroup>
								<Label for="password">Password</Label>
								<Input
									id="password"
									name="password"
									type="password"
									value={password}
									autoComplete="current-password"
									invalid={errors.password}
									onChange={(evt) => setPassword(evt.target.value)}
									placeholder="••••••••••••"
								/>
								<FormFeedback valid={!errors.password}>
									{errors.password && "Enter password"}
								</FormFeedback>
							</FormGroup>
							{!isLogin && (
								<FormGroup>
									<Label for="confirmPassword">Confirm Password</Label>
									<Input
										id="confirmPassword"
										name="confirmPassword"
										type="password"
										value={confirmPassword}
										invalid={errors.confirmPassword}
										onChange={(evt) => setConfirmPassword(evt.target.value)}
										placeholder="••••••••••••"
									/>
									<FormFeedback valid={!errors.confirmPassword}>
										{!errors.password &&
											errors.confirmPassword &&
											"Password should match"}
									</FormFeedback>
									<FormText>Password should be min. 8 characters</FormText>
								</FormGroup>
							)}

							<Button
								color="primary"
								className="my-2 w-100"
								onClick={() => submitForm()}
							>
								{isLogin ? "Login" : "Signup"}
							</Button>

							<FormGroup className="my-3">
								<Link
									to="/user/forgot-password"
									className="text-secondary small m-2"
								>
									Forgot password?
								</Link>
							</FormGroup>

							<hr className="m-3" />

							<FormGroup className="text-center my-3">
								{isLogin ? (
									<>
										<span className="small">Don't have account?</span>
										<Link to="/user/signup" className="text-primary small m-2">
											Signup
										</Link>
									</>
								) : (
									<>
										<span className="small">Have account?</span>
										<Link to="/user/login" className="text-primary small m-2">
											Login
										</Link>
									</>
								)}
							</FormGroup>
						</Form>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
