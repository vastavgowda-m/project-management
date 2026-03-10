import { getDatabase } from "./mongodb"
import { User, Session } from "./types"
import { ObjectId } from "mongodb"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

const SESSION_COOKIE_NAME = "session_token"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex")
}

export async function createSession(userId: ObjectId): Promise<string> {
  const db = await getDatabase()
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await db.collection<Session>("sessions").insertOne({
    userId,
    token,
    expiresAt,
    createdAt: new Date(),
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return token
}

export async function getSession(): Promise<{ user: User; session: Session } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) return null

  const db = await getDatabase()
  const session = await db.collection<Session>("sessions").findOne({
    token,
    expiresAt: { $gt: new Date() },
  })

  if (!session) return null

  const user = await db.collection<User>("users").findOne({ _id: session.userId })
  if (!user) return null

  return { user, session }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    const db = await getDatabase()
    await db.collection<Session>("sessions").deleteOne({ token })
    cookieStore.delete(SESSION_COOKIE_NAME)
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const result = await getSession()
  return result?.user ?? null
}
