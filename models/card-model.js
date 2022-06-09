const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
  cardName: { type: String, required: false },
  image: {
    type: String,
    default:
      "https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png",
  },
  name: { type: String, required: false },
  profession: { type: String, required: false },
  links: {
    tel: { type: String, required: false },
    email: { type: String, required: false },
    facebook: { type: String, required: false },
    instagram: { type: String, required: false },
    twitter: { type: String, required: false },
    linkedin: { type: String, required: false },
  },

  address: String,
  creator: { type: String, required: true },
});

module.exports = mongoose.model("Card", CardSchema);
