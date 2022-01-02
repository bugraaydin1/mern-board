import { useEffect } from "react";
import { User } from "../types/types";
import { Button, Popover, PopoverBody, PopoverHeader } from "reactstrap";
import { LogOut, Settings } from "react-feather";

interface UserPopoverProps {
	isOpen: boolean;
	user?: User.LoggedUser;
	onClose: () => void;
	onLogout?: () => void;
}

export default function UserPopover({
	user,
	isOpen,
	onLogout,
	onClose,
}: UserPopoverProps) {
	useEffect(() => {
		const clickOutside = (evt: MouseEvent) => {
			//@ts-ignore
			const targetEl = evt.path;
			const targetClassNames = targetEl.map((el: Element) =>
				typeof el.className === "string" ? el.className : ""
			);

			if (
				!targetClassNames.some((name: string) => name.includes("popover")) &&
				!targetClassNames.some((name: string) => name.includes("btn nav-link"))
			) {
				onClose();
			}
		};
		document.addEventListener("click", clickOutside, { capture: true });

		return () => {
			document.removeEventListener("click", clickOutside);
		};
	}, [isOpen]);

	return (
		<Popover
			isOpen={isOpen}
			id="user-popover-card"
			target="user-popover"
			placement="bottom"
			className="text-secondary"
		>
			<PopoverHeader>{user?.email}</PopoverHeader>
			<PopoverBody className="d-flex flex-column p-2">
				<Button className="mx-1 mb-1" size="sm" color="secondary" outline>
					<Settings size={15} /> Settings
				</Button>
				<Button
					outline
					size="sm"
					className="mx-1"
					color="secondary"
					onClick={onLogout}
				>
					<LogOut size={15} /> Logout
				</Button>
			</PopoverBody>
		</Popover>
	);
}
