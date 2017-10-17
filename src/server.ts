import * as express from "express";
import * as proxy from "http-proxy-middleware";
import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import * as bodyParser from "body-parser";
import * as jsonwebtoken from "jsonwebtoken";
import { UserSchema } from "./api/models/userModel";
import { readFileSync } from "fs";
import * as path from "path";

const secret = readFileSync(path.join(__dirname, "..", "config", "secret.txt"), "utf8");
mongoose.connect('mongodb://mongo/Users');
mongoose.model("User", UserSchema);

import { logIn, loginRequired } from "./api/controllers/userController";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const proxyConfig = require("../config/proxyConfig.json");
const config: proxy.Config = {
    ...proxyConfig,
    secure: false,
    pathRewrite: { "^/api": "" }
};

app.use(function (req: express.Request & { user: string }, res, next) {
    req.user = undefined;

    if (req.headers && req.headers.authorization) {
        const [key, value] = (req.headers.authorization as string).split(" ");

        if (key === 'JWT') {
            jsonwebtoken.verify(value, secret, function (err, decode: string) {
                if (!err) {
                    req.user = decode;
                }
            });
        }
    }

    next();
});

app.route("/auth/log_in").post(logIn(secret));
app.route("/api").all(
    loginRequired,
    (req, res, next) => {
        req.headers.authorization = "";
        next();
    },
    proxy(config));

app.listen(3000);
