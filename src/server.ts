import * as express from "express";
import * as proxy from "http-proxy-middleware";
import * as mongoose from "mongoose";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as jsonwebtoken from "jsonwebtoken";
import { UserSchema } from "./api/models/userModel";
import { readFileSync } from "fs";
import * as path from "path";

const secret = readFileSync(path.join(__dirname, "..", "config", "secret.txt"), "utf8");

mongoose.connect('mongodb://mongo/Users');
mongoose.model("User", UserSchema);

import { register, logIn, loginRequired } from "./api/controllers/userController";

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

const proxyConfig = require("../config/proxyConfig.json");
const config: proxy.Config = {
    ...proxyConfig,
    secure: false,
    pathRewrite: { "^/api": "" }
};

interface Request extends express.Request {
    user: string;
    cookies: {
        accessToken: string;
    };
}

app.use((req: Request, res, next) => {
    req.user = undefined;
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
                req.user = decode;
            }
        });
    }

    next();
});

app.route("/auth/register").post(register);
app.route("/auth/log_in").post(logIn(secret));
app.use("/api",
    loginRequired,
    (req, res, next) => {
        req.headers.authorization = "";
        next();
    },
    proxy(config));

app.listen(3000);
