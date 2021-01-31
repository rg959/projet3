const mongoose = require('mongoose');

const historySchema = mongoose.Schema({
    user_id : {
        type: String,
        required: [true, "User ID required"]
    },
    departure_location : {
        type: String,
        required : [true, "Departure location required"]
    },
    arrival_location : {
        type: String,
        required : [true, "Arrival location required"]
    },
    waypoints : {
        type : Array
    },
    duration : {
        type: String,
        required : [true, "Duration is required"]
    },
    mode : {
        type: String,
        required : [true, "Mode is required"]
    }
}, { timestamps: true })

const History = mongoose.model('history', historySchema);

module.exports = History;