const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const columnSchema = new Schema(
	{
		id: { type: Number, required: true },
		title: { default: "Add a Column Title", type: String, required: true },
		cards: [
			{
				default: [],
				type: mongoose.SchemaTypes.ObjectId,
				ref: "Card",
				sparse: true, // can be null but must be unique
			},
		],
		board: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: "Board",
			required: true,
		},
	},
	{ timestamps: true }
);

columnSchema.index(
	{ id: 1, board: 1 },
	{ unique: true, comment: "Column id should be unique within a board" }
);

module.exports = mongoose.model("Column", columnSchema, "columns");
