import { gql } from "@apollo/client";

// Queries
export const GET_BOARD = gql`
	query GetBoard($interval: Int, $done: Boolean) {
		getBoard(interval: $interval, done: $done) {
			_id
			columns {
				_id
				id
				title
				cards {
					_id
					id
					title
					description
					column
					priority
					date
				}
			}
		}
	}
`;

// Mutations
export const USER_SIGNUP = gql`
	mutation Signup($signup: Signup!) {
		signup(signup: $signup) {
			_id
			email
			name
		}
	}
`;

export const USER_LOGIN = gql`
	mutation Login($login: Login!) {
		login(login: $login) {
			user {
				_id
				name
				email
				board
			}
			token
		}
	}
`;

export const ADD_COLUMN = gql`
	mutation AddColumn($to: Int) {
		createColumn(to: $to) {
			id
			title
			cards {
				id
				title
				description
				column
			}
		}
	}
`;

export const RENAME_COLUMN = gql`
	mutation RenameColumn($title: String!, $colId: ID!) {
		renameColumn(title: $title, colId: $colId) {
			id
			title
		}
	}
`;

export const DRAG_COLUMN = gql`
	mutation DragColumn($colId: ID!, $from: Int!, $to: Int!) {
		dragColumn(colId: $colId, from: $from, to: $to)
	}
`;

export const REMOVE_COLUMN = gql`
	mutation DeleteColumn($colId: ID!) {
		removeColumn(colId: $colId)
	}
`;

export const ADD_CARD = gql`
	mutation CreateCard($colId: ID!, $date: Date) {
		createCard(colId: $colId, date: $date) {
			_id
			id
			title
			description
			column
		}
	}
`;

export const EDIT_CARD = gql`
	mutation EditCard($cardEdit: CardEdit!) {
		editCard(cardEdit: $cardEdit) {
			_id
			id
			title
			description
			column
		}
	}
`;

export const DRAG_CARD = gql`
	mutation DragCard($source: CardPosition!, $destination: CardPosition!) {
		dragCard(source: $source, destination: $destination)
	}
`;

export const REMOVE_CARD = gql`
	mutation DeleteCard($cardId: ID!) {
		removeCard(cardId: $cardId)
	}
`;

export const MARK_CARD_AS_DONE = gql`
	mutation MarkCardAsDone($cardId: ID!) {
		markCardAsDone(cardId: $cardId)
	}
`;
