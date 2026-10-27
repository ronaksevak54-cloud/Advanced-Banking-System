const User = require("../models/model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const {sendEmailWithAttachment} = require("../services/emailServices");
const registerUser = async (request, response) => {
  try {
    const { name, email, password } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const findUser = await User.findOne({ email });
    if (findUser) {
      return response
        .status(404)
        .json({ message: "User with this email address already exists" });
    }
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    const savedUser = await user.save();
    const findSavedUser = await User.findById(savedUser._id);
    const token = await jwt.sign(
      { id: findSavedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    };
    cookieParser()(request, response, () => {
      response.cookie("token", token, cookieOptions);
    });
    await sendEmailWithAttachment(savedUser.email, savedUser.name);
    response.status(201).json(savedUser);
  } catch (error) {
    response.status(500).json({ message: error.message });
  } finally {
    response.end();
  }
};
const loginUser = async (request, response) => {
  const { email, password } = request.body;
  try {
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return response.status(404).json({ error: "User not found" });
    }
    const comparePasssword = await bcrypt.compare(password, findUser.password);
    if (comparePasssword === true) {
      const token = await jwt.sign(
        { id: findUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000,
      };
      cookieParser()(request, response, () => {
        response.cookie("token", token, cookieOptions);
      });
      response.status(200).json({ message: "Login Successfully" });
    } else {
      response.status(404).json({ message: "Invalid Credential" });
    }
  } catch (error) {
    response.status(500).json({ message: error.message });
  } finally {
    response.end();
  }
};
module.exports = { registerUser, loginUser };
