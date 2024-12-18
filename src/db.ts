import mongoose, { model,Schema } from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

const mongoURI = process.env.MONGO_URL;

mongoose.connect("mongodb+srv://ashwani_9818:Ashwani%409818@cluster0.f6z2x.mongodb.net/brainly")
const userSchema = new Schema({
    username:{type:String, unique:true},
    password:String
})

export const userModel = model("users",userSchema);

const contentSchema = new Schema({
    title:String,
    link:String,
    tags:[{type:mongoose.Types.ObjectId, ref:'tag'}],
    userId:{type:mongoose.Types.ObjectId, ref:'users', required:true}
})

export const contentModel = model("content",contentSchema)