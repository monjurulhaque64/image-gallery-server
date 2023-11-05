const express = require("express");
const app = express();
const cors = require("cors");
const { ObjectId } = require("mongodb");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1cvgdrp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    //   await client.connect();

    const photoCollection = client.db("image-gallery").collection("photos");

    //   photo api

    app.get("/photos", async (req, res) => {
      const result = await photoCollection.find().toArray();
      res.send(result);
    });

    app.post("/photos", async (req, res) => {
      const newPhoto = req.body;
      const result = await photoCollection.insertOne(newPhoto);
      res.send(result);
    });

    app.delete("/photos", async (req, res) => {
      const { photoUrls } = req.body; // Change to photoUrls

      if (!photoUrls || !Array.isArray(photoUrls)) {
        return res.status(400).json({ error: "Invalid input" });
      }

      try {
        const result = await photoCollection.deleteMany({
          photo: { $in: photoUrls },
        });

        if (result.deletedCount > 0) {
          res.json({ message: "Selected photos deleted successfully" });
        } else {
          res.status(404).json({ error: "No matching photos found" });
        }
      } catch (error) {
        console.error("Error deleting selected photos:", error);
        res.status(500).json({ error: "Error deleting selected photos" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("gallery Server is running");
});

app.listen(port, () => {
  console.log(`gallery ${port}`);
});
