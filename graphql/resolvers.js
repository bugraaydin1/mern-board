const {
	ApolloError,
	AuthenticationError,
	ValidationError,
} = require("apollo-server-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const validator = require("validator").default;
const Board = require("../models/Board");
const Column = require("../models/Column");
const Card = require("../models/Card");

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const resolvers = {
	Query: {
		getBoard: async (
			parent,
			{ interval = -1, done = false },
			{ isAuth, userId }
		) => {
			if (!isAuth) throw new AuthenticationError("You must be logged in");

			try {
				let board = await Board.findOne({ author: userId }).populate("columns");

				if (!board) {
					throw new AuthenticationError("No board found");
				}

				if (interval === -1) {
					board = await board.populate({
						path: "columns.cards",
						match: { done: done },
					});
				} else {
					const now = new Date();
					const startOfToday = new Date(
						now.getFullYear(),
						now.getMonth(),
						now.getDate()
					);

					const limitDate = new Date(
						Date.now() + (interval + 1) * 24 * 60 * 60 * 1000
					);
					const limitDateEnd = new Date(
						limitDate.getFullYear(),
						limitDate.getMonth(),
						limitDate.getDate()
					);

					board = await board.populate({
						path: "columns.cards",
						match: {
							date: { $gte: startOfToday, $lt: limitDateEnd },
							done: done,
							// cards: { $ne: [] },
						},
					});
				}

				return board;
			} catch (error) {
				throw new ApolloError(error);
			}
		},
	},

	Mutation: {
		signup: async (parent, { signup }) => {
			try {
				const { email, password, name } = signup;

				if (
					!validator.isEmail(email) ||
					validator.isEmpty(password) ||
					!validator.isLength(password, { min: 8, max: 32 })
				) {
					throw new ValidationError("Email or password is not valid.");
				}
				if (validator.isEmpty(name)) {
					throw new ValidationError("Name cannot be empty.");
				}

				let user = await User.findOne({ email });

				if (user) {
					throw new AuthenticationError("This email is in use.");
				}

				const hashedPassword = await bcrypt.hash(password, 12);

				user = new User({
					name,
					email,
					password: hashedPassword,
				});

				const board = new Board({ author: user._id });

				user.board = board._id;

				await board.save();
				user = await user.save();

				return user;
			} catch (error) {
				throw new ApolloError(error);
			}
		},

		login: async (parent, { login }, context) => {
			try {
				const { email, password } = login;

				if (
					!validator.isEmail(email) ||
					validator.isEmpty(password) ||
					!validator.isLength(password, { min: 8, max: 32 })
				) {
					throw new ValidationError("Email or password is incorrect.");
				}

				let user = await User.findOne({ email });
				if (!user) {
					throw new ValidationError("This email is not registered.");
				}

				const isMatch = await bcrypt.compare(password, user.password);
				if (!isMatch) {
					throw new ValidationError("Email or password is incorrect.");
				}

				const token = jwt.sign(
					{
						userId: user._id,
						name: user.name,
						email: user.email,
					},
					jwtSecretKey,
					{ expiresIn: "6h" }
				);

				return { user, token };
			} catch (error) {
				throw new ApolloError(error);
			}
		},

		createColumn: async (parent, { to }, { isAuth, userId }) => {
			if (!isAuth) throw new AuthenticationError("You must be logged in");

			try {
				const board = await Board.findOne({ author: userId });
				if (!board) {
					throw new AuthenticationError("No board found");
				}

				// current board columns' max id
				const { id: maxColId } =
					board.columns.length > 0
						? await Column.findOne({
								board: board._id,
						  }).sort({ id: -1 })
						: { id: 0 };
				const newColumn = new Column({ id: maxColId + 1, board: board._id });

				const column = await newColumn.save();

				if (to !== undefined) {
					board.columns.splice(to, 0, column);
				} else {
					board.columns.push(column);
				}
				await board.save();

				return column;
			} catch (error) {
				throw new ApolloError(error);
			}
		},

		renameColumn: async (parent, { title, colId }, { isAuth, userId }) => {
			if (!isAuth) throw new AuthenticationError("You must be logged in");

			try {
				const board = await Board.findOne({ author: userId });
				if (!board) {
					throw new AuthenticationError("No board found");
				}

				const column = await Column.findByIdAndUpdate(colId, { title });
				return await column.save();
			} catch (error) {
				throw new ApolloError(error);
			}
		},

		dragColumn: async (parent, { colId, from, to }, { isAuth, userId }) => {
			if (!isAuth) throw new AuthenticationError("You must be logged in");

			try {
				const board = await Board.findOne({ author: userId });
				if (!board) {
					throw new AuthenticationError("No board found");
				}

				const [draggedColumn] = board.columns.splice(from, 1);
				board.columns.splice(to, 0, draggedColumn);
				await board.save();

				return true;
			} catch (error) {
				throw new ApolloError(error);
			}
		},

		removeColumn: async (parent, args, { isAuth, userId }, info) => {
			if (!isAuth) throw new AuthenticationError("You must be logged in");

			const { colId } = args;
			try {
				const board = await Board.findOne({ author: userId });
				if (!board) {
					throw new AuthenticationError("No board found");
				}

				const removedCol = await Column.findById(colId);
				removedCol.cards.pull();
				await Column.findOneAndRemove({ _id: colId });

				board.columns.pull(colId);
				await board.save();

				return true;
			} catch (error) {
				throw new ApolloError(error);
			}
		},

		createCard: async (parent, { colId, date }, { isAuth, userId }) => {
			if (!isAuth) throw new AuthenticationError("You must be logged in");

			try {
				const board = await Board.findOne({ author: userId });
				if (!board) {
					throw new AuthenticationError("No board found");
				}

				// current board's cards max id
				const maxIdCard = await Card.findOne({
					board: board._id,
				}).sort({ id: -1 });

				const maxCardId = maxIdCard?.id || 0;

				let newCard = new Card({
					id: maxCardId + 1,
					column: colId,
					board: board._id,
				});

				if (date) {
					newCard.date = date;
				}

				newCard = await newCard.save();

				const column = await Column.findById(colId);
				column.cards.push(newCard);
				await column.save();

				return newCard;
			} catch (error) {
				throw new ApolloError(error);
			}
		},

		editCard: async (parent, { cardEdit }, { isAuth, userId }) => {
			if (!isAuth) throw new AuthenticationError("You must be logged in");

			const { cardId, title, description, date, priority } = cardEdit;
			try {
				if (title.length < 1) {
					throw new ValidationError("Title cannot be empty");
				}

				const board = await Board.findOne({ author: userId });
				if (!board) {
					throw new AuthenticationError("No board found");
				}

				const updatedCard = await Card.findByIdAndUpdate(
					cardId,
					{
						title,
						description,
						priority,
						date,
					},
					{ new: true }
				);

				return updatedCard;
			} catch (error) {
				throw new ApolloError(error);
			}
		},

		dragCard: async (parent, { source, destination }, { isAuth, userId }) => {
			if (!isAuth) throw new AuthenticationError("You must be logged in");

			try {
				const board = await Board.findOne({ author: userId });
				if (!board) {
					throw new AuthenticationError("No board found");
				}

				let fromColumn, toColumn, draggedCard;
				if (source.colId === destination.colId) {
					fromColumn = await Column.findById(source.colId);

					[draggedCard] = fromColumn.cards.splice(source.cardPos, 1);
					fromColumn.cards.splice(destination.cardPos, 0, draggedCard);
					await fromColumn.save();
					return true;
				}

				fromColumn = await Column.findById(source.colId);
				[draggedCard] = fromColumn.cards.splice(source.cardPos, 1);
				await fromColumn.save();

				toColumn = await Column.findById(destination.colId);
				toColumn.cards.splice(destination.cardPos, 0, draggedCard);
				await toColumn.save();
				return true;
			} catch (error) {
				throw new ApolloError(error);
			}
		},

		removeCard: async (parent, { cardId }, { isAuth, userId }) => {
			if (!isAuth) throw new AuthenticationError("You must be logged in");

			try {
				const board = await Board.findOne({ author: userId });
				if (!board) {
					throw new AuthenticationError("No board found");
				}

				const removedCard = await Card.findByIdAndDelete(cardId);
				const cardColumn = await Column.findOne(removedCard.column);
				cardColumn.cards.pull(removedCard._id);
				await cardColumn.save();

				return true;
			} catch (error) {
				throw new ApolloError(error);
			}
		},

		markCardAsDone: async (parent, { cardId }, { isAuth, userId }) => {
			if (!isAuth) throw new AuthenticationError("You must be logged in");

			try {
				const board = await Board.findOne({ author: userId });
				if (!board) {
					throw new AuthenticationError("No board found");
				}

				await Card.findByIdAndUpdate(cardId, { done: true });

				return true;
			} catch (error) {
				throw new ApolloError(error);
			}
		},
	},
};

module.exports = resolvers;
