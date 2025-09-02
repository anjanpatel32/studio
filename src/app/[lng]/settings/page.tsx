'use client';

import {
  User,
  Shield,
  Bell,
  CreditCard,
  Languages,
  Palette,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/use-auth';
import { updateUserSetting } from '@/app/settings/actions';
import { useTranslation } from '@/app/i18n/client';


const SettingsItem = ({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children?: React.ReactNode }) => (
  <div className="flex items-center p-4">
    <div className="mr-4 text-muted-foreground">{icon}</div>
    <div className="flex-1 text-left">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const SettingsLinkItem = ({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string; href: string }) => (
    <Link href={href} passHref>
      <div className="w-full flex items-center p-4 rounded-lg hover:bg-muted/50 transition-colors text-left cursor-pointer">
            <div className="mr-4 text-muted-foreground">{icon}</div>
            <div className="flex-1">
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </Link>
)


export default function SettingsPage({ params }: { params: { lng: string }}) {
    const { lng } = params;
    const { toast } = useToast();
    const router = useRouter();
    const { setTheme, theme } = useTheme();
    const { user } = useAuth();
    const { t } = useTranslation(lng);


    const placeholderClick = (feature: string) => {
        toast({
        title: 'Coming Soon!',
        description: `${feature} functionality will be implemented in a future update.`,
        });
    };

    const handleLogout = async () => {
        try {
          await signOut(auth);
          toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
          router.push(`/${lng}/login`);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Logout Failed', description: 'Could not log you out. Please try again.' });
        }
    };
    
    const handleThemeChange = async (selectedTheme: 'light' | 'dark' | 'system') => {
        setTheme(selectedTheme);
        if(user) {
            await updateUserSetting(user.uid, { theme: selectedTheme });
        }
    }
    
    const handleLanguageChange = async (selectedLanguage: 'en' | 'es' | 'hi') => {
        if(user) {
            await updateUserSetting(user.uid, { language: selectedLanguage });
        }
        router.push(`/${selectedLanguage}/settings`)
    }


  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <SettingsIcon className="h-8 w-8" />
        <h1 className="text-3xl font-bold">{t('settings')}</h1>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings and personal information.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y p-0">
            <SettingsLinkItem icon={<User />} title={t('editProfile')} description="Update username, bio, and avatar" href={`/${lng}/profile/edit`} />
            <SettingsLinkItem icon={<Shield />} title={t('security')} description="Change password, enable 2FA" href={`/${lng}/settings/security`} />
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your app experience.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y p-0">
            <SettingsLinkItem icon={<Bell />} title={t('notifications')} description="Manage push notifications" href={`/${lng}/settings/notifications`} />
             <SettingsItem 
                icon={<Languages />} 
                title={t('language')} 
                description="Choose your preferred language"
            >
                 <Select onValueChange={handleLanguageChange} value={lng}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="English" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="hi">हिन्दी</SelectItem>
                    </SelectContent>
                </Select>
            </SettingsItem>
            <SettingsItem icon={<CreditCard />} title={t('payments')} description="Manage payout methods and history">
                 <Button variant="ghost" size="icon" onClick={() => placeholderClick('Payment Settings')} className="text-muted-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </SettingsItem>
            <SettingsItem 
                icon={<Palette />} 
                title={t('theme')} 
                description="Switch between light and dark mode"
            >
                <Select onValueChange={handleThemeChange} value={theme}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light"><div className='flex items-center gap-2'><Sun className="h-4 w-4" /> {t('light')}</div></SelectItem>
                        <SelectItem value="dark"><div className='flex items-center gap-2'><Moon className="h-4 w-4" /> {t('dark')}</div></SelectItem>
                        <SelectItem value="system"><div className='flex items-center gap-2'><Laptop className="h-4 w-4" /> {t('system')}</div></SelectItem>
                    </SelectContent>
                </Select>
            </SettingsItem>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
            <CardTitle>About & Support</CardTitle>
            <CardDescription>Get help and learn more about ZYREEL.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y p-0">
            <SettingsLinkItem icon={<HelpCircle />} title={t('helpCenter')} description="Find answers to your questions" href={`/${lng}/help`} />
            <SettingsLinkItem icon={<Info />} title={t('about')} description="App version, terms, privacy policy" href={`/${lng}/about`} />
        </CardContent>
      </Card>

      <div className="mt-8 text-left">
         <Button variant="ghost" className="w-full justify-start p-4 text-lg text-red-500 hover:text-red-500 hover:bg-red-500/10" onClick={handleLogout}>
            <LogOut className="mr-4" />
            {t('logout')}
         </Button>
      </div>

    </div>
  );
}
