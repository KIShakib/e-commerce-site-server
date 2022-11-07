const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
require("colors");
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


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mogodb-practice.uoisaxb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Database Function

async function run() {
    try {
        const foodCollection = client.db("shakibs-kitchen").collection("foods");

        app.post("/addfood", async (req, res) => {
            const food = req.body;
            const result = await foodCollection.insertOne(food);
            res.send(result)
        })

        app.get("/homepagefoods", async (req, res) => {
            const query = {};
            const cursor = foodCollection.find(query);
            const foods = await cursor.limit(3).toArray();
            res.send(foods)
        })
        app.get("/foods", async (req, res) => {
            const query = {};
            const cursor = foodCollection.find(query);
            const foods = await cursor.toArray();
            res.send(foods)
        })

    }
    catch (error) {
        // console.log((error.name).bgRed);
        // console.log((error.message).bgCyan.bold);
        // console.log((error.stack).bgRed.bold);
        console.log(error);
    }
}
run()






// Listen
app.listen(port, () => {
    console.log(`Server Is Running On ${port}`.bgCyan.bold);
})