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
          
        //   app.post("/tasks", async (req, res) => {
        //     const result = await tasksCollection.insertOne(req.body);
        //     res.send({ ...req.body, _id: result.insertedId });
        //   });
          
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
        
        //   app.put("/tasks/:id", async (req, res) => {
        //     const { id } = req.params;
        //     const update = { $set: req.body };
        //     const result = await tasksCollection.updateOne({ _id: new ObjectId(id) }, update);
        //     res.send(result);
        //   });

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
          
          

//          // ✅ Get all tasks
//          app.post("/tasks", async (req, res) => {
//             const { title, description, category } = req.body;
//             const newTask = { title, description, category, timestamp: new Date() };
//             const result = await tasksCollection.insertOne(newTask);
//             res.send({ insertedId: result.insertedId });
//           });
  
//   // ✅ Add a new task
//   app.post("/tasks", async (req, res) => {
//     const { title, description, category } = req.body;
//     if (!title || title.length > 50) {
//       return res.status(400).json({ message: "Title is required (max 50 chars)" });
//     }
  
//     try {
//       const newTask = {
//         title,
//         description: description?.substring(0, 200), // Limit to 200 chars
//         category: category || "To-Do",
//         timestamp: new Date(),
//       };
  
//       const result = await tasksCollection.insertOne(newTask);
//       res.json({ message: "Task added successfully", task: result.ops[0] });
//     } catch (error) {
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });
  
//   // ✅ Edit a task
//   app.put("/tasks/:id", async (req, res) => {
//     const id = req.params.id;
//     const { _id, ...updatedTask } = req.body; // Exclude _id to prevent modification
//     const filter = { _id: new ObjectId(id) };
  
//     try {
//       const result = await tasksCollection.updateOne(filter, { $set: updatedTask });
  
//       if (result.modifiedCount === 0) {
//         return res.status(404).json({ message: "Task not found or no changes made" });
//       }
  
//       res.json({ message: "Task updated successfully" });
//     } catch (error) {
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });
  
//   // ✅ Delete a task
//   app.delete("/tasks/:id", async (req, res) => {
//     const id = req.params.id;
//     const filter = { _id: new ObjectId(id) };
  
//     try {
//       const result = await tasksCollection.deleteOne(filter);
  
//       if (result.deletedCount === 0) {
//         return res.status(404).json({ message: "Task not found" });
//       }
  
//       res.json({ message: "Task deleted successfully" });
//     } catch (error) {
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });

        // // 🚀 Store User Data
        // app.post("/users", async (req, res) => {
        //     const { userId, email, displayName } = req.body;
        //     const existingUser = await userCollection.findOne({ userId });
        //     if (!existingUser) {
        //         await userCollection.insertOne({ userId, email, displayName });
        //     }
        //     res.send("User stored");
        // });

        // // 📌 Add New Task
        // app.post("/tasks", async (req, res) => {
        //     const { userId, title, description, category } = req.body;
        //     const task = { userId, title, description, category, timestamp: new Date() };
        //     const result = await taskCollection.insertOne(task);
        //     res.json({ _id: result.insertedId, ...task });
        // });

        // // 📌 Update Task
        // app.put("/tasks/:id", async (req, res) => {
        //     const { id } = req.params;
        //     const { title, description, category } = req.body;
        //     await taskCollection.updateOne({ _id: id }, { $set: { title, description, category } });
        //     res.send("Task Updated");
        // });

        // // 📌 Delete Task
        // app.delete("/tasks/:id", async (req, res) => {
        //     const { id } = req.params;
        //     await taskCollection.deleteOne({ _id: id });
        //     res.send("Task Deleted");
        // });

        // //Add a Task

        // app.post("/tasks", async (req, res) => {
        //     const { title, description, category, userId } = req.body;
        //     const task = {
        //         title,
        //         description,
        //         category,
        //         timestamp: new Date(),
        //         userId,
        //     };
        //     const result = await taskCollection.insertOne(task);
        //     res.send(result);
        // });

        // //Get Tasks for a User

        // app.get("/tasks", async (req, res) => {
        //     const userId = req.query.userId;
        //     const tasks = await db.collection("tasks").find({ userId }).toArray();
        //     res.send(tasks);
        // });

        // // update task

        // app.put("/tasks/:id", async (req, res) => {
        //     const { id } = req.params;
        //     const { title, description, category } = req.body;
        //     await db.collection("tasks").updateOne(
        //         { _id: new ObjectId(id) },
        //         { $set: { title, description, category } }
        //     );
        //     res.send({ message: "Task updated" });
        // });

        // //Delete a task
        // app.delete("/tasks/:id", async (req, res) => {
        //     const { id } = req.params;
        //     await db.collection("tasks").deleteOne({ _id: new ObjectId(id) });
        //     res.send({ message: "Task deleted" });
        // });






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