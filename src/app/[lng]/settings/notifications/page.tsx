
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, BellRing } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import type { NotificationSettings } from '@/lib/types';
import { updateNotificationSettings } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';

type SettingKey = keyof NotificationSettings;

function NotificationToggle({
  settingKey,
  label,
  description,
  initialValue,
  onToggle,
  isUpdating
}: {
  settingKey: SettingKey;
  label: string;
  description: string;
  initialValue: boolean;
  onToggle: (key: SettingKey, value: boolean) => void;
  isUpdating: boolean;
}) {
  const [checked, setChecked] = useState(initialValue);

  useEffect(() => {
    setChecked(initialValue);
  }, [initialValue]);

  const handleCheckedChange = (value: boolean) => {
    setChecked(value);
    onToggle(settingKey, value);
  };
  
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <Label htmlFor={`notif-${settingKey}`} className="font-medium cursor-pointer">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={`notif-${settingKey}`}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={isUpdating}
      />
    </div>
  );
}

export default function NotificationsSettingsPage({ params }: { params: {lng: string}}) {
  const { lng } = params;
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (key: SettingKey, value: boolean) => {
    if (!user) return;
    setIsUpdating(true);
    const result = await updateNotificationSettings(user.uid, { [key]: value });
    if (result.success) {
      toast({ title: 'Settings saved' });
    } else {
      toast({ variant: 'destructive', title: 'Update failed', description: result.error });
      // Revert UI on failure
    }
    setIsUpdating(false);
  };
  
  const isLoading = authLoading || profileLoading;

  if (isLoading) {
      return (
        <div className="container mx-auto max-w-2xl p-4 md:p-8">
            <Skeleton className="h-9 w-40 mb-4" />
             <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-56" />
                    <Skeleton className="h-4 w-80 mt-2" />
                </CardHeader>
                <CardContent className="divide-y">
                   {[...Array(4)].map((_, i) => (
                       <div key={i} className="flex items-center justify-between p-4">
                           <div className="space-y-2">
                               <Skeleton className="h-5 w-24" />
                               <Skeleton className="h-4 w-48" />
                           </div>
                           <Skeleton className="h-6 w-11 rounded-full" />
                       </div>
                   ))}
                </CardContent>
            </Card>
        </div>
      )
  }

  if (!user) {
    router.replace(`/${lng}/login`);
    return null;
  }
  
  const notificationSettings = profile?.settings?.notifications;
  if (!notificationSettings) {
      // This case can happen briefly while profile is loading or if data is missing
      return <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Settings
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-6 w-6" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Choose what you want to be notified about.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <NotificationToggle
            settingKey="likes"
            label="Likes"
            description="When someone likes your reels or posts."
            initialValue={notificationSettings.likes}
            onToggle={handleToggle}
            isUpdating={isUpdating}
          />
          <NotificationToggle
            settingKey="comments"
            label="Comments"
            description="When someone comments on your reels or posts."
            initialValue={notificationSettings.comments}
            onToggle={handleToggle}
            isUpdating={isUpdating}
          />
           <NotificationToggle
            settingKey="follows"
            label="New Followers"
            description="When someone new follows you."
            initialValue={notificationSettings.follows}
            onToggle={handleToggle}
            isUpdating={isUpdating}
          />
           <NotificationToggle
            settingKey="payouts"
            label="Payouts"
            description="Notifications about your coin redemptions."
            initialValue={notificationSettings.payouts}
            onToggle={handleToggle}
            isUpdating={isUpdating}
          />
        </CardContent>
      </Card>
    </div>
  );
}
