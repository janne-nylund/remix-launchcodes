import { redirect, json, createCookieSessionStorage } from "@remix-run/node";
import { prisma } from "./prisma.server";
import { createUser } from "./user.server";
import bcrypt from "bcryptjs";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "kudos-session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function register(user) {
  const exists = await prisma.user.count({ where: { username: user.username } });
  if (exists) {
    return json(
      { error: `User already exists with that username`, fields: {formType: 'register'} },
      { status: 400 }
    );
  }

  const newUser = await createUser(user);
  if (!newUser) {
    return json(
      {
        error: `Something went wrong trying to create a new user.`,
        fields: { username: user.username, password: user.password, email: user.email},
      },
      { status: 400 }
    );
  }
  return {sent: true}
  //return createUserSession(newUser.id, "/login");
}

// Validate the user on email & password
export async function login({ username, password }) {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return json({ error: `Incorrect login` }, { status: 400 });

  return createUserSession(user.id, "/secret");
}

export async function createUserSession(userId, redirectTo) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function requireUserId(
  request,
  redirectTo = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

function getUserSession(request) {
  return storage.getSession(request.headers.get("Cookie"));
}

async function getUserId(request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function getUser(request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, usernames: true },
    });
    return user;
  } catch {
    throw logout(request);
  }
}

export async function logout(request) {
  const session = await getUserSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}