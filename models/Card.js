const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cardSchema = new Schema(
	{
		id: { type: Number, required: true, unique: true },
		title: { default: "Add a Card Title", type: String, required: true },
		description: { default: "Description...", type: String },
		done: { default: false, type: Boolean },
		priority: Number,
		date: Date,
		column: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "Column",
			required: true,
		},
		board: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "Board",
			required: true,
		},
	},
	{ timestamps: true }
);

cardSchema.index(
	{ id: 1, board: 1 },
	{ unique: true, comment: "Card id should be unique within a board" }
);

module.exports = mongoose.model("Card", cardSchema, "cards");
