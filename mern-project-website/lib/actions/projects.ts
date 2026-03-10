"use server"

import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { Project } from "@/lib/types"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

function toObjectId(id: string | ObjectId): ObjectId {
  if (id instanceof ObjectId) return id
  if (typeof id === "object" && id !== null && "_id" in id) {
    return new ObjectId(String((id as { _id: unknown })._id))
  }
  const idStr = String(id)
  if (!ObjectId.isValid(idStr) || idStr.length !== 24) {
    throw new Error(`Invalid ObjectId: ${idStr}`)
  }
  return new ObjectId(idStr)
}

export async function createProject(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const color = formData.get("color") as string

  if (!name) {
    return { error: "Project name is required" }
  }

  const db = await getDatabase()
  await db.collection<Project>("projects").insertOne({
    userId: user._id!,
    name,
    description: description || "",
    color: color || "#6366f1",
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateProject(projectId: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const color = formData.get("color") as string

  if (!name) {
    return { error: "Project name is required" }
  }

  const db = await getDatabase()
  const projectObjId = toObjectId(projectId)
  
  await db.collection<Project>("projects").updateOne(
    { _id: projectObjId, userId: user._id! },
    {
      $set: {
        name,
        description: description || "",
        color: color || "#6366f1",
        updatedAt: new Date(),
      },
    }
  )

  revalidatePath("/dashboard")
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function deleteProject(projectId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const db = await getDatabase()
  const projectObjId = toObjectId(projectId)
  
  // Delete project and all its tasks
  await db.collection("tasks").deleteMany({ projectId: projectObjId })
  await db.collection<Project>("projects").deleteOne({
    _id: projectObjId,
    userId: user._id!,
  })

  revalidatePath("/dashboard")
  return { success: true }
}

export async function getProjects() {
  const user = await getCurrentUser()
  if (!user) return []

  const db = await getDatabase()
  const projects = await db
    .collection<Project>("projects")
    .find({ userId: user._id! })
    .sort({ createdAt: -1 })
    .toArray()

  return projects.map((p) => ({
    ...p,
    _id: p._id!.toString(),
    userId: p.userId.toString(),
  }))
}

export async function getProject(projectId: string) {
  const user = await getCurrentUser()
  if (!user) return null

  const db = await getDatabase()
  const projectObjId = toObjectId(projectId)
  
  const project = await db.collection<Project>("projects").findOne({
    _id: projectObjId,
    userId: user._id!,
  })

  if (!project) return null

  return {
    ...project,
    _id: project._id!.toString(),
    userId: project.userId.toString(),
  }
}
