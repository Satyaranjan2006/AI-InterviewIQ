import User from '../models/user.model.js'

export const getCurrentUser=async (req,res) => {
    try {
        //this user id we will get from isAuth.js
        const userId=req.userId

        //finding the user

        const user=await User.findById(userId)

        if(!user){
            return res.status(404).json({
                message:'user does not found'
            })
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({
            message:`Failed to get current user ${error}`
        })
    }
}