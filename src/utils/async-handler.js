import { ApiError } from "./ApiError.js";

export function asyncHandler(fn) {
  return async function (req, res, next) {
    try {
      const result = await fn(req, res, next);
      return result;
    } catch (error) {
      console.log("//========= [ERROR] ========//\n", error);
      return res
        .status(500)
        .json(new ApiError(500, "Internal Server Error", error, null));
    }
  };
}
