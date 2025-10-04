const express = require("express");
const connectDB = require("./db/index");
const victimRoutes = require("./routes/victim");
const responderRoutes = require("./routes/responder");

const app = express();
require("dotenv").config();

app.use(express.json());

app.use("/victim", victimRoutes);
app.use("/responder", responderRoutes);

module.exports = app;

const PORT =  5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
