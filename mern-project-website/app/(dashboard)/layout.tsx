import React from "react"
import { getCurrentUser } from "@/lib/auth"
import { getProjects } from "@/lib/actions/projects"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const projects = await getProjects()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar projects={projects} userName={user.name} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
