"use server"

import { getDatabase } from "@/lib/mongodb"
import { hashPassword, verifyPassword, createSession, deleteSession } from "@/lib/auth"
import { User } from "@/lib/types"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "All fields are required" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  const db = await getDatabase()
  const existingUser = await db.collection<User>("users").findOne({ email: email.toLowerCase() })

  if (existingUser) {
    return { error: "Email already exists" }
  }

  const hashedPassword = await hashPassword(password)

  const result = await db.collection<User>("users").insertOne({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    createdAt: new Date(),
  })

  await createSession(result.insertedId)
  redirect("/dashboard")
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "All fields are required" }
  }

  const db = await getDatabase()
  const user = await db.collection<User>("users").findOne({ email: email.toLowerCase() })

  if (!user) {
    return { error: "Invalid email or password" }
  }

  const isValid = await verifyPassword(password, user.password)

  if (!isValid) {
    return { error: "Invalid email or password" }
  }

  await createSession(user._id!)
  redirect("/dashboard")
}

export async function signOut() {
  await deleteSession()
  redirect("/")
}
