import { notFound } from "next/navigation"
import Link from "next/link"
import { getProject } from "@/lib/actions/projects"
import { getTasks } from "@/lib/actions/tasks"
import { Button } from "@/components/ui/button"
import { KanbanBoard } from "@/components/kanban-board"
import { Settings, ArrowLeft } from "lucide-react"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const [project, tasks] = await Promise.all([getProject(id), getTasks(id)])

  if (!project) {
    notFound()
  }

  const completedCount = tasks.filter((t) => t.status === "done").length
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-background">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-xl font-bold">{project.name}</h1>
          </div>
          <Link href={`/projects/${id}/settings`}>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        {project.description && (
          <p className="text-muted-foreground text-sm mb-4 max-w-2xl">
            {project.description}
          </p>
        )}

        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <div className="w-32 h-2 bg-secondary rounded-full">
              <div
                className="h-full bg-foreground rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {completedCount} of {tasks.length} tasks completed
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-6 overflow-hidden">
        <KanbanBoard
          projectId={id}
          initialTasks={tasks.map((t) => ({
            ...t,
            dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          }))}
        />
      </div>
    </div>
  )
}
