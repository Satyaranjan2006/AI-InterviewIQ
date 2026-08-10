import mongoose from 'mongoose'
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    credits:{
        trype:Number,
        default:100
    }
},{timestamps:true})

const User=mongoose.model('users',userSchema)

export default User