require('dotenv').config();
const mongoose=require("mongoose");

const mongoUri = process.env.MONGO_URI;
console.log("Mongo uri is -> ", mongoUri);
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 60000, // 60 seconds
  socketTimeoutMS: 60000,  // 60 seconds
});
console.log("Connected successfully");

const victimSchema = new mongoose.Schema({ 
    username: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    sos: [{
        location: { lat: Number, lng: Number },
        battery: Number,
        type: { type: String, enum: ["Medical", "Food/Water", "Trapped", "Other"] },
        timestamp: { type: Date, default: Date.now },
        status: { type: String, default: "Pending" } // Pending / Acknowledged / Resolved
    }]
});

const responderSchema = new mongoose.Schema({
    username: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Volunteer", "Official"], default: "Volunteer" },
    assignedSOS: [{
        victimId: { type: mongoose.Schema.Types.ObjectId, ref: "Victim" },
        status: { type: String, default: "Assigned" } // Assigned / In-Progress / Completed
    }]
});

const Responder = mongoose.model("Responder", responderSchema);
const Victim = mongoose.model("Victim", victimSchema);

module.exports = {
    Responder,
    Victim
}
