const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Victim } = require("../db");
const victimMiddleware = require("../middleware/victim");
const router = express.Router();

// Register victim
router.post("/register", async (req, res) => {
    const { username, phone, password } = req.body;
    try {
        console.log("log1")
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("log2");
        const newVictim = new Victim({ username, phone, password: hashedPassword });
        console.log("log3");
        await newVictim.save();
        res.json({ msg: "Victim registered successfully" });
    } catch (err) {
        res.status(400).json({ msg: "Error registering victim", error: err });
    }
});

// Victim login
router.post("/login", async (req, res) => {
    const { phone, password } = req.body;
    try {
        const victim = await Victim.findOne({ phone });
        if (!victim) return res.status(404).json({ msg: "Victim not found" });

        const isMatch = await bcrypt.compare(password, victim.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ username: victim.username, role: "Victim" }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

router.get("/auth/check", victimMiddleware, (req, res) => {
    res.status(200).json({ username: req.username }); // Send back the authenticated user's details
});

// Send SOS
router.post("/sos", victimMiddleware, async (req, res) => {
    const { lat, long, battery, type } = req.body;
    try {
        console.log("hello");
        const victim = await Victim.findOne({ username: req.username });
        console.log(victim);
        victim.sos.push({ location: { lat, long }, battery, type });
        await victim.save();
        res.json({ msg: "SOS sent successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Error sending SOS" });
    }
});

module.exports = router;
