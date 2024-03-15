import { Schema, model } from "mongoose"

const UserSchema = new Schema({
    userId : { type : Number, required : true },
    username : String,
    wallet : String
})

export const UserModel = model("User", UserSchema)