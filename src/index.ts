import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { userModel, contentModel, linkModel } from './db';
const app = express();
app.use(express.json())
import { JWT_PASSWORD } from './config';
import { userMiddleware } from './middleware';
import { random } from './utils';

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
        title:req.body.title,
        //@ts-ignore
        userId:req.userId,
        tags:[]
    })

    res.json({
        message:"content added"
    })
})

app.get("/api/v1/content",userMiddleware,async (req,res)=>{
    //@ts-ignore
    const userId = req.userId;
    const content = await contentModel.find({
        userId: userId
    }).populate("userId","username")
    res.json({
        content
    })
})

app.delete("/api/v1/content",userMiddleware,async (req,res)=>{
    const contentId = req.body.contentId
    await contentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId:req.userId
    })
    res.json({
        message:"Deleted"
    })
})

app.post("/api/v1/brain/share",userMiddleware,async (req,res)=>{
    const share = req.body.share;
    if(share){
        const existingLink = await linkModel.findOne({
            //@ts-ignore
            userId: req.userId
        })

        if(existingLink){
            res.json({
                hash:existingLink.hash
            })
            return;
        }
        const hash = random(10);
        await linkModel.create({
            //@ts-ignore
            userId:req.userId,
            hash:hash
        })
        res.json({
            message:hash
        })
    }else{
        await linkModel.deleteOne({
            //@ts-ignore
            userId:req.userId
        })
        res.json({
            message:"Removed link."
        })
    }

})

app.get("/api/v1/brain/:shareLink",async (req,res)=>{
    const hash = req.params.shareLink;
    
    const link = await linkModel.findOne({
        hash:hash
    })

    if(!link){
        res.status(411).json({
            message:"Sorry incorrect input!"
        })
        return;
    }

    //userId
    const content = await contentModel.find({
        userId: link.userId
    })

    const user = await userModel.findOne({
        _id:link.userId
    })

    if(!user){
        res.json(411).json({
            message:"user not found, error should ideally not happen."
        })
        return;
    }
    res.json({
        username:user.username,
        content:content
    })
})

app.listen(3000)