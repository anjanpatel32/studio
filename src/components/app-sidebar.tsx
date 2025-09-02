
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

const menuItems = [
  { id: 'home', href: '/', icon: Home, label: 'home' },
  { id: 'explore', href: '/explore', icon: Compass, label: 'explore' },
  { id: 'messages', href: '/messages', icon: MessageCircle, label: 'messages', notificationCount: 5 },
  { id: 'notifications', href: '/notifications', icon: Heart, label: 'notifications', notificationCount: 10 },
  { id: 'create', href: '/upload', icon: PlusSquare, label: 'create' },
  { id: 'profile', href: '/profile', icon: User, label: 'profile' },
  { id: 'rewards', href: '/rewards', icon: Award, label: 'rewards' },
];

export default function AppSidebar({ lng }: { lng: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation(lng, 'translation');

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
    if (href === '/') {
        return pathname === `/${lng}` || pathname === '/';
    }
    return pathname.startsWith(`/${lng}${href}`);
  };

  return (
      <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold font-headline group-data-[collapsible=icon]:hidden">ZYREEL</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <Link href={`/${lng}${item.href}`} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  tooltip={{
                    children: t(item.label)
                  }}
                >
                  <item.icon />
                  <span>{t(item.label)}</span>
                  {item.notificationCount && (
                    <SidebarMenuBadge>{item.notificationCount}</SidebarMenuBadge>
                  )}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
         <SidebarMenu>
           <SidebarMenuItem>
              <Link href={`/${lng}/settings`} passHref legacyBehavior>
                 <SidebarMenuButton isActive={pathname.startsWith(`/${lng}/settings`)} tooltip={{ children: t('settings') }}>
                    <Settings />
                    <span>{t('settings')}</span>
                </SidebarMenuButton>
              </Link>
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
