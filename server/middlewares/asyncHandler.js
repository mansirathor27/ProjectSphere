const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      return await fn(req, res, next);
    } catch (error) {
      // Express provides `next`, but guard anyway so we never crash with
      // "next is not a function" (e.g., when a handler is invoked incorrectly).
      if (typeof next === "function") return next(error);

      return res?.status?.(500)?.json?.({
        success: false,
        message: error?.message || "Internal Server Error",
      });
    }
  };
};

export default asyncHandler;