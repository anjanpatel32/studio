'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { Bot, Code, Menu, LogOut, User, Settings, LayoutDashboard, Timer, Notebook, Sun, Moon } from 'lucide-react';
import { AnimatedBackground } from '@/components/shared/animated-background';
import { getAuth, onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import React from 'react';
import withAuth from '@/components/shared/with-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/compiler', label: 'Compiler', icon: Code },
  { href: '/notes', label: 'Notes', icon: Notebook },
  { href: '/pomodoro', label: 'Pomodoro', icon: Timer },
];

function ToolkitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const auth = getAuth(app);
  
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Signed Out',
        description: 'You have successfully signed out.',
      });
      router.push('/login');
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'An error occurred while signing out.',
      });
    }
  };


  const getLinkClassName = (href: string) => {
    const isActive = pathname.startsWith(href);
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
           <SidebarFooter className="p-2">
              {user && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className="w-full justify-start gap-2 px-2 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                          <User className="h-4 w-4 shrink-0" />
                          <span className="truncate group-data-[collapsible=icon]:hidden">{user.email}</span>
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                         <Link href="/profile">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                       <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                          <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                          <span>Toggle theme</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                              Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                              Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>
                              System
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              )}
           </SidebarFooter>
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

export default withAuth(ToolkitLayout);
