"use client"

import React from "react"

import { useState, useTransition } from "react"
import { TASK_STATUSES, TASK_PRIORITIES, TaskStatus, TaskPriority } from "@/lib/types"
import { updateTaskStatus, deleteTask } from "@/lib/actions/tasks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Calendar, Trash2, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskDialog } from "./task-dialog"

interface Task {
  _id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: Date
  order: number
}

interface KanbanBoardProps {
  projectId: string
  initialTasks: Task[]
}

export function KanbanBoard({ projectId, initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [addToColumn, setAddToColumn] = useState<TaskStatus>("todo")

  function handleDragStart(task: Task) {
    setDraggedTask(task)
  }

  function handleDragOver(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault()
    setDragOverColumn(status)
  }

  function handleDragLeave() {
    setDragOverColumn(null)
  }

  function handleDrop(newStatus: TaskStatus) {
    if (!draggedTask) return

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t._id === draggedTask._id ? { ...t, status: newStatus } : t
      )
    )

    setDraggedTask(null)
    setDragOverColumn(null)

    // Server update
    startTransition(async () => {
      const columnTasks = tasks.filter(
        (t) => t.status === newStatus && t._id !== draggedTask._id
      )
      const newOrder = columnTasks.length

      await updateTaskStatus(
        draggedTask._id,
        projectId,
        newStatus,
        newOrder
      )
    })
  }

  function handleDragEnd() {
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  function handleAddTask(status: TaskStatus) {
    setAddToColumn(status)
    setEditingTask(null)
    setIsDialogOpen(true)
  }

  function handleEditTask(task: Task) {
    setEditingTask(task)
    setIsDialogOpen(true)
  }

  async function handleDeleteTask(task: Task) {
    if (!confirm("Are you sure you want to delete this task?")) return

    // Optimistic update
    setTasks((prev) => prev.filter((t) => t._id !== task._id))

    await deleteTask(task._id, projectId)
  }

  function handleTaskCreated(newTask: Task) {
    setTasks((prev) => [...prev, newTask])
  }

  function handleTaskUpdated(updatedTask: Task) {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    )
  }

  return (
    <>
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {TASK_STATUSES.map((column) => {
          const columnTasks = tasks
            .filter((t) => t.status === column.value)
            .sort((a, b) => a.order - b.order)

          return (
            <div
              key={column.value}
              className="flex-1 min-w-[280px] max-w-[350px]"
              onDragOver={(e) => handleDragOver(e, column.value)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(column.value)}
            >
              <div
                className={cn(
                  "h-full rounded-xl border bg-card p-3 transition-colors",
                  dragOverColumn === column.value && "border-primary bg-accent/50"
                )}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{column.label}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {columnTasks.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleAddTask(column.value)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 min-h-[200px]">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onDragStart={() => handleDragStart(task)}
                      onDragEnd={handleDragEnd}
                      onEdit={() => handleEditTask(task)}
                      onDelete={() => handleDeleteTask(task)}
                      isDragging={draggedTask?._id === task._id}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={projectId}
        task={editingTask}
        defaultStatus={addToColumn}
        onTaskCreated={handleTaskCreated}
        onTaskUpdated={handleTaskUpdated}
      />
    </>
  )
}

function TaskCard({
  task,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  isDragging,
}: {
  task: Task
  onDragStart: () => void
  onDragEnd: () => void
  onEdit: () => void
  onDelete: () => void
  isDragging: boolean
}) {
  const priorityConfig = TASK_PRIORITIES.find((p) => p.value === task.priority)

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done"

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all",
        isDragging && "opacity-50 scale-95"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("px-2 py-0.5 rounded text-xs font-medium", priorityConfig?.color)}>
            {priorityConfig?.label}
          </span>

          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
