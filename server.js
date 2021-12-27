const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
require("./db/connection");

const PORT = process.env.PORT || 8081;
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/user", userRoutes);
app.use("/product", productRoutes);

app.listen(PORT, () => console.log(`Listening in port ${PORT}`));