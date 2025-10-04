const jwt=require("jsonwebtoken");
const { JWT_SECRET }=require("../config");

function victimMiddleware(req,res,next){
    try{
        const token=req.headers.authorization;
        const words=token.split(" ");
        const jwtToken=words[1];
        console.log(jwtToken);

        const decodedValue= jwt.verify(jwtToken,JWT_SECRET);
        console.log(decodedValue);
        if (decodedValue.username) {    
            req.username = decodedValue.username; // Set username in request object
            next();
        }
        else{
            res.status(403).json({
                msg:"You are not authenticated"
            })
        }
    } catch(e){
        res.json({
            msg:"Incorrect inputs"
        })
    }  
}
module.exports=victimMiddleware;