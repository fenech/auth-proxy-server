import * as express from "express";
import * as proxy from "http-proxy-middleware";
import * as mongoose from "mongoose";
import * as bodyParser from "body-parser";
import * as jsonwebtoken from "jsonwebtoken";
import { UserSchema } from "./api/models/userModel";

mongoose.connect('mongodb://mongo/Users');
mongoose.model("User", UserSchema);

import { logIn, loginRequired } from "./api/controllers/userController";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const proxyConfig = require("./proxyConfig.json");
const config: proxy.Config = {
    ...proxyConfig,
    secure: false,
    pathRewrite: { "^/api": "" }
};

const secret: string = require("./secret.json");

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

app.route("/auth/log_in").post(logIn);
app.route("/api").all(loginRequired, proxy(config));

app.listen(3000);
