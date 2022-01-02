import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Nav, Navbar, NavbarToggler, NavItem, Collapse } from "reactstrap";
import { Calendar, CheckSquare, Layout, Lock, User } from "react-feather";
import { User as UserInterface } from "../types/types";
import UserPopover from "./UserPopover";

interface NavBarProps {
	user?: UserInterface.LoggedUser;
	isAuth?: boolean;
	onLogout?: () => void;
}

export default function NavBar({ isAuth, user, onLogout }: NavBarProps) {
	const [collapse, setCollapse] = useState(true);
	const [tooltip, setTooltip] = useState(false);

	return (
		<Navbar dark expand="md" color="primary" className="position-sticky">
			<NavLink
				to="/board"
				className={({ isActive }: any) =>
					isActive ? "navbar-brand active" : "navbar-brand"
				}
			>
				<img
					width="32"
					height="32"
					src="/mern-board.png"
					alt="mern-board-logo"
				/>
				<span className="m-3">MERN Board</span>
			</NavLink>
			<NavbarToggler
				onClick={() => {
					setCollapse(!collapse);
				}}
			/>
			<Collapse isOpen={!collapse} navbar>
				<Nav className="me-auto" navbar>
					{isAuth && (
						<>
							<NavItem>
								<NavLink
									to="/board/today"
									className={({ isActive }: { isActive: boolean }) =>
										isActive ? "nav-link active" : "nav-link"
									}
								>
									<Calendar size={15} /> Today
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink
									to="/board/weekly"
									className={({ isActive }: { isActive: boolean }) =>
										isActive ? "nav-link active" : "nav-link"
									}
								>
									<Layout size={15} /> Weekly
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink
									to="/board/done"
									className={({ isActive }: { isActive: boolean }) =>
										isActive ? "nav-link active" : "nav-link"
									}
								>
									<CheckSquare size={15} /> Done
								</NavLink>
							</NavItem>
						</>
					)}
				</Nav>

				<Nav navbar>
					<NavItem>
						{isAuth ? (
							<>
								<div
									id="user-popover"
									className="btn nav-link p-0"
									onClick={() => setTooltip(true)}
								>
									{!user?.picture ? (
										<User className="m-1" size={15} />
									) : (
										<img
											className="img-fluid  rounded-1 m-1 p-0"
											width="24"
											height="24"
											src={user?.picture}
											alt={user?.name}
										/>
									)}
									{user?.name || user?.email}
								</div>
								<UserPopover
									isOpen={tooltip}
									user={user}
									onLogout={onLogout}
									onClose={() => setTooltip(false)}
								/>
							</>
						) : (
							<NavLink
								to="/user/login"
								className={({ isActive }: { isActive: boolean }) =>
									isActive ? "nav-link active" : "nav-link"
								}
							>
								<Lock className="m-1" size={15} />
								Login
							</NavLink>
						)}
					</NavItem>
				</Nav>
			</Collapse>
		</Navbar>
	);
}
