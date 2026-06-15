    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import SuperAdminSidebar from "@/components/super-admin/SuperAdminSidebar"

    export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "super_admin") redirect("/dashboard")

    return (
        <div className="flex min-h-screen bg-gray-50">
        <SuperAdminSidebar />
        <div className="flex-1 ml-56 transition-all duration-200">
            {children}
        </div>
        </div>
    )
    }
