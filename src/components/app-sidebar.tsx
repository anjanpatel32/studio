
'use client';

import {
  Home,
  Compass,
  PlusSquare,
  MessageCircle,
  Heart,
  User,
  Settings,
  Award,
  LogOut,
  Bot,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useTranslation } from '@/app/i18n/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const menuItems = [
  { id: 'home', href: '/home', icon: Home, label: 'home' },
  { id: 'explore', href: '/explore', icon: Compass, label: 'explore' },
  { id: 'create', href: '/upload', icon: PlusSquare, label: 'create' },
  { id: 'notifications', href: '/notifications', icon: Heart, label: 'notifications', notificationCount: 10 },
  { id: 'profile', href: '/profile', icon: User, label: 'profile' },
];

export default function AppSidebar({ lng }: { lng: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation(lng, 'translation');
  const isMobile = useIsMobile();

  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push(`/${lng}/login`);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Logout Failed', description: 'Could not log you out. Please try again.' });
    }
  };

  const isActive = (href: string) => {
    const currentPath = pathname.substring(`/${lng}`.length) || '/';
    if (href === '/home') {
        return currentPath === href || currentPath === '/';
    }
    return currentPath.startsWith(href);
  };


  if (isMobile) {
      return (
        <div className="flex justify-around items-center w-full h-16">
             {menuItems.map((item) => (
                <Link href={`/${lng}${item.href}`} key={item.id}>
                    <div className={cn("flex flex-col items-center gap-1 p-2 rounded-md", isActive(item.href) ? "text-primary" : "text-muted-foreground")}>
                        <item.icon className="h-6 w-6"/>
                        {/* <span className="text-xs">{t(item.label)}</span> */}
                    </div>
                </Link>
             ))}
        </div>
      )
  }

  return (
      <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold group-data-[collapsible=icon]:hidden font-headline">ZYREEL</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {[...menuItems, { id: 'messages', href: '/messages', icon: MessageCircle, label: 'messages', notificationCount: 5 }, { id: 'rewards', href: '/rewards', icon: Award, label: 'rewards' }].map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={{
                  children: t(item.label)
                }}
              >
                <Link href={`/${lng}${item.href}`}>
                  <item.icon />
                  <span>{t(item.label)}</span>
                  {item.notificationCount && (
                    <SidebarMenuBadge>{item.notificationCount}</SidebarMenuBadge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
         <SidebarMenu>
           <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith(`/${lng}/settings`)} tooltip={{ children: t('settings') }}>
                <Link href={`/${lng}/settings`}>
                  <Settings />
                  <span>{t('settings')}</span>
                </Link>
              </SidebarMenuButton>
           </SidebarMenuItem>
           {user && (
             <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={{children: t('logout')}}>
                    <LogOut />
                    <span>{t('logout')}</span>
                </SidebarMenuButton>
             </SidebarMenuItem>
            )}
         </SidebarMenu>

        <Link href={user ? `/${lng}/profile` : `/${lng}/login`}>
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.photoURL} />
                    <AvatarFallback>{profile?.displayName?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <p className="font-semibold text-sm">{profile?.displayName || 'Guest'}</p>
                    <p className="text-xs text-muted-foreground">{user ? 'View profile' : 'Sign In'}</p>
                </div>
            </div>
        </Link>
      </SidebarFooter>
      </>
  );
}
