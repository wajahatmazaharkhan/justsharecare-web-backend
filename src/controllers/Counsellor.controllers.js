import { User } from "../models/User.models.js"
import { Counsellor } from "../models/Counsellor.models.js"
import { ImagekitFileUploader } from "../services/imagekit.services.js"
import { CounsellorLoginValiation, CounsellorValidation } from "../validator/Counsellor.validation.js"
import bcrypt from "bcryptjs"

export const CounsellorSignup = async (req, res) => {
    try {
        const data = CounsellorValidation.parse(req.body);

        // Check if email exists
        const existing = await User.findOne({ email: data.email });
        if (existing) {
            return res.status(400).json({ msg: "Email already registered" });
        }

        const user = await User.create({
            fullname: data.fullname,
            email: data.email,
            Password: data.Password,
            phone_number: data.contact_number,
            dob: data.dob,
            gender: data.gender,
            preferred_language: data.preferred_language,
            timezone: data.timezone,
            role: "counsellor"
        });

        /* ---------------------------------------------------------
       HANDLE FILES UPLOAD VIA MULTER
    --------------------------------------------------------- */
        const f = req.files;

        console.log("BODY:", req.body);
        console.log("FILES:", req.files);


        const uploadIfExists = async (file) => {
            return file ? await ImagekitFileUploader(file.path, file.originalname) : null;
        };

        const governmentID = await uploadIfExists(f?.government_id?.[0]);
        const profilePicture = await uploadIfExists(f?.profile_picture?.[0]);
        const qualificationCert = await uploadIfExists(f?.qualification_certificates?.[0]);
        const licenceDoc = await uploadIfExists(f?.licence?.[0]);
        const experienceLetter = await uploadIfExists(f?.experince_letter?.[0]);
        const additionalDocs = await uploadIfExists(f?.additional_documents?.[0]);

        /* ---------------------------------------------------------
           CREATE COUNSELLOR PROFILE
        --------------------------------------------------------- */
        const profile = await Counsellor.create({
            user_id: user._id,
            fullname: data.fullname,
            email: data.email,
            dob: data.dob,
            gender: data.gender,
            contact_number: data.contact_number,
            counselling_type: data.counselling_type,
            specialties: data.specialties,
            bio: data.bio,
            qualifications: data.qualifications,
            years_experience: data.years_experience,
            languages: data.languages,
            hourly_rate: data.hourly_rate,
            availability: data.availability,
            session_type: data.session_type,
            calendar_integration: data.calendar_integration || false,

            // STORE DOCUMENTS IN PROPER NESTED STRUCTURE
            documents: {
                government_id: governmentID?.url,
                profile_picture: profilePicture?.url,
                qualification_certificates: qualificationCert?.url,
                licence: licenceDoc?.url,
                experince_letter: experienceLetter?.url || null,
                additional_documents: additionalDocs?.url || null,
            },
        });

        return res.status(201).json({
            msg: "Counsellor registered successfully",
            user,
            profile,
        });


    } catch (error) {
        console.log(error)
    }
}

export const CounsellorLogin = async (req, res) => {
    try {
        const data = CounsellorLoginValiation.parse(req.body);

        const userExisted = await User.findOne({ email: data.email });
        const counsellor = await Counsellor.findOne({ email: data.email })

        if (!userExisted) {
            return res.status(404).json({ msg: "user not found" })
        }

        if (userExisted.role != "counsellor") {
            return res.status(402).json({ msg: "only counsellor can login" })
        }

        if (!counsellor.Admin_approved) {
            return res.status(403).json({ msg: "Your profile is not approved by admin yet after approved you can login" });
        }

        const user = await userExisted.comparePassword(data.Password);

        if (!user) {
            return res.status(400).json({ msg: "email or password maybe not correct" })
        }
        const token = userExisted.generateAuthToken();

        // cookie option
        const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            // secure: false, // Set to true if using HTTPS
        };

        if (user) {
            res
                .status(200)
                .cookie("authToken", token, option)
                .json({
                    message: "Login successful",
                    token,
                    user: {
                        id: userExisted._id,
                        fullname: userExisted.fullname,
                        email: userExisted.email,
                        role: userExisted.role
                    }
                });
        } else {
            res.status(401).json({ message: "Invalid email or password." });
        }

    } catch (error) {
        console.log(error)
    }
}

export const getallCounsellor = async (req, res) => {
    try {
        const counsellor = await Counsellor.find().select("-documents -history -Admin_approved")

        if (!counsellor) {
            return res.status(400).json({ msg: "counsellor not found" })
        }

        return res.status(200).json({ msg: "all counsellor fetch ", counsellor })

    } catch (error) {

    }
}

export const getCounsellorByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(404).json({ msg: " email is requied" })
        }

        const counsellor = await Counsellor.findOne({ email: email });

        if (!counsellor) {
            return res.status(404).json({ msg: "counsellor not found" })
        }

        return res.status(200).json({ msg: "counsellor is found", counsellor })
    } catch (error) {
        console.log(error)
    }
}
