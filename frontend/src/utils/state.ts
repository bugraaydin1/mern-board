import { atom } from "recoil";
import { User } from "../types/types";

export const LoggedUser = atom({
	key: "LoggedUser",
	default: {} as User.LoggedUser,
	effects_UNSTABLE: [
		({ onSet, setSelf }) => {
			setSelf({
				token: localStorage.getItem("token") || "",
				userId: localStorage.getItem("userId") || "",
				email: localStorage.getItem("email") || "",
				name: localStorage.getItem("name") || "",
				picture: localStorage.getItem("p_url") || "",
			});
		},
	],
});

export const IsAuth = atom({
	key: "isAuth",
	default: false,
	effects_UNSTABLE: [
		({ setSelf }) => {
			setSelf(!!localStorage.getItem("token") || false);
		},
	],
});
