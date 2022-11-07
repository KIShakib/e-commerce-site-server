const express = require('express');;
const cors = require('cors');
const jwt = require("jsonwebtoken");
require("colors");
require('colors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// MiddleWare
app.use(cors());
app.use(express.json());


// API
app.get("/", (req, res) => {
    res.send("Shakibs-kitchen Server Is Running...")
});














// Listen
app.listen(port, () => {
    console.log(`Server Is Running On ${port}`.bgMagenta.bold);
})