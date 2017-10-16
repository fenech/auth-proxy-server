import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt";

interface User {
    fullName: string;
    email: string;
    hash_password: string;
    created: Date;
}

export const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true
    },
    hash_password: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

UserSchema.methods.comparePassword = function (this: User, password: string) {
    return bcrypt.compareSync(password, this.hash_password);
};

export interface UserModel extends User, mongoose.Document {
    comparePassword: { (password: string): boolean };
}
