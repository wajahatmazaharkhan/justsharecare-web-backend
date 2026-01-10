import { User } from "../models/User.models.js";
import { Counsellor } from "../models/Counsellor.models.js";
import { ImagekitFileUploader } from "../services/imagekit.services.js";
import {
  CounsellorLoginValiation,
  CounsellorValidation,
} from "../validator/Counsellor.validation.js";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const CounsellorSignup = asyncHandler(async (req, res) => {
  const data = CounsellorValidation.parse(req.body);

  // Check if email exists
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    return res
      .status(400)
      .json(
        new ApiError(400, "Account already exists with this Email address!")
      );
  }

  const user = await User.create({
    fullname: data.fullname,
    email: data.email,
    Password: data.Password,
    phone_number: data.contact_number,
    dob: data.dob,
    gender: data.gender,
    preferred_language: data.languages,
    timezone: data.timezone,
    role: "counsellor",
  });

  /* ---------------------------------------------------------
       HANDLE FILES UPLOAD VIA MULTER
    --------------------------------------------------------- */
  const f = req.files;

  console.log("BODY:", req.body);
  console.log("FILES:", req.files);

  const uploadIfExists = async (file) => {
    return file
      ? await ImagekitFileUploader(file.path, file.originalname)
      : null;
  };

  const governmentID = await uploadIfExists(f?.government_id?.[0]);
  const profilePicture = await uploadIfExists(f?.profile_picture?.[0]);
  const qualificationCert = await uploadIfExists(
    f?.qualification_certificates?.[0]
  );
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
    // qualifications: data.qualifications,
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
      qualification_certificates: qualificationCert?.url || null,
      licence: licenceDoc?.url,
      experince_letter: experienceLetter?.url || null,
      additional_documents: additionalDocs?.url || null,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(200, null, "Counsellor Registration Successful"));
});

export const CounsellorLogin = asyncHandler(async (req, res) => {
  const data = CounsellorLoginValiation.parse(req.body);

  const userExisted = await User.findOne({ email: data.email });
  const counsellor = await Counsellor.findOne({ email: data.email });

  if (!userExisted) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  if (userExisted.role != "counsellor") {
    return res
      .status(402)
      .json(new ApiError(402, "Only counsellors can login"));
  }

  if (!counsellor.Admin_approved) {
    return res
      .status(403)
      .json(
        new ApiError(
          403,
          "Your profile is not approved by admin yet after approved you can login"
        )
      );
  }

  const user = await userExisted.comparePassword(data.Password);

  if (!user) {
    return res
      .status(400)
      .json(new ApiError(400, "email or password maybe not correct"));
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
      .json(
        new ApiResponse(
          200,
          {
            token,
            user: {
              id: userExisted._id,
              fullname: userExisted.fullname,
              email: userExisted.email,
              role: userExisted.role,
            },
          },
          "Login Successful"
        )
      );
  } else {
    res.status(401).json(new ApiError(401, "Invalid email or password."));
  }
});

export const getallCounsellor = asyncHandler(async (req, res) => {
  const counsellor = await Counsellor.find().select(
    "-documents -history -Admin_approved"
  );

  if (!counsellor) {
    return res.status(400).json(new ApiError(400, "counsellor not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, counsellor, "All counsellors fetched"));
});

export const getRandomCounsellors = asyncHandler(async (req, res) => {
  const counsellors = await Counsellor.aggregate([
    {
      $sample: { size: 3 },
    },
    {
      $project: {
        history: 0,
        Admin_approved: 0,
      },
    },
  ]);

  if (!counsellors.length) {
    return res.status(404).json(new ApiError(404, "No counsellors found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, counsellors, "Random counsellors fetched"));
});

export const getCounsellorByEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(404).json(new ApiError(404, "email is required"));
  }

  const counsellor = await Counsellor.findOne({ email: email });

  if (!counsellor) {
    return res.status(404).json(new ApiError(404, "counsellor not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, counsellor, "counsellor found"));
});

export const updateCounsellor = asyncHandler(async (req, res) => {
  const userId = req.user._id; // from JWT middleware

  // find counsellor profile
  const counsellor = await Counsellor.findOne({ user_id: userId });
  if (!counsellor) {
    return res
      .status(404)
      .json(new ApiError(404, "Counsellor profile not found"));
  }

  // find user profile
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  const data = req.body;
  const f = req.files;

  console.log("BODY:", req.body);
  console.log("government_id:", req.body.government_id);

  const uploadIfExists = async (file) => {
    return file
      ? await ImagekitFileUploader(file.path, file.originalname)
      : null;
  };

  const governmentID = await uploadIfExists(f?.government_id?.[0]);
  const profilePicture = await uploadIfExists(f?.profile_picture?.[0]);
  const qualificationCert = await uploadIfExists(
    f?.qualification_certificates?.[0]
  );
  const licenceDoc = await uploadIfExists(f?.licence?.[0]);
  const experienceLetter = await uploadIfExists(f?.experince_letter?.[0]);
  const additionalDocs = await uploadIfExists(f?.additional_documents?.[0]);

  // Update fields in Counsellor schema
  Object.keys(data).forEach((key) => {
    counsellor[key] = data[key];
  });

  // Update files in Counsellor schema
  if (governmentID) counsellor.documents.government_id = governmentID.url;
  if (profilePicture) counsellor.documents.profile_picture = profilePicture.url;
  if (qualificationCert)
    counsellor.documents.qualification_certificates = qualificationCert.url;
  if (licenceDoc) counsellor.documents.licence = licenceDoc.url;
  if (experienceLetter)
    counsellor.documents.experince_letter = experienceLetter.url;
  if (additionalDocs)
    counsellor.documents.additional_documents = additionalDocs.url;

  // Update shared fields in User schema
  const sharedFields = ["fullname", "email", "phone_number", "dob", "gender"];
  sharedFields.forEach((field) => {
    if (data[field] !== undefined) {
      user[field] = data[field];
    }
  });

  await counsellor.save();
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        counsellor,
        user,
      },
      "Profile updated successfully"
    )
  );
});

export const getCounsellorBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({ msg: "slug not found" });
  }

  const counsellors = await Counsellor.find({ slug }).select(
    "fullname email counselling_type documents.profile_picture"
  );

  if (!counsellors) {
    return res.status(400).json({ msg: "counsellors not found" });
  }

  return res.status(200).json({ msg: "counsellor found", counsellors });
});
