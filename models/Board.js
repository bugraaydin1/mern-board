const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const boardSchema = new Schema(
	{
		columns: [
			{
				default: [],
				type: mongoose.SchemaTypes.ObjectId,
				ref: "Column",
			},
		],
		author: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Board", boardSchema, "boards");
