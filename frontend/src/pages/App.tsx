import NavBar from "../components/NavBar";
import Board from "./../components/Board";
import { User } from "../types/types";
import { ToastContainer } from "react-toastify";

interface IAppProps {
	user: User.LoggedUser;
	isAuth: boolean;
	interval: number;
	done?: boolean;
	onLogout: () => void;
}

function App({ interval, user, isAuth, onLogout, done = false }: IAppProps) {
	return (
		<div className="App">
			<NavBar isAuth={isAuth} user={user} onLogout={onLogout} />
			<Board
				done={done}
				isAuth={isAuth}
				user={user}
				interval={interval}
				onLogout={onLogout}
			/>
			<ToastContainer />
		</div>
	);
}

export default App;
