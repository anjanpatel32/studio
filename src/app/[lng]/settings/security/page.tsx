
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { changePassword } from '../actions';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import {
  RecaptchaVerifier,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  multiFactor,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { disableMFA } from '../mfa-actions';
import { useUserProfile } from '@/hooks/use-user-profile';


const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required.' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ['confirmPassword'],
});


const phoneFormSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, { message: "Please enter a valid phone number in E.164 format (e.g., +12223334444)." }),
});

const codeFormSchema = z.object({
  code: z.string().length(6, { message: "Verification code must be 6 digits." }),
})


export default function SecurityPage({ params }: { params: {lng: string}}) {
  const { lng } = params;
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid);

  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isDisablingMfa, setIsDisablingMfa] = useState(false);
  
  // MFA Enablement State
  const [mfaStep, setMfaStep] = useState<'closed' | 'enterPhone' | 'enterCode'>('closed');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isEnablingMfa, setIsEnablingMfa] = useState(false);
  
  // Re-authentication state for disabling MFA
  const [showReauthDialog, setShowReauthDialog] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  
  useEffect(() => {
    // This is necessary for RecaptchaVerifier to work
    if (typeof window !== 'undefined') {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        });
    }
  }, []);

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  
  const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
  });
  
  const codeForm = useForm<z.infer<typeof codeFormSchema>>({
    resolver: zodResolver(codeFormSchema),
  });

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    setIsSubmittingPassword(true);
    const result = await changePassword(values);
    if (result.success) {
      toast({ title: 'Password Updated!', description: 'Your password has been changed successfully.' });
      passwordForm.reset();
    } else {
      toast({ variant: 'destructive', title: 'Update Failed', description: result.error });
    }
    setIsSubmittingPassword(false);
  }

  const handleEnableMfaClick = () => {
    setMfaStep('enterPhone');
  }

  const handleSendVerificationCode = async (values: z.infer<typeof phoneFormSchema>) => {
    if (!user) return;
    setIsEnablingMfa(true);
    try {
      const multiFactorSession = await multiFactor(user).getSession();
      const phoneInfoOptions = {
        phoneNumber: values.phoneNumber,
        session: multiFactorSession,
      };
      
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const appVerifier = window.recaptchaVerifier;
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, appVerifier);
      
      setVerificationId(verificationId);
      setMfaStep('enterCode');
      toast({ title: "Verification code sent!"});
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to send code", description: error.message });
    } finally {
        setIsEnablingMfa(false);
    }
  }
  
  const handleVerifyCode = async (values: z.infer<typeof codeFormSchema>) => {
      if (!user || !verificationId) return;
      setIsEnablingMfa(true);
      try {
          const cred = PhoneAuthProvider.credential(verificationId, values.code);
          const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
          await multiFactor(user).enroll(multiFactorAssertion);
          
          // Note: The server action is a placeholder in this prototype.
          // The client-side logic above is what actually enables MFA with Firebase.
          // In a real app, you might call a server action here to update your DB.

          toast({ title: "Success!", description: "2FA has been enabled on your account."});
          setMfaStep('closed');
      } catch (error: any) {
          toast({ variant: "destructive", title: "Verification failed", description: error.message });
      } finally {
          setIsEnablingMfa(false);
      }
  }

  const handleDisableMfa = async () => {
    if (!user) return;
    setShowReauthDialog(true);
  }
  
  const handleReauthAndDisable = async () => {
      if (!user || !user.email) return;
      setIsReauthenticating(true);
      
      try {
          const credential = EmailAuthProvider.credential(user.email, reauthPassword);
          await reauthenticateWithCredential(user, credential);
          
          const mfaUser = multiFactor(user);
          if (mfaUser.enrolledFactors && mfaUser.enrolledFactors.length > 0) {
              await mfaUser.unenroll(mfaUser.enrolledFactors[0]);
              await disableMFA(user.uid);
              toast({ title: "2FA Disabled", description: "Two-factor authentication has been turned off." });
          } else {
              toast({ title: "No 2FA to disable", description: "Two-factor authentication was not active." });
          }
          
          setShowReauthDialog(false);
          setReauthPassword('');

      } catch (error: any) {
          toast({ variant: 'destructive', title: "Authentication Failed", description: error.message });
      } finally {
          setIsReauthenticating(false);
      }
  }

  if (authLoading || profileLoading) {
      return (
           <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
      )
  }

  if (!user) {
    router.replace(`/${lng}/login`);
    return null;
  }
  
  const isMfaEnabled = profile?.settings?.twoFactorEnabled === true;

  return (
    <>
    <div id="recaptcha-container"></div>
    <div className="container mx-auto max-w-2xl p-4 md:p-8">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Settings
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-6 w-6" />
            Change Password
          </CardTitle>
          <CardDescription>
            For your security, we recommend choosing a password that you don't use anywhere else.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                       <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                       <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmittingPassword} className="w-full">
                {isSubmittingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Change Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="mt-8">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6" />
                Two-Factor Authentication (2FA)
            </CardTitle>
            <CardDescription>
                Add an extra layer of security to your account using your phone.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                     <Label htmlFor="2fa-switch" className="font-medium">
                        {isMfaEnabled ? "2FA is Enabled" : "Enable 2FA"}
                     </Label>
                     <p className="text-sm text-muted-foreground">
                        {isMfaEnabled 
                            ? "You'll be asked for a code when you sign in." 
                            : "Secure your account with an SMS code."
                        }
                     </p>
                </div>
                <Switch 
                    id="2fa-switch" 
                    checked={isMfaEnabled}
                    onCheckedChange={(checked) => {
                        if (checked) handleEnableMfaClick();
                        else handleDisableMfa();
                    }}
                    disabled={isDisablingMfa}
                />
            </div>
        </CardContent>
      </Card>
    </div>
    
    {/* Enable MFA Dialogs */}
    <Dialog open={mfaStep !== 'closed'} onOpenChange={() => setMfaStep('closed')}>
        <DialogContent>
            {mfaStep === 'enterPhone' && (
                <>
                <DialogHeader>
                    <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                    <DialogDescription>Enter your phone number to receive a verification code. Standard message rates may apply.</DialogDescription>
                </DialogHeader>
                 <Form {...phoneForm}>
                    <form onSubmit={phoneForm.handleSubmit(handleSendVerificationCode)} className="space-y-4">
                        <FormField control={phoneForm.control} name="phoneNumber" render={({field}) => (
                             <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl><Input placeholder="+12223334444" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="submit" disabled={isEnablingMfa}>
                                {isEnablingMfa ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Send Code
                            </Button>
                        </DialogFooter>
                    </form>
                 </Form>
                </>
            )}
            {mfaStep === 'enterCode' && (
                 <>
                <DialogHeader>
                    <DialogTitle>Enter Verification Code</DialogTitle>
                    <DialogDescription>A 6-digit code was sent to your phone. Enter it below to complete setup.</DialogDescription>
                </DialogHeader>
                <Form {...codeForm}>
                    <form onSubmit={codeForm.handleSubmit(handleVerifyCode)} className="space-y-4">
                        <FormField control={codeForm.control} name="code" render={({field}) => (
                             <FormItem>
                                <FormLabel>Verification Code</FormLabel>
                                <FormControl><Input placeholder="123456" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                             <Button type="submit" disabled={isEnablingMfa}>
                                {isEnablingMfa ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Verify & Enable
                            </Button>
                        </DialogFooter>
                    </form>
                 </Form>
                 </>
            )}
        </DialogContent>
    </Dialog>

    {/* Disable MFA Dialog */}
    <Dialog open={showReauthDialog} onOpenChange={setShowReauthDialog}>
        <DialogContent>
             <DialogHeader>
                <DialogTitle>Confirm Your Identity</DialogTitle>
                <DialogDescription>To disable 2FA, please enter your password.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <Input 
                    type="password"
                    placeholder="Your password"
                    value={reauthPassword}
                    onChange={(e) => setReauthPassword(e.target.value)}
                />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={handleReauthAndDisable} disabled={isReauthenticating || !reauthPassword}>
                     {isReauthenticating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                     Confirm & Disable
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    </>
  );
}

// Add a declaration for the recaptchaVerifier on the window object
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}
