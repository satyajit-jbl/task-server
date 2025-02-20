app.get("/tasks", async (req, res) => {
            const tasks = await tasksCollection.find().toArray();
            res.send(tasks);
          });
          
          app.post("/tasks", async (req, res) => {
            const result = await tasksCollection.insertOne(req.body);
            res.send({ ...req.body, _id: result.insertedId });
          });
          
          app.put("/tasks/:id", async (req, res) => {
            const { id } = req.params;
            const update = { $set: req.body };
            const result = await tasksCollection.updateOne({ _id: new ObjectId(id) }, update);
            res.send(result);
          });
       
          
          
          app.delete("/tasks/:id", async (req, res) => {
            const { id } = req.params;
            const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
          });