const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
    user:{
        type: String,
    },
    taskName: {
        type: String,
        required: true
    },
    deadline:{
        type: String,
        required: true
    },
    status:{
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = Task = mongoose.model('task', TaskSchema)