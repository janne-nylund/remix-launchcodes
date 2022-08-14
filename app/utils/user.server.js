import bcrypt from "bcryptjs";
import { prisma } from "./prisma.server";

export const createUser = async (user) => {
  const passwordHash = await bcrypt.hash(user.password, 10);
  const newUser = await prisma.user.create({
    data: {
      username: user.username,
      passwordHash: passwordHash,
      email: user.email      
    },
  });
  return { id: newUser.id, email: user.email };
};