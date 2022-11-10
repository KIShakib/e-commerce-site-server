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


// Root API
app.get("/", (req, res) => {
    res.send("Shakibs-kitchen Server Is Running...")
});


// JWT Verification
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: "UnAuthorized User" });
    }
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.SECRET_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "UnAuthorized Access" })
        }
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mogodb-practice.uoisaxb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Database Function

async function dataBase() {
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
        app.get("/myallreview/:email", verifyJWT, async (req, res) => {
            const email = req.params.email;
            if (req.decoded === req.params.email) {
                res.status(403).send("Invalid user");
            }
            let query = {};
            if (req.params.email) {
                query = {
                    reviewerEmail: email
                }
            }
            // const query = { reviewerEmail: email };
            const cursor = reviewCollection.find(query);
            const myAllReview = await cursor.sort({ addedTimeEncrypted: -1 }).toArray();
            res.send(myAllReview)
        })

        // Delete Review By ID
        app.delete("/deletereview/:id/:reviewerEmail", async (req, res) => {
            const id = req.params.id;
            const reviewerEmail = req.params.reviewerEmail;
            const query = { _id: ObjectId(id), reviewerEmail: reviewerEmail };
            const result = await reviewCollection.deleteOne(query)
            res.send(result);
        })


        // Update Specific User Specific Review
        app.patch("/updatereview/:_id/:reviewerEmail", async (req, res) => {
            const id = req.params._id;
            const reviewerEmail = req.params.reviewerEmail;
            const updatedReview = req.body.updatedReview;
            const reviewTextEdit = updatedReview.reviewTextEdit;
            const newRatings = updatedReview.newRatings
            console.log(id, reviewerEmail, reviewTextEdit, newRatings);

            const query = { _id: ObjectId(id), reviewerEmail: reviewerEmail };
            const updateDoc = {
                $set: {
                    reviewText: reviewTextEdit,
                    ratings: newRatings
                }
            }
            const result = await reviewCollection.updateOne(query, updateDoc)
            res.send(result);
        })



        // JWT API
        app.post("/jwt", (req, res) => {
            const user = req.body;
            console.log(req.body);
            const token = jwt.sign(user, process.env.SECRET_TOKEN, { expiresIn: "24h" });
            res.send({ token });
        })

    }
    catch (error) {
        console.log(error);
    }
}
dataBase()



// Listen
app.listen(port, () => {
    console.log(`Server Is Running On ${port}`.bgRed.bold);
})