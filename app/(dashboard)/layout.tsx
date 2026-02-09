import Sidebar from '@/components/sidebar/Sidebar';
import TopBar from '@/components/topbar/TopBar';
import { SidebarProvider, useSidebar } from '@/components/sidebar/SidebarContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-[#f4f6f9] dark:bg-[#1a1a1a] flex font-sans">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-[240px]'} flex flex-col min-h-screen`}>
                <TopBar />
                <main className="flex-1 p-6 relative">
                    {children}
                </main>

                {/* Footer */}
                <footer className="p-4 text-xs text-[#6c757d] border-t border-black/5 ml-4">
                    Nearby Application SAS - 2026 - Contact us
                </footer>
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <DashboardContent>
                {children}
            </DashboardContent>
        </SidebarProvider>
    );
}
