import { Request } from "express";
import { getAuthContext } from "../../middleware/auth.js";
import { User } from "../../types/index.js";
import { getUserByClerkId } from "./userQueries.js";

export const getCurrentAppUser = async (req: Request): Promise<User | null> => {
  const auth = getAuthContext(req);

  return getUserByClerkId(auth.userId);
};
