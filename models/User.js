const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const Board = require("./Board");

const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		name: String,
		googleId: String, // if google auth
		secret: String, // if google auth
		picture: String, // if google auth
		board: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "Board",
			required: true,
		},
	},
	{ timestamps: true }
);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema, "users");

passport.use(User.createStrategy());
passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_LOGIN_CLIENT_ID,
			clientSecret: process.env.GOOGLE_LOGIN_CLIENT_SECRET,
			callbackURL: "/auth/google/callback",
			userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
		},
		(accessToken, refreshToken, profile, cb) => {
			User.findOne({ googleId: profile.id }).then((user) => {
				if (user) {
					return cb(null, user);
				}

				bcrypt
					.hash(profile.id + process.env.GOOGLE_LOGIN_CLIENT_SECRET, 12)
					.then((hashedPw) => {
						user = new User({
							password: hashedPw,
							googleId: profile.id,
							email: profile._json.email,
							name: profile.displayName,
							picture: profile._json.picture,
						});

						const board = new Board({ author: user._id });
						user.board = board._id;

						board.save();
					})
					.then(() => user.save())
					.then((user) => cb(null, user))
					.catch((err) => {
						console.error(err.message);
						if (err.message.startsWith("E11000")) {
							return cb("This email is already registered.");
						}
						cb("Server error occured. Sorry for the interrupt.");
					});
			});
		}
	)
);

module.exports = User;
