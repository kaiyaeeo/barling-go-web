    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { Loader2 } from "lucide-react"

    const ROLES = ["user", "admin", "super_admin"]

    export default function UserRoleManager({
    userId, currentRole, isActive,
    }: { userId: string; currentRole: string; isActive: boolean }) {
    const router = useRouter()
    const [role, setRole] = useState(currentRole)
    const [active, setActive] = useState(isActive)
    const [loading, setLoading] = useState(false)

    async function handleUpdate(newRole?: string, newActive?: boolean) {
        setLoading(true)
        const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            role: newRole ?? role,
            is_active: newActive ?? active,
        }),
        })
        setLoading(false)
        if (res.ok) router.refresh()
    }

    return (
        <div className="flex items-center gap-2">
        <select
            value={role}
            onChange={(e) => { setRole(e.target.value); handleUpdate(e.target.value) }}
            disabled={loading}
            className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#6EB8BB] cursor-pointer"
        >
            {ROLES.map((r) => (
            <option key={r} value={r}>{r.replace("_", " ")}</option>
            ))}
        </select>
        <button
            onClick={() => { setActive(!active); handleUpdate(undefined, !active) }}
            disabled={loading}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
            active
                ? "bg-red-50 text-red-500 hover:bg-red-100"
                : "bg-green-50 text-green-600 hover:bg-green-100"
            }`}
        >
            {loading ? <Loader2 size={11} className="animate-spin" /> : active ? "Nonaktifkan" : "Aktifkan"}
        </button>
        </div>
    )
    }
