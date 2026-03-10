import React from "react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, LayoutDashboard, ListTodo, Users } from "lucide-react"

export default async function HomePage() {
  const user = await getCurrentUser()
  
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-semibold">TaskFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight text-foreground mb-6 text-balance">
            Manage Your Projects with Clarity
          </h1>
          <p className="text-xl text-muted-foreground mb-10 text-pretty">
            A minimal, focused project management tool. Create projects, organize tasks 
            with kanban boards, and track progress effortlessly.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base">
                Start Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<LayoutDashboard className="h-6 w-6" />}
            title="Kanban Boards"
            description="Visualize your workflow with drag-and-drop kanban boards. Move tasks through stages seamlessly."
          />
          <FeatureCard
            icon={<ListTodo className="h-6 w-6" />}
            title="Task Management"
            description="Create tasks with priorities, due dates, and descriptions. Stay organized and never miss a deadline."
          />
          <FeatureCard
            icon={<CheckCircle2 className="h-6 w-6" />}
            title="Progress Tracking"
            description="Monitor project progress at a glance. See completed tasks and what's remaining instantly."
          />
        </div>

        {/* Preview */}
        <div className="mt-24 rounded-xl border border-border bg-card p-2 shadow-sm">
          <div className="rounded-lg bg-muted/50 aspect-video flex items-center justify-center">
            <div className="text-center">
              <LayoutDashboard className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Your workspace awaits</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-muted-foreground text-sm">
          Built with Next.js and MongoDB
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
