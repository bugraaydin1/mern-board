export namespace Board {
	interface IBoard {
		_id: string;
		columns: [IColumn?];
	}

	interface IColumn {
		_id: string;
		id: number;
		title: string;
		cards: [ICard];
	}

	interface ICard {
		_id: string;
		id: number;
		title: string;
		column?: string;
		description: string;
		date?: string;
		priority?: number;
	}

	interface ICardEdit {
		cardId: string;
		title: string;
		description?: string;
		date?: string;
		priority?: number;
	}
}

export namespace User {
	interface LoggedUser {
		token?: string;
		name?: string;
		email?: string;
		userId?: string;
		picture?: string;
	}

	interface IFormError {
		email: boolean;
		name?: boolean;
		password: boolean;
		confirmPassword?: boolean;
	}

	interface ISignup {
		name: string;
		email: string;
		password: string;
	}

	interface ILogin {
		email: string;
		password: string;
	}
}
