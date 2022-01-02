import { MouseEvent, ReactElement, useRef, useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
	ADD_CARD,
	ADD_COLUMN,
	DRAG_CARD,
	DRAG_COLUMN,
	EDIT_CARD,
	GET_BOARD,
	MARK_CARD_AS_DONE,
	REMOVE_CARD,
	REMOVE_COLUMN,
	RENAME_COLUMN,
} from "../graphql/query";
import { User } from "../types/types";
import CardModal from "./CardModal";

// @ts-ignore
import Board, { moveColumn, moveCard } from "@asseinfo/react-kanban";
import ContentLoader from "react-content-loader";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardText,
	CardTitle,
	Col,
	Input,
	InputGroup,
	Row,
} from "reactstrap";
import { toast } from "react-toastify";
import {
	Calendar,
	CheckCircle,
	Circle,
	Flag,
	PlusCircle,
	XCircle,
} from "react-feather";

interface IBoardProps {
	user: User.LoggedUser;
	isAuth: boolean;
	interval: number;
	onLogout: () => void;
	done?: boolean;
}

export default function MainBoard({
	isAuth,
	user,
	interval,
	onLogout,
	done = false,
}: IBoardProps) {
	const [board, setBoard] = useState<Board.IBoard>({ _id: "", columns: [] });
	const [editColumn, setEditColumn] = useState<{ [key: number]: boolean }>({});
	const [cardEditing, setCardEditing] = useState<Board.Board.ICard>({
		_id: "",
		id: -1,
		title: "",
		description: "",
	});
	const [isCardModalOpen, setIsCardModalOpen] = useState(false);
	const [hoverCard, setHoverCard] = useState("");

	const {
		loading: boardLoading,
		error,
		data: boardData,
		refetch: refetchBoard,
	} = useQuery(GET_BOARD, { skip: !isAuth, variables: { interval, done } });

	const defaultMutationOptions = {
		refetchQueries: [
			{
				query: GET_BOARD,
				variables: { interval, done },
				awaitRefetchQueries: true,
			},
		],
	};

	const [createColumn /* { data, loading } */] = useMutation(
		ADD_COLUMN,
		defaultMutationOptions
	);
	const [renameColumn] = useMutation(RENAME_COLUMN, defaultMutationOptions);
	const [dragColumn] = useMutation(DRAG_COLUMN, defaultMutationOptions);
	const [removeColumn] = useMutation(REMOVE_COLUMN, defaultMutationOptions);

	const [createCard] = useMutation(ADD_CARD, defaultMutationOptions);
	const [editCard] = useMutation(EDIT_CARD, defaultMutationOptions);
	const [dragCard] = useMutation(DRAG_CARD, defaultMutationOptions);
	const [removeCard] = useMutation(REMOVE_CARD, defaultMutationOptions);
	const [markCardAsDone] = useMutation(
		MARK_CARD_AS_DONE,
		defaultMutationOptions
	);

	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (interval) {
			refetchBoard({ interval, done });
		}
		// eslint-disable-next-line
	}, [interval, done]);

	useEffect(() => {
		if (boardData) {
			setBoard(boardData.getBoard);
		}
		if (error) {
			toast.error("Board could not be fetched.");
		}
	}, [boardData, error]);

	const NewColumnComponents = (): ReactElement => {
		return (
			<>
				{Array(board.columns.length + 1)
					.fill("")
					.map((e, i) => (
						<span
							key={i}
							onClick={() => handleColumnAdd(i)}
							style={{ left: i * 306 + 5 }}
							className="react-kanban-column-adder clickable"
						>
							<div className="text-vertical-lr">
								<PlusCircle size={15} /> New column
							</div>
						</span>
					))}
			</>
		);
	};

	const ColumnHeaderComponent = (column: Board.IColumn): ReactElement => {
		const { id, title } = column;

		const handleEditColumn = () => {
			setEditColumn({
				...editColumn,
				[column.id]: !!!editColumn[column.id],
			});
		};

		return (
			<div className="react-kanban-column-header mb-1 d-flex justify-content-between align-items-center">
				<div onClick={() => !editColumn[column.id] && handleEditColumn()}>
					{editColumn[id] ? (
						<InputGroup className="react-kanban-column-title">
							<Input
								size={26}
								className="rounded-pill"
								innerRef={inputRef}
								defaultValue={title}
								placeholder={title}
								onKeyPress={(evt) => {
									if (evt.key === "Enter") {
										handleEditColumn();
										handleColumnRename(inputRef?.current?.value || "", column);
									}
								}}
							/>

							<div
								className="position-absolute align-self-center"
								style={{ zIndex: 10, cursor: "pointer", right: 11 }}
							>
								<XCircle
									size={24}
									color="gray"
									className="btn-link"
									onClick={handleEditColumn}
								/>
								<CheckCircle
									size={23}
									className="btn-link m-1"
									onClick={() => {
										handleEditColumn();
										handleColumnRename(inputRef?.current?.value || "", column);
									}}
								/>
							</div>
						</InputGroup>
					) : (
						<span className="react-kanban-column-title">{title}</span>
					)}
				</div>
				{!editColumn[id] && (
					<>
						<Button
							className="btn-sm rounded-pill m-2"
							onClick={() => handleCardAdd(column)}
						>
							<PlusCircle size={15} /> Task
						</Button>
						<div
							className="btn align-align-self-end"
							onClick={() => {
								window.confirm(`Delete "${title}" column ?`) &&
									handleColumnRemove(column);
							}}
						>
							<XCircle size={15} />
						</div>
					</>
				)}
			</div>
		);
	};

	const CardComponent = (card: Board.ICard) => {
		const handleCardRemove = (evt: MouseEvent) => {
			evt.stopPropagation();
			if (window.confirm(`Delete "${card.title}" card ?`)) {
				removeCard({ variables: { cardId: card._id } });
			}
		};

		const handleMarkCardAsDone = (evt: MouseEvent) => {
			evt.stopPropagation();
			if (window.confirm(`Mark "${card.title}" as done?`)) {
				markCardAsDone({ variables: { cardId: card._id } });
			}
		};

		const getDateAndTime = (date: string) => {
			const dateAndTime = new Date(date);
			const hours = dateAndTime.getHours();
			const minutes = dateAndTime.getMinutes();
			return `${dateAndTime.toLocaleDateString()} - 
			${hours > 9 ? hours : "0" + hours}:${minutes > 9 ? minutes : "0" + minutes}`;
		};
		const priorityColor = [
			"#A9A9A9", //darkgray
			"#FF0000", // red
			"#FFA500", // orange
			"#0000FF", //blue
			"#808080", //gray
		];

		return (
			<Card
				outline
				style={{
					borderColor: `${
						card.priority > 0
							? priorityColor[card.priority] + "cc"
							: priorityColor[0]
					}`,
					boxShadow: `0 0 3px 5px  ${priorityColor[card.priority || 0]}08`,
				}}
				className="react-kanban-card"
				onMouseEnter={() => setCardEditing(card)}
				onClick={() => setIsCardModalOpen(true)}
			>
				<div
					onClick={handleCardRemove}
					className="btn position-absolute end-0 py-0 px-2"
				>
					<XCircle size={15} />
				</div>

				<div
					onClick={handleMarkCardAsDone}
					className="btn position-absolute top-0 p-0"
					onMouseEnter={() => setHoverCard(card._id)}
					onMouseLeave={() => setHoverCard("")}
				>
					{done || hoverCard === card._id ? (
						<CheckCircle color="dimgray" size={18} />
					) : (
						<Circle color="lightgray" size={18} />
					)}
				</div>

				<CardBody className="pb-1">
					<CardTitle>{card.title}</CardTitle>
					<CardText className="mb-2 text-muted">{card.description}</CardText>
				</CardBody>
				{(card.date || card.priority) && (
					<CardFooter className="d-inline-flex justify-content-between bg-transparent pt-2 pb-0">
						{card.date && (
							<div className="d-inline-flex align-items-center">
								<Calendar size={17} color="gray" className="m-1" />
								{getDateAndTime(card.date)}
							</div>
						)}
						{card.priority && (
							<Flag
								size={17}
								className="mt-1"
								color={priorityColor[card.priority || 0]}
							/>
						)}
					</CardFooter>
				)}
			</Card>
		);
	};

	const handleColumnAdd = (to: number) => {
		createColumn({ variables: { to } }).then(
			() => {},
			(reason) => {
				toast.error(reason.message);
			}
		);
	};

	const handleColumnRename = (title: string, column: Board.IColumn) => {
		renameColumn({ variables: { title, colId: column._id } });
	};

	const handleColumnDrag = (
		column: Board.IColumn,
		fromObj: { fromPosition: number },
		toObj: { toPosition: number }
	) => {
		setBoard(moveColumn(board, fromObj, toObj));

		dragColumn({
			variables: {
				colId: column._id,
				from: fromObj.fromPosition,
				to: toObj.toPosition,
			},
		});
	};

	const handleColumnRemove = (column: Board.IColumn) => {
		removeColumn({ variables: { colId: column._id } });
	};

	const handleCardAdd = (column: Board.IColumn) => {
		const variables = { colId: column._id } as { colId: string; date?: string };

		if ([1, 7].includes(interval)) {
			variables.date = new Date().toISOString();
		}

		createCard({ variables });
	};

	const handleCardDrag = (
		card: Board.ICard,
		source: { fromColumnId: number; fromPosition: number },
		destination: { toColumnId: number; toPosition: number }
	) => {
		setBoard(moveCard(board, source, destination));

		const sourceColId = board.columns.find(
			(col: Board.IColumn) => col?.id === source.fromColumnId
		)?._id;
		const destColId = board.columns.find(
			(col: Board.IColumn) => col?.id === destination.toColumnId
		)?._id;

		dragCard({
			variables: {
				source: { cardPos: source.fromPosition, colId: sourceColId },
				destination: { cardPos: destination.toPosition, colId: destColId },
			},
		});
	};

	const handleCardEditDone = ({
		cardId,
		title,
		description,
		date,
		priority,
	}: Board.ICardEdit) => {
		setIsCardModalOpen(false);
		editCard({
			variables: { cardEdit: { cardId, title, description, date, priority } },
		});
	};
	const handleCardEditCancel = () => {
		setIsCardModalOpen(false);
	};

	return (
		<>
			{!boardLoading ? (
				<div className="react-kanban-board-wrapper">
					{board.columns.length === 0 && (
						<Button
							size="sm"
							color="primary"
							className="m-4"
							onClick={() => handleColumnAdd(1)}
						>
							<PlusCircle /> Add Your First Column
						</Button>
					)}
					<Board
						id="kanban-board"
						allowAddColumn
						allowRemoveColumn
						renderCard={(card: Board.ICard) => <CardComponent {...card} />}
						renderColumnAdder={() => <NewColumnComponents />}
						renderColumnHeader={(column: Board.IColumn) => (
							<ColumnHeaderComponent {...column} />
						)}
						onColumnNew={handleColumnAdd}
						onColumnDragEnd={handleColumnDrag}
						onCardDragEnd={handleCardDrag}
					>
						{board}
					</Board>
					<CardModal
						isOpen={isCardModalOpen}
						cardEditing={cardEditing}
						onDone={handleCardEditDone}
						onCancel={handleCardEditCancel}
					/>
				</div>
			) : (
				<Row>
					{board.columns.map((col: Board.IColumn, i: number) => (
						<Col key={i}>
							<Loader index={i} />
						</Col>
					))}
				</Row>
			)}
		</>
	);
}

const getBoxSize = () => {
	const width = window.screen.width / 4;
	const height = window.screen.height;
	return { height, width, viewBox: `0 0 ${width * 0.9} ${height}` };
};

interface LoaderProps {
	index: number;
}
type LoaderType = (props: LoaderProps) => JSX.Element;

const Loader: LoaderType = ({ index }) => (
	<ContentLoader title="Loading..." viewBox={getBoxSize().viewBox}>
		<rect
			x={20}
			y="30"
			rx="24"
			ry="24"
			width={getBoxSize().width - 70}
			height={getBoxSize().height - 30}
		/>
	</ContentLoader>
);
