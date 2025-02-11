const UserModel = require ('../models/users.model')

const addUser=(req,res)=>{
    let user = new UserModel(req.body)
    try{
        user.save()
        res.status(200).send("user added successfully")
    }catch(err){
        res.status(410).send(err)
    }
    
    
}
const deleteUser=(req,res)=>{
    let id = req.body.id;
    try{
        UserModel.deleteOne({_id : id})
        res.status(200).send("user deleted")
    }catch(err){
        res.status(420).send(err)
    }
    
}
const updateUser=async (req,res)=>{
    let id = req.params.id
    try{
       let result =await UserModel.updateOne({_id : id} ,req.body)
       res.send(result)
    }catch(err){
        res.status(420).send(err)
    }
    
}
const getAllUsers = async (req, res) => {
    data = await UserModel.find()
    res.send(data)
    
}



const getUserById = async (req, res) => {
    let id = req.params.id
    try{
        data = await UserModel.findOne({_id: id})
        res.send(data)
    }catch(err){
        res.status(420).send(err)   

    }
}


module.exports= {addUser,deleteUser,updateUser,getUserById,getAllUsers}