import * as express from "express";
import * as proxy from "http-proxy-middleware";
import * as mongoose from "mongoose";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as jsonwebtoken from "jsonwebtoken";
import { UserSchema } from "./api/models/userModel";
import { readFileSync } from "fs";
import * as path from "path";
import { UserModel } from "./api/models/userModel";
import { register, logIn } from "./api/controllers/userController";

const secret = readFileSync(path.join(__dirname, "..", "config", "secret.txt"), "utf8");

mongoose.connect("mongodb://mongo/Users", { useMongoClient: true });
mongoose.model("User", UserSchema);

const User = mongoose.model<UserModel>("User");

const app = express();

const proxyConfig = require("../config/proxyConfig.json");
const config: proxy.Config = {
    ...proxyConfig,
    pathRewrite: { "^/api": "" }
};

app.use("/auth", bodyParser.json());
app.route("/auth/register").post(register(User));
app.route("/auth/log_in").post(logIn(User, secret));

app.use("/api",
    cookieParser(),
    (req, res, next) => {
        let token: string;

        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers && req.headers.authorization) {
            const [key, value] = (req.headers.authorization as string).split(" ");

            if (key === 'JWT') {
                token = value;
            }
        }

        if (token) {
            jsonwebtoken.verify(token, secret, (err, decode: string) => {
                if (!err) {
                    delete req.headers.authorization;
                    next();
                }
            });
        } else {
            res.status(401).json({ message: "Unauthenticated user" });
        }
    },
    proxy(config));

app.listen(3000);
