import jwt from 'jsonwebtoken'

const genToken=async (userId) => {
    //we have to create token
    try {
        const token=jwt.sign({
            userId
            
        },process.env.JWT_SECRET,{expiresIn:'7d'})
    } catch (error) {
        console.log(error);
        
    }
}

export default genToken