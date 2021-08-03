const express = require("express");
const router = express.Router();

const Task = require("../../models/Task");

//@route   GET api
//@access  Public
router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
      }
  });
  
//@route   POST api/task
//@desc    Create or update task

router.post("/", async (req, res) => {
    
    const {
        user,
        taskName,
        deadline,
        status,
        date
    } = req.body;
    //Build task object
    const taskFields = {};
    if (user) taskFields.user = user;
    if (taskName) taskFields.taskName = taskName;
    if (deadline) taskFields.deadline = deadline;
    if (status) taskFields.status = status;
    if (date) taskFields.date = date;
    try{
      //Create
      task = new Task(taskFields);
      await task.save();
      return res.json(task);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
    res.send(taskFields);
  });

//@route   DELETE api/task
//@desc    DELETE  task

router.delete(`/:name`, async (req, res) => {
  try {
    //Remove task
    await Task.findOneAndRemove({ taskName: req.params.name });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
