const mongoose = require("mongoose");

mongoose.connect(process.env.URL_MONGO)
        .then(() => console.log("MongoDB Atlas is connected"))
        .catch(err => console.log(err));

module.exports = mongoose;