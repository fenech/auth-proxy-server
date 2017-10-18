import * as mongoose from "mongoose";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import * as express from "express";
import { UserModel } from "../models/userModel";

const User = mongoose.model<UserModel>("User");

export const register: express.RequestHandler = (req, res) => {
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

export const logIn: { (secret: string): express.RequestHandler } = (secret) => (req, res) => {
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

            res.json({ token: jwt.sign(payload, secret) });
        } else {
            res.status(401).json({ message: "Authentication failed" });
        }
    });
};

export const loginRequired: express.RequestHandler = (req: express.Request & { user: string }, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthenticated user" });

    next();
};
