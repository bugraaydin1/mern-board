const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

require("dotenv").config();

const port = 8080;
const app = express();

const corsOptions = {
	origin: process.env.CORS_ALLOW,
	allowedHeaders: ["Content-Type", "Authorization"],
	optionsSuccessStatus: 200,
};

app.options("*", cors());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		app.listen(process.env.PORT || port, () => {
			console.log(`server started on port ${process.env.PORT || port}`);
		});
	})
	.catch((err) => console.log(err));
