
import Header from '@/components/header';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';

export default function LanguageLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: {
    lng: string;
  }
}>) {
  const { lng } = params;
  return (
        <SidebarProvider>
            <Sidebar>
                <AppSidebar lng={lng}/>
            </Sidebar>
            <SidebarInset>
                <div className="flex flex-col w-full h-screen">
                <Header lng={lng} />
                <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
                </div>
            </SidebarInset>
            <div className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t'>
              <AppSidebar lng={lng}/>
            </div>
        </SidebarProvider>
  );
}
