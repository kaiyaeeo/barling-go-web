    import AdminSidebar from "@/components/layout/AdminSidebar"
    import Script from "next/script" // 1. Import komponen Script dari Next.js

    export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        {/* Main content — offset sesuai sidebar width (w-56 = 224px, collapsed = 64px) */}
        <div className="flex-1 ml-56 transition-all duration-200">
            {children}
        </div>

        {/* 2. Sisipkan Script Midtrans di dalam elemen terluar */}
        <Script
            src="https://app.sandbox.midtrans.com/snap/snap.js"
            data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
            strategy="lazyOnload" // Memuat script dengan aman di background
        />
        </div>
    )
    }