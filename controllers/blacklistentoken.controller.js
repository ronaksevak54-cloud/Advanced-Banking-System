const Blacklisted=require("../models/blacklisted.model")
const logoutcontroller=async(request,response)=>{
    try{
    const token=request.cookies?.token || request.headers.authorization?.split(" ")[1];
    if(!token){
        return response.status(400).json({message:"Token not found"})
    }
    const tokenm=new Blacklisted({
        token
    })
    const savetoken=await tokenm.save()
    response.clearCookie("token")
    return response.status(200).json({message:"User Logout Successfully"})
}
catch(error){
    return response.status(500).json({message:error.message})
}
}
module.exports=logoutcontroller
