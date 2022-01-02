import { useEffect, useState } from "react";
import {
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	FormGroup,
	Button,
	Input,
	Label,
	Form,
	Row,
	Col,
} from "reactstrap";
import { Calendar, Flag } from "react-feather";
import Flatpickr from "react-flatpickr";
import { Board as BoardInterface } from "../types/types";

interface CardModalProps {
	isOpen: boolean;
	cardEditing: BoardInterface.ICard;
	onDone: (args: BoardInterface.ICardEdit) => void;
	onCancel: () => void;
}

export default function CardModal({
	isOpen,
	cardEditing,
	onDone,
	onCancel,
}: CardModalProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [isDateSelected, setIsDateSelected] = useState(false);
	const [date, setDate] = useState(new Date());
	const [isPrioritySelected, setIsPrioritySelected] = useState(false);
	const [priority, setPriority] = useState(4);

	useEffect(() => {
		setDate(new Date(cardEditing.date || ""));
		setIsDateSelected(!!cardEditing.date);
		setPriority(cardEditing.priority || 4);
		setIsPrioritySelected(!!cardEditing.priority);
		setTitle(cardEditing.title);
		setDescription(cardEditing.description);
	}, [cardEditing]);

	const handleDone = () => {
		if (title && (isDateSelected ? date : true)) {
			onDone({
				cardId: cardEditing._id,
				title,
				description,
				priority,
				date: isDateSelected ? date.toISOString() : "",
			});
		}
	};

	const getMinDate = () => {
		const date = new Date();
		date.setHours(date.getHours() - 1);
		return date;
	};

	const priorityColor = [
		"secondary",
		"danger",
		"warning",
		"primary",
		"secondary",
	];

	return (
		<Modal isOpen={isOpen} style={{ top: "10%" }}>
			<Form onSubmit={(evt) => evt.preventDefault()}>
				<ModalHeader>Edit Card</ModalHeader>
				<ModalBody>
					<FormGroup>
						<Label for="title">Title</Label>
						<Input
							required
							id="title"
							type="text"
							value={title}
							placeholder={cardEditing.title}
							onChange={(evt) => setTitle(evt.target.value)}
						/>
					</FormGroup>
					<FormGroup>
						<Label for="description">Description</Label>
						<Input
							id="description"
							type="textarea"
							value={description}
							placeholder={cardEditing.description}
							onChange={(evt) => setDescription(evt.target.value)}
						/>
					</FormGroup>

					<div className="d-flex justify-content-between">
						<div
							id="date-time-picker"
							style={{ outlineColor: "gray !important" }}
						>
							<Button
								className="btn-sm rounded-pill m-2"
								onClick={() => setIsDateSelected((prev) => !prev)}
								color={isDateSelected ? "primary" : "secondary"}
							>
								<Calendar size={17} color="white" className="btn-link m-1" />
							</Button>
							{isDateSelected && (
								<Flatpickr
									className=""
									value={date}
									onChange={([date]) => setDate(date)}
									options={{
										inline: true,
										time_24hr: true,
										enableTime: true,
										minuteIncrement: 15,
										minDate: getMinDate(),
										dateFormat: "d-m-Y / H:i",
									}}
								/>
							)}
						</div>

						<Row id="priority-picker">
							<Col>
								{isPrioritySelected && (
									<Input
										name="priority"
										type="select"
										className="mt-2"
										value={priority}
										onChange={(evt) => setPriority(parseInt(evt.target.value))}
										style={{ height: 33, width: 60 }}
									>
										<option>1</option>
										<option>2</option>
										<option>3</option>
										<option>4</option>
									</Input>
								)}
							</Col>
							<Col>
								<Button
									className="btn-sm rounded-pill m-2"
									onClick={() => {
										isPrioritySelected && setPriority(4);
										setIsPrioritySelected((prev) => !prev);
									}}
									color={priorityColor[priority]}
								>
									<Flag size={17} color="white" className="btn-link m-1" />
								</Button>
							</Col>
						</Row>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button
						disabled={!title}
						onClick={handleDone}
						type="submit"
						color="primary"
					>
						Done
					</Button>
					<Button onClick={() => onCancel()}>Cancel</Button>
				</ModalFooter>
			</Form>
		</Modal>
	);
}
