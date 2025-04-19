import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
    try {
        console.log('Register - Request body:', req.body);
        console.log('Register - Request file:', req.file);

        const { fullname, email, phoneNumber, password, role } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "All fields are required: fullname, email, phoneNumber, password, role",
                success: false,
            });
        }

        let profilePhoto = '';
        if (req.file) {
            try {
                const fileUri = getDataUri(req.file);
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
                profilePhoto = cloudResponse.secure_url;
            } catch (fileError) {
                console.error('File upload error:', fileError.message);
                return res.status(400).json({
                    message: "Failed to process profile photo",
                    error: fileError.message,
                    success: false,
                });
            }
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: "User already exists with this email",
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto,
            },
        });

        return res.status(201).json({
            message: "Account created successfully",
            success: true,
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        return res.status(500).json({
            message: "Server error during registration",
            error: error.message,
            success: false,
        });
    }
};

export const login = async (req, res) => {
    try {
        console.log('Login - Request body:', req.body);

        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required: email, password, role",
                success: false,
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with this role",
                success: false,
            });
        }

        const tokenData = { userId: user._id };
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        const userData = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        };

        return res
            .status(200)
            .cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' })
            .json({
                message: `Welcome back ${user.fullname}`,
                user: userData,
                success: true,
            });
    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({
            message: "Server error during login",
            error: error.message,
            success: false,
        });
    }
};

export const logout = async (req, res) => {
    try {
        return res
            .status(200)
            .cookie("token", "", { maxAge: 0, httpOnly: true, sameSite: 'strict' })
            .json({
                message: "Logged out successfully",
                success: true,
            });
    } catch (error) {
        console.error('Logout error:', error.message);
        return res.status(500).json({
            message: "Server error during logout",
            error: error.message,
            success: false,
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        console.log('UpdateProfile - Request body:', req.body);
        console.log('UpdateProfile - Request file:', req.file);

        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const userId = req.id; // From authentication middleware

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        let resume = user.profile.resume || '';
        let resumeOriginalName = user.profile.resumeOriginalName || '';
        if (req.file) {
            try {
                const fileUri = getDataUri(req.file);
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
                resume = cloudResponse.secure_url;
                resumeOriginalName = req.file.originalname;
            } catch (fileError) {
                console.error('File upload error:', fileError.message);
                return res.status(400).json({
                    message: "Failed to process resume",
                    error: fileError.message,
                    success: false,
                });
            }
        }

        if (fullname) user.fullname = fullname;
        if (email) {
            if (!email.includes('@') || !email.includes('.')) {
                return res.status(400).json({
                    message: "Invalid email format",
                    success: false,
                });
            }
            user.email = email;
        }
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = skills.split(",").map(skill => skill.trim());

        user.profile.resume = resume;
        user.profile.resumeOriginalName = resumeOriginalName;

        await user.save();

        const userData = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
        };

        return res.status(200).json({
            message: "Profile updated successfully",
            user: userData,
            success: true,
        });
    } catch (error) {
        console.error('UpdateProfile error:', error.message);
        return res.status(500).json({
            message: "Server error during profile update",
            error: error.message,
            success: false,
        });
    }
};