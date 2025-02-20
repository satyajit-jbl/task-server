const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zh93j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();



        const jobtask = client.db('scic-jobtask')
        const tasksCollection = jobtask.collection('tasks')
        const userCollection = jobtask.collection('users')
        

        app.get("/tasks", async (req, res) => {
            const tasks = await tasksCollection.find().toArray();
            res.send(tasks);
          });
          
          
        app.post("/tasks", async (req, res) => {
            const { title, description, category, time } = req.body;
            
            if (!title || !time) {
                return res.status(400).json({ error: "Title and time are required" });
            }
        
            const newTask = {
                title,
                description,
                category,
                time,
            };
        
            const result = await tasksCollection.insertOne(newTask);
            res.json({ insertedId: result.insertedId });
        });
        

        app.put("/tasks/:id", async (req, res) => {
            try {
                const { id } = req.params;
                const { title, description, category, time } = req.body;
        
                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ error: "Invalid task ID format" });
                }
        
                const updatedTask = {
                    $set: {
                        title,
                        description,
                        category,
                        time,
                    },
                };
        
                const result = await tasksCollection.updateOne(
                    { _id: new ObjectId(id) },
                    updatedTask
                );
        
                if (result.modifiedCount === 0) {
                    return res.status(404).json({ error: "Task not found or no changes made" });
                }
        
                res.json({ message: "Task updated successfully" });
            } catch (error) {
                console.error("Error updating task:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
        
        
          
          
          app.delete("/tasks/:id", async (req, res) => {
            const { id } = req.params;
            const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
          });

          app.put("/tasks/reorder", async (req, res) => {
            try {
              const updates = req.body.tasks;
          
              // Validate all IDs before processing
              for (let task of updates) {
                if (!ObjectId.isValid(task._id)) {
                  return res.status(400).json({ error: "Invalid task ID format" });
                }
              }
          
              const bulkOps = updates.map(({ _id, order }) => ({
                updateOne: {
                  filter: { _id: new ObjectId(_id) }, // Convert string ID to ObjectId
                  update: { $set: { order } },
                },
              }));
          
              await db.collection("tasks").bulkWrite(bulkOps);
              res.json({ message: "Tasks reordered successfully" });
            } catch (error) {
              console.error("Error reordering tasks:", error);
              res.status(500).json({ error: "Internal Server Error" });
            }
          });
          
          
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('JobTask Satya is runing')
})

app.listen(port, () => {
    console.log(`JobTask Satya is running on port ${port}`);
})