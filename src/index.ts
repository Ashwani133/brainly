import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { userModel, contentModel } from './db';
const app = express();
app.use(express.json())
import { JWT_PASSWORD } from './config';
import { userMiddleware } from './middleware';

app.post("/api/v1/signup", async(req,res)=>{
    //zod validation, hash the password
    const username = req.body.username;
    const password = req.body.password
    try{
        await userModel.create({
            username:username,
            password:password
        })
    
        res.json({message:"New user signed up!" })
    }catch(e){
        res.status(411).json({
            message:"User already exists!"
        })
    }
})

app.post("/api/v1/signin", async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const existingUser = await userModel.findOne({
        username:username,
        password:password
    })
    if(existingUser){
        const token = jwt.sign({
            id:existingUser._id
        },JWT_PASSWORD)

        res.json({
            token
        })
    }else{
        res.status(403).json({
            message:"Incorrect Credentials!"
        })
    }
})

app.post("/api/v1/content",userMiddleware,async (req,res)=>{
    const link = req.body.link
    const type = req.body.type
    await contentModel.create({
        link,
        type,
        //@ts-ignore
        userId:req.userId,
        tags:[]
    })

    res.json({
        message:"content added"
    })
})

app.get("/api/v1/content", (req,res)=>{

})

app.delete("/api/v1/content", (req,res)=>{

})

app.post("/api/v1/brain/share", (req,res)=>{

})

app.get("/api/v1/brain/:shareLink", (req,res)=>{

})

app.listen(3000)