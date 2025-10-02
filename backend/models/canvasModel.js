const mongoose = require("mongoose");
// const User = require("./userModel");

const CanvasSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    elements: {
      type: [{ type: mongoose.Schema.Types.Mixed }],
    },
    shared_with: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// get canvas
CanvasSchema.statics.getAllCanvases = async function (email) {
  const user = await mongoose.model("User").findOne({ email });
  try {
    if (!user) {
      return Error("User not found");
    }
    const canvases = await this.find({
      $or: [{ owner: user._id }, { shared_with: user._id }],
    });

    return canvases;
  } catch (error) {
    return Error("Error getting canvas");
  }
};

// create a canvas
CanvasSchema.statics.createCanvas = async function (email, name) {
  const user = await mongoose.model("User").findOne({ email });
  try {
    if (!user) {
      return Error("User not found");
    }

    const casnvas = new this({
      owner: user._id,
      name,
      elemets: [],
      shared_with: [],
    });

    newCanvas = await casnvas.save();
    return newCanvas;
  } catch (error) {
    return Error("Error getting canvas");
  }
};

// load canvas
CanvasSchema.statics.loadCanvas = async function (email, id) {
  const user = await mongoose.model("User").findOne({ email });
  try {
    if (!user) {
      return Error("user not found");
    }
    const canvas = await this.findOne({
      _id: id,
      $or: [{ owner: user._id }, { shared_with: user._id }],
    });
    return canvas;
  } catch (error) {
    return Error("Error getting canvas");
  }
};

// update a canvas

CanvasSchema.statics.updateCanvas = async function (email, id, elements) {
  const user = await mongoose.model("User").findOne({ email });
  try {
    if (!user) {
      return Error("User not found");
    }

    // Check if canvas belong to the user or is shared to the user
    const canvas = await this.findOne({
      _id: id,
      $or: [{ owner: user._id }, { shared_with: user._id }],
    });

    console.log({ id });
    if (!canvas) {
      return Error("Canvas not found");
    }
    canvas.elements = elements;
    const updateCanvas = await canvas.save();
    return updateCanvas;
  } catch (error) {
    return Error("Error updating canvas");
  }
};

// add email to shared_with array of canvas

CanvasSchema.statics.shareCanvas = async function (
  email,
  canvasId,
  sharedWithEmail
) {
  const user = await mongoose.model("User").findOne({ email });
  const sharedWithUser = await mongoose
    .model("User")
    .findOne({ email: sharedWithEmail });

  try {
    if (!user || !sharedWithUser) {
      throw new Error("User not found");
    }

    const canvas = await this.findOne({ _id: canvasId, owner: user._id });
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    canvas.shared_with.push(sharedWithUser._id);
    const updateCanvas = await canvas.save();
    return updateCanvas;
  } catch (error) {
    throw new Error("Error sharing canvas");
  }
};

const Canvas = mongoose.model("Canvas", CanvasSchema);

module.exports = Canvas;
