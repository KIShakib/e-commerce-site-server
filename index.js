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
        const reviewCollection = client.db("shakibs-kitchen").collection("reviews");

        // Add Food From Admin DashBoard
        app.post("/addfood", async (req, res) => {
            const food = req.body;
            const result = await foodCollection.insertOne(food);
            res.send(result)
        })

        // Send Limited Food For Homepage
        app.get("/homepagefoods", async (req, res) => {
            const query = {};
            const cursor = foodCollection.find(query);
            const foods = await cursor.sort({ addedTimeEncrypted: -1 }).limit(3).toArray();
            res.send(foods)
        })

        // Send All Food For Foods Page
        app.get("/foods", async (req, res) => {
            const query = {};
            const cursor = foodCollection.find(query);
            const foods = await cursor.sort({ addedTimeEncrypted: -1 }).toArray();
            res.send(foods)
        })

        // Send Food By Id For Individual Food Details
        app.get("/food/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const food = await foodCollection.findOne(query);
            res.send(food);
        })

        // Add Reviews
        app.post("/addreview", async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result)
        })

        // Review By Id
        app.get("/reviewbyid/:id", async (req, res) => {
            const id = req.params.id;
            const query = { foodId: id };
            const cursor = reviewCollection.find(query);
            const reviewById = await cursor.sort({ addedTimeEncrypted: -1 }).toArray();
            res.send(reviewById)
        })

        // Review By User Gmail
        app.get("/myallreview/:email", async (req, res) => {
            const email = req.params.email;
            const query = { reviewerEmail: email };
            const cursor = reviewCollection.find(query);
            const myAllReview = await cursor.sort({ addedTimeEncrypted: -1 }).toArray();
            res.send(myAllReview)
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