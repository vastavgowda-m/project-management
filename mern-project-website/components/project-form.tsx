"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProject, updateProject, deleteProject } from "@/lib/actions/projects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PROJECT_COLORS } from "@/lib/types"
import { Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectFormProps {
  project?: {
    _id: string
    name: string
    description: string
    color: string
  }
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter()
  const [selectedColor, setSelectedColor] = useState(project?.color || PROJECT_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!project

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    formData.set("color", selectedColor)

    const result = isEditing
      ? await updateProject(project._id, formData)
      : await createProject(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  async function handleDelete() {
    if (!project || !confirm("Are you sure you want to delete this project? All tasks will be deleted.")) {
      return
    }

    setDeleting(true)
    await deleteProject(project._id)
    router.push("/dashboard")
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="My Project"
          defaultValue={project?.name}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What's this project about?"
          defaultValue={project?.description}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {PROJECT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={cn(
                "h-8 w-8 rounded-lg transition-all",
                selectedColor === color
                  ? "ring-2 ring-offset-2 ring-foreground"
                  : "hover:scale-110"
              )}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Project"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading || deleting}
        >
          Cancel
        </Button>
        {isEditing && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="ml-auto"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </form>
  )
}
