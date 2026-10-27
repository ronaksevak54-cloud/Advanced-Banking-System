const mongoose=require("mongoose")
const blacklistedSchema=new mongoose.Schema({
    token:{
        type:String,
        required:[true,"Token is required"],
    },
    blacklistedAt:{
        type:Date,
        default:Date.now
    }
})
blacklistedSchema.index({blacklistedAt:1},{expireAfterSeconds:3600})
module.exports=mongoose.model("Blacklisted",blacklistedSchema)
