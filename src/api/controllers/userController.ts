import * as mongoose from "mongoose";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import * as express from "express";
import { UserModel } from "../models/userModel";

type User = mongoose.Model<UserModel>;

export const register = (User: User): express.RequestHandler => (req, res) => {
    const newUser = new User(req.body);
    newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
    newUser.save((err, user) => {
        if (err) {
            res.status(400).json({ message: err });
        } else {
            user.hash_password = undefined;
            res.json(user);
        }
    });
};

export const logIn = (User: User, secret: string): express.RequestHandler => (req, res) => {
    User.findOne({
        email: req.body.email
    }, (error, user) => {
        if (error) throw error;

        if (user && user.comparePassword(req.body.password)) {
            const payload = {
                email: user.email,
                fullName: user.fullName,
                _id: user._id
            };

            const accessToken = jwt.sign(payload, secret, { expiresIn: "8h" });

            res.cookie("accessToken", accessToken, { httpOnly: true }).send();
        } else {
            res.status(401).json({ message: "Authentication failed" });
        }
    });
};
