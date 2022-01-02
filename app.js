const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const apolloServer = require("./graphql/schema");
const session = require("express-session");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const jwtSecretKey = process.env.JWT_SECRET_KEY;

require("dotenv").config();

const port = 8080;
const app = express();
const httpServer = http.createServer(app);

const corsOptions = {
	origin: process.env.CORS_ALLOW,
	allowedHeaders: ["Content-Type", "Authorization", "authorization"],
	optionsSuccessStatus: 200,
};

app.options("*", cors());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// create session for google auth.
app.use(
	session({
		resave: false,
		saveUninitialized: false,
		secret: process.env.SESSION_SECRET,
	})
);
app.use(passport.initialize());
app.use(passport.session());

app.get(
	"/user/auth/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
	"/auth/google/callback",
	passport.authenticate("google", {
		authInfo: true,
		passReqToCallback: true,
		failWithError: true,
		failureMessage: "We cannot add the user now.",
		failureRedirect: "/auth/google/failure", //"http://localhost:3000/user/login",
	}),
	(req, res, next) => {
		const token = jwt.sign(
			{
				userId: req.user._id,
				name: req.user.name,
				email: req.user.email,
				googleId: req.user.googleId,
				picture: req.user.picture,
			},
			jwtSecretKey,
			{ expiresIn: "6h" }
		);

		res.redirect(`/user/login?token=${token}`);
	}
);

app.get("/logout", function (req, res) {
	res.redirect("/user/login");
});

// ⚛️ serve React related files
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "frontend", "build")));

	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
	});
}

mongoose
	.connect(process.env.MONGODB_URI /* { useNewUrlParser: true } */)
	.then(() => apolloServer.start())
	.then(() => apolloServer.applyMiddleware({ app }))
	.then(() => {
		httpServer.listen({ port: process.env.PORT || 4000 });
	})
	.then(() => {
		console.log(
			`🚀 Server started on: ${
				process.env.NODE_ENV !== "production"
					? "http://localhost:"
					: "http://mern-board.herokuapp.com:"
			}${(process.env.PORT || 4000) + apolloServer.graphqlPath}
			`
		);
	})
	.catch((err) => console.log(err));

module.exports = app;
