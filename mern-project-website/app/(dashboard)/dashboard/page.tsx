import React from "react"
import Link from "next/link"
import { getProjects } from "@/lib/actions/projects"
import { getAllTasks } from "@/lib/actions/tasks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Plus,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react"

export default async function DashboardPage() {
  const [projects, tasks] = await Promise.all([getProjects(), getAllTasks()])

  const stats = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === "done").length,
    inProgressTasks: tasks.filter((t) => t.status === "in-progress").length,
    overdueTasks: tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
    ).length,
  }

  const recentTasks = tasks.slice(0, 5)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s an overview of your projects.
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<FolderKanban className="h-4 w-4" />}
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks}
          icon={<CheckCircle2 className="h-4 w-4" />}
          subtitle={`of ${stats.totalTasks} total`}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressTasks}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Overdue"
          value={stats.overdueTasks}
          icon={<AlertCircle className="h-4 w-4" />}
          highlight={stats.overdueTasks > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Your Projects</CardTitle>
            <Link href="/projects/new">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No projects yet</p>
                <Link href="/projects/new">
                  <Button variant="outline" size="sm">
                    Create your first project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => {
                  const projectTasks = tasks.filter(
                    (t) => t.projectId === project._id
                  )
                  const completedCount = projectTasks.filter(
                    (t) => t.status === "done"
                  ).length
                  const progress =
                    projectTasks.length > 0
                      ? Math.round((completedCount / projectTasks.length) * 100)
                      : 0

                  return (
                    <Link
                      key={project._id}
                      href={`/projects/${project._id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div
                        className="h-3 w-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {projectTasks.length} tasks
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{progress}%</span>
                        <div className="w-16 h-1.5 bg-secondary rounded-full mt-1">
                          <div
                            className="h-full bg-foreground rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No tasks yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((task) => {
                  const project = projects.find(
                    (p) => p._id === task.projectId
                  )
                  return (
                    <Link
                      key={task._id}
                      href={`/projects/${task.projectId}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          task.status === "done"
                            ? "bg-green-500"
                            : task.status === "in-progress"
                            ? "bg-blue-500"
                            : "bg-muted-foreground"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate ${
                            task.status === "done"
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {project?.name}
                        </p>
                      </div>
                      <StatusBadge status={task.status} />
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  subtitle,
  highlight,
}: {
  title: string
  value: number
  icon: React.ReactNode
  subtitle?: string
  highlight?: boolean
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                highlight ? "text-destructive" : ""
              }`}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center ${
              highlight
                ? "bg-destructive/10 text-destructive"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    todo: "bg-secondary text-secondary-foreground",
    "in-progress": "bg-blue-100 text-blue-700",
    review: "bg-amber-100 text-amber-700",
    done: "bg-green-100 text-green-700",
  }

  const labels: Record<string, string> = {
    todo: "To Do",
    "in-progress": "In Progress",
    review: "Review",
    done: "Done",
  }

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
