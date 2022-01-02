const { ApolloServer, gql } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { AuthenticationError } = require("apollo-server-errors");
const { GraphQLScalarType, Kind } = require("graphql");
const app = require("./../app");
const resolvers = require("./resolvers");
const jwt = require("jsonwebtoken");

const dateScalar = new GraphQLScalarType({
	name: "Date",
	description: "Date custom scalar type",
	serialize(value) {
		return value.getTime();
	},
	parseValue(value) {
		return new Date(value);
	},
	parseLiteral(ast) {
		if (ast.kind === Kind.INT) {
			return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
		}
		return null; // Invalid hard-coded value (not an integer)
	},
});

const typeDefs = gql`
	#custom scalar
	scalar Date

	# typeDefs
	type User {
		_id: ID!
		email: String!
		password: String
		name: String
		board: ID!
	}

	type LoginUser {
		user: User!
		token: String!
	}

	type Board {
		_id: ID!
		columns: [Column!]
		author: ID!
	}

	type Column {
		_id: ID!
		id: Int!
		title: String!
		cards: [Card!]
		board: ID!
	}

	type Card {
		_id: ID!
		id: Int!
		title: String!
		description: String
		priority: Int
		date: Date
		column: ID!
	}

	input CardEdit {
		cardId: ID!
		title: String!
		description: String
		priority: Int
		date: Date
	}

	input CardPosition {
		cardPos: Int!
		colId: ID!
	}

	input Signup {
		name: String!
		email: String!
		password: String!
	}

	input Login {
		email: String!
		password: String!
	}

	type Query {
		getBoard(interval: Int, done: Boolean): Board!
	}

	type Mutation {
		# User
		signup(signup: Signup!): User
		login(login: Login!): LoginUser!

		# Column
		createColumn(to: Int): Column!
		renameColumn(title: String!, colId: ID!): Column!
		dragColumn(colId: ID!, from: Int!, to: Int!): Boolean!
		removeColumn(colId: ID!): Boolean!

		# Card
		createCard(colId: ID!, date: Date): Card!
		editCard(cardEdit: CardEdit!): Card!
		dragCard(source: CardPosition!, destination: CardPosition!): Boolean!
		removeCard(cardId: ID!): Boolean!
		markCardAsDone(cardId: ID!): Boolean!
	}
`;

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const server = new ApolloServer({
	typeDefs,
	resolvers,
	// plugins: [ApolloServerPluginDrainHttpServer({ httpServer: app.httpServer })],
	formatError: (err) => {
		if (err.message.startsWith("Database Error: ")) {
			return new Error("Internal server error");
		}
		return err;
	},
	context: ({ req }) => {
		const authHeader = req.headers.authorization || "";

		let user, isAuth, userId, email, name;
		try {
			const token = authHeader.split(" ")[1];
			user = jwt.verify(token, jwtSecretKey);
			({ userId, email, name } = user);

			isAuth = true;
		} catch (error) {}

		return { userId, email, name, isAuth };
	},
});

module.exports = server;
