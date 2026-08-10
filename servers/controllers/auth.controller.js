import genToken from "../config/token.js";
import User from "../models/user.model.js";

 

export const googleAuth=async (req,res) => {
    try {
        const {name,email}=req.body
        const user=await User.findOne({email})
        //if this email not exist so we create a new user

        if(!user){
            user=await User.create({
                name,
                email
            })
        }
        //now we create token

        let token=await genToken(user._id)

        //storing the token in cookies
        res.cookie('token',token,{
            http:true,
            secure:false,
            sameSite:'strict',
            maxAge:7*24*60*60*1000
        })

        return res.status(200).json(user)

        
    } catch (error) {
        
        return res.status(500).json({
            message:`Google auth error ${error}`
        })
    }
}

export const logOut=async (req,res) => {
    try {
        
    } catch (error) {
        
    }
}