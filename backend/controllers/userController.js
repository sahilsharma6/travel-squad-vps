import asyncHandler from "../middleware/asyncHandler.js";
import Cab from "../models/cabModel.js";
import Hotel from "../models/hotelModel.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generatetoken.js";


const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;


  const user = await User.findOne({ email },) ;
  
 
  if (user && (await user.matchPassword(password))) {
    user.password=undefined
    console.log(user);
    
    generateToken(res, user);

    res.status(200).json(user);
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});



const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
  });

  if (user) {
    //generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});




// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        role:user.role
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    console.log(user)
    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
  
      if (req.body.password) {
        user.password = req.body.password;
      }
  
      const updatedUser = await user.save();
  
      res.json({
        _id: updatedUser._id,
        
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await User.deleteOne({ _id: user._id });
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    return res.json(user);
  } else { 
    res.status(404);
    throw new Error("User not found");
  }
});
// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  res.send("update user");
});

const changerole=asyncHandler(async(req,res)=>{
  try {
     const {role,userId}=req.body;
  if(role!=='cab' && role!=='hotel'  && role!=='user'){
    res.status(404);
    throw new Error("Role is required");
  }
  const user=await  User.findById(userId);
  if(!user){
    res.status(404);
    throw new Error("User not found");
  }
    user.role=role;
    if(role==='cab'){
      const checkCab=await Cab.findOne({user:userId})
      if(checkCab) return res.status(400).json({message:"Cab Already Exist"})
      const cab=await Cab.create({user:user._id})
      cab.save()
    }
    else if(role==='hotel'){
      const checkHotel=await Hotel.findOne({user:userId})
      if(checkHotel) return res.status(400).json({message:"Hotel Already Exist"})
      const hotel=await Hotel.create({user:user._id})
      hotel.save()
    }else {
      const isExistCab=await Cab.findOneAndDelete({user:userId})
      const isExistHotel=await Hotel.findOneAndDelete({user:userId})
    }
  
  await user.save();
  res.json(user);
  } catch (error) {
    res.status(500).json({success:false,message:"Internal Server Error"});
  }
})


export {
  changerole,
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};
