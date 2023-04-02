const express = require("express");
const dividends = require("./routes/dividends");

//Middlewares
const app = express();
app.use(express.json());

// Routes
app.use("/dividends", dividends);

const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`Listening port ${port}`));