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
  const { user, taskName, deadline, complete, date } = req.body;
  //Build task object
  const taskFields = {};
  taskFields.user = user;
  taskFields.taskName = taskName;
  taskFields.deadline = deadline;
  taskFields.complete = complete;
  taskFields.date = date;
  try {
    //Create
    task = new Task(taskFields);
    await task.save();
    return res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
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
