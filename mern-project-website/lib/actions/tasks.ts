"use server"

import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { Task, TaskStatus } from "@/lib/types"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

function toObjectId(id: string | ObjectId): ObjectId {
  if (id instanceof ObjectId) return id
  if (typeof id === "object" && id !== null && "_id" in id) {
    return new ObjectId(String((id as { _id: unknown })._id))
  }
  // Validate it's a proper 24-char hex string
  const idStr = String(id)
  if (!ObjectId.isValid(idStr) || idStr.length !== 24) {
    throw new Error(`Invalid ObjectId: ${idStr}`)
  }
  return new ObjectId(idStr)
}

export async function createTask(projectId: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const priority = (formData.get("priority") as Task["priority"]) || "medium"
  const status = (formData.get("status") as TaskStatus) || "todo"
  const dueDate = formData.get("dueDate") as string

  if (!title) {
    return { error: "Task title is required" }
  }

  const db = await getDatabase()
  const projectObjId = toObjectId(projectId)
  
  // Get the max order for the status column
  const maxOrderTask = await db
    .collection<Task>("tasks")
    .findOne(
      { projectId: projectObjId, status },
      { sort: { order: -1 } }
    )
  
  const order = maxOrderTask ? maxOrderTask.order + 1 : 0

  const result = await db.collection<Task>("tasks").insertOne({
    projectId: projectObjId,
    userId: user._id!,
    title,
    description: description || "",
    status,
    priority,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    order,
  })

  revalidatePath(`/projects/${projectId}`)
  return { 
    success: true,
    task: {
      _id: result.insertedId.toString(),
      projectId: projectId,
      userId: user._id!.toString(),
      title,
      description: description || "",
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      order,
    }
  }
}

export async function updateTask(taskId: string, projectId: string, data: Partial<Task>) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const db = await getDatabase()
  const taskObjId = toObjectId(taskId)
  
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: new Date(),
  }
  
  // Remove _id if present
  delete updateData._id
  delete updateData.projectId
  delete updateData.userId

  await db.collection<Task>("tasks").updateOne(
    { _id: taskObjId, userId: user._id! },
    { $set: updateData }
  )

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function updateTaskStatus(
  taskId: string,
  projectId: string,
  newStatus: TaskStatus,
  newOrder: number
) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const db = await getDatabase()
  const taskObjId = toObjectId(taskId)

  await db.collection<Task>("tasks").updateOne(
    { _id: taskObjId, userId: user._id! },
    {
      $set: {
        status: newStatus,
        order: newOrder,
        updatedAt: new Date(),
      },
    }
  )

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function deleteTask(taskId: string, projectId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: "Unauthorized" }

  const db = await getDatabase()
  const taskObjId = toObjectId(taskId)
  
  await db.collection<Task>("tasks").deleteOne({
    _id: taskObjId,
    userId: user._id!,
  })

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function getTasks(projectId: string) {
  const user = await getCurrentUser()
  if (!user) return []

  const db = await getDatabase()
  const projectObjId = toObjectId(projectId)
  
  const tasks = await db
    .collection<Task>("tasks")
    .find({ projectId: projectObjId, userId: user._id! })
    .sort({ order: 1, createdAt: -1 })
    .toArray()

  return tasks.map((t) => ({
    ...t,
    _id: t._id!.toString(),
    projectId: t.projectId.toString(),
    userId: t.userId.toString(),
  }))
}

export async function getAllTasks() {
  const user = await getCurrentUser()
  if (!user) return []

  const db = await getDatabase()
  const tasks = await db
    .collection<Task>("tasks")
    .find({ userId: user._id! })
    .sort({ createdAt: -1 })
    .toArray()

  return tasks.map((t) => ({
    ...t,
    _id: t._id!.toString(),
    projectId: t.projectId.toString(),
    userId: t.userId.toString(),
  }))
}
