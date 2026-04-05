import asyncHandler from "../middlewares/asyncHandler.js";
import { User } from "../models/user.js";
import { Project } from "../models/project.js";

export const globalSearch = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return res.status(200).json({
      success: true,
      data: { users: [], projects: [] }
    });
  }

  const searchRegex = new RegExp(q, "i");

  const [users, projects] = await Promise.all([
    User.find({
      $or: [
        { name: searchRegex },
        { department: searchRegex },
        { expertise: searchRegex },
        { experties: searchRegex }
      ]
    }).select("name role department expertise experties"),
    
    Project.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex }
      ]
    }).populate("student supervisor", "name email")
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      projects
    }
  });
});
