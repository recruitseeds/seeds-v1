import { DashboardHeader } from '@/components/dashboard-header'
import { SidebarInset, SidebarProvider } from '@seeds/ui/sidebar'
import { AppSidebar } from './components/left-sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
