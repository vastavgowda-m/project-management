import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { LayoutDashboard } from "lucide-react"

export default async function SignupPage() {
  const user = await getCurrentUser()
  
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-semibold">TaskFlow</span>
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-1">Get started with TaskFlow</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <AuthForm mode="signup" />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
