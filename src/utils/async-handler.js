export function asyncHandler(fn) {
  return async function (req, res, next) {
    try {
      const result = await fn(req, res, next);
      return result;
    } catch (error) {
      console.log("//========= [ERROR] ========//\n", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
}
