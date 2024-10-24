const authenticate=(req,res,next)=>{
    const {token}=req.cookies;
    if(token){
        next();
    }
    else{
        res.render('login')
    }
}

export default authenticate;