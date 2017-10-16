import * as mongoose from "mongoose";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import * as express from "express";
import { UserModel } from "../models/userModel";

const secret: string = require("./secret.json");

const User = mongoose.model<UserModel>("User");

export const logIn: express.RequestHandler = (req, res) => {
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

            return res.json({ token: jwt.sign(payload, "vlU7AVKCoLYk8F2tigkK") });
        }

        res.status(401).json({ message: "Authentication failed" });
    });
};

export const loginRequired: express.RequestHandler = (req: express.Request & { user: string }, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthenticated user" });

    next();
};
