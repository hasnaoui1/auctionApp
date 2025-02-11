const userModel = require("../models/users.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")


const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        const user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).send("User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); 

        const newUser = new userModel({
            name,
            email,
            role,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).send("User registered successfully");
    } catch (error) {
        console.error("Error in registration:", error);
        res.status(500).send("Internal Server Error");
    }
};


const login = async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).send("Invalid credentials");
        } else {
            let compare = await bcrypt.compare(req.body.password, user.password);
            if (compare) {
                let token = await jwt.sign({
                    _id: user._id,
                    email: user.email,
                    role: user.role, 
                }, process.env.SECRETKEY || '123', { expiresIn: '1h' });

                res.status(200).send(token);
            } else {
                res.status(401).send("Invalid credentials");
            }
        }
    } catch (error) {
        res.status(500).send(error);
    }
};
module.exports={login,register}