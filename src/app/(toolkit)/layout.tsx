'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bot, Code, FileText, Menu } from 'lucide-react';
import { AnimatedBackground } from '@/components/shared/animated-background';

const navItems = [
  { href: '/resume', label: 'Resume Tool', icon: FileText },
  { href: '/compiler', label: 'Compiler', icon: Code },
];

export default function ToolkitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getLinkClassName = (href: string) => {
    const isActive = pathname === href;
    return cn(
      "flex h-9 w-full items-center justify-start gap-2 rounded-md px-2 text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 [&>span]:group-data-[collapsible=icon]:hidden",
      isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
    );
  };
  
  return (
    <>
      <AnimatedBackground />
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="p-2">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2 [&>span]:group-data-[collapsible=icon]:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Bot className="h-5 w-5 text-primary"/>
                </Button>
                <span className="font-headline text-lg font-semibold">StudentKit</span>
              </div>
              <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="p-2">
              {navItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                   <Link href={href} className={getLinkClassName(href)}>
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="bg-transparent md:bg-card/50 md:backdrop-blur-sm">
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-card/50 px-4 backdrop-blur-sm md:hidden">
                <div className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    <span className="font-headline text-lg font-semibold">StudentKit</span>
                </div>
                <SidebarTrigger>
                    <Button variant="ghost" size="icon">
                        <Menu/>
                    </Button>
                </SidebarTrigger>
            </header>
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                {children}
            </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
