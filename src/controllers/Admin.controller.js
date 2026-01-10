import { User } from "../models/User.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/async-handler.js";
import { UpdateUserStatusValidation } from "../validator/User.validation.js";

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search,

    role,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { fullname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    query.role = role;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalUsers = await User.countDocuments(query);

  const totalPages = Math.ceil(totalUsers / parseInt(limit));

  if (!users)
    return res
      .status(404)
      .json(new ApiError(404, "No users found", null, null));

  return res.status(200).json(
    new ApiResponse(200, {
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    })
  );
});

export const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user)
    return res.status(404).json(new ApiError(404, "User not found", null, null));

  return res.status(200).json(new ApiResponse(200, user, "User found"));
});

export const updateUserStatusById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = UpdateUserStatusValidation.parse(req.body);
  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }
  console.log(status);
  console.log(user.status);
  if (user.status === status) {
    return res.status(200).json(new ApiResponse(200, user, "Status is already " + status));
  }
  user.status = status;
  await user.save(); // 'user' is the updated document
  return res.status(200).json(new ApiResponse(200, user, "User updated"));
})