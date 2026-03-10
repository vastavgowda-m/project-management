"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderKanban,
  Plus,
  LogOut,
  Settings,
} from "lucide-react"

interface Project {
  _id: string
  name: string
  color: string
}

interface SidebarProps {
  projects: Project[]
  userName: string
}

export function Sidebar({ projects, userName }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen border-r border-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sidebar-foreground flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-sidebar" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">TaskFlow</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          <NavLink
            href="/dashboard"
            icon={<LayoutDashboard className="h-4 w-4" />}
            active={pathname === "/dashboard"}
          >
            Dashboard
          </NavLink>
        </div>

        {/* Projects */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
              Projects
            </span>
            <Link href="/projects/new">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-sidebar-foreground/60 hover:text-sidebar-foreground"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-1">
            {projects.map((project) => (
              <NavLink
                key={project._id}
                href={`/projects/${project._id}`}
                icon={
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: project.color }}
                  />
                }
                active={pathname === `/projects/${project._id}`}
              >
                {project.name}
              </NavLink>
            ))}
            {projects.length === 0 && (
              <p className="px-3 py-2 text-sm text-sidebar-foreground/50">
                No projects yet
              </p>
            )}
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-accent-foreground">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {userName}
            </p>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  )
}

function NavLink({
  href,
  icon,
  active,
  children,
}: {
  href: string
  icon: React.ReactNode
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </Link>
  )
}
