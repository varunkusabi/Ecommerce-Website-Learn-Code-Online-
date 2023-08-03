const User = require("../models/user");
const Order=require("../models/order");

exports.getUserById = (req, res, next, id) => {
    console.log("user id: "+id);
  User.findById(id, (err, user) => {
    if (err) {
      return res.status(400).json({
        error: "User eerro",
      });
    }
    if (!user) {
      return res.status(400).json({
        error: "User not found in db",
      });
    }
    req.profile = user; // creating profile object in req which store user
    next();
  });
};

exports.getUser = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  return res.json(req.profile);
};

exports.getAllUser = (req, res) => {
  User.find().exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "no user in db",
      });
    }
    res.json(user);
  });
};

exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.profile._id },
    {
      $set: req.body,
    },
    { new: true, useFindAndModify: false },
    (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "not able to update"
        });
      }
      user.salt=undefined;
      user.encry_password=undefined;
      res.json(user);
    }
  );
};

exports.userPurchaseList=(req,res)=>{
    User.find({user:req.profile._id})
    .populate("user","_id name")
    .exec((err,order)=>{
        if(err || !order)
        {
            return res.status(400).json({
                error:"No order in this account"
            })
        }
        return res.json(order);
    })
}

exports.pushOrderInPurchaseList=(req,res,next)=>{
    const purchase=[];
    req.body.order.products.forEach(product => {
        purchase.push({
            _id:product._id,
            name:product.name,
            description:product.description,
            category:product.category,
            quantity:product.quantity,
            amount:req.body.order.amount,
            transaction_id:req.body.order.transaction_id
        })
    });

    //store in db
    User.findOneAndUpdate(
        {_id:req.profile._id},
        {$push:{purchase:purchase}},
        {new:true},
        (err,purchases)=>{
            if(err)
            {
                return res.status(400).json({
                    error:"Unable to save purchase list"
                });
         
            }
            next();
        }
    )
    
    
    
}
