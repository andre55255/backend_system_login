const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
require("./db/connection");

const PORT_SERVER = process.env.PORT_SERVER || 8081;
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/user", userRoutes);
app.use("/product", productRoutes);

app.listen(PORT_SERVER, () => console.log(`Listening in port ${PORT_SERVER}`));