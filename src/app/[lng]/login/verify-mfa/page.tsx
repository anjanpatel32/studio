
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  MultiFactorResolver,
  PhoneAuthCredential,
  PhoneAuthProvider,
  signInWithCredential,
  AuthError,
  MultiFactorAssertion
} from 'firebase/auth';
import { auth } from '@/lib/firebase';


function VerifyMfaComponent({lng}: {lng: string}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState('');

    const phoneHint = searchParams.get('hint');

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const storedResolver = sessionStorage.getItem('mfaResolver');
            if (!storedResolver) {
                throw new Error("MFA session not found. Please try logging in again.");
            }
            
            const resolver: MultiFactorResolver = JSON.parse(storedResolver);

            const cred = PhoneAuthProvider.credential(resolver.hints[0].verificationId, code);
            const multiFactorAssertion: MultiFactorAssertion = {
                factorId: resolver.hints[0].factorId,
                verificationId: cred.verificationId!,
                verificationCode: cred.smsCode!,
            };

            await resolver.resolveSignIn(multiFactorAssertion);
            
            sessionStorage.removeItem('mfaResolver');
            toast({ title: 'Signed in successfully!' });
            router.push(`/${lng}`);
            
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Verification Failed',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };
    
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
            <ShieldCheck className="h-7 w-7" />
            Verify Your Identity
          </CardTitle>
          <CardDescription>
            A verification code was sent to your phone number ending in {phoneHint || '****'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyCode} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete='one-time-code'
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || code.length < 6}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify & Sign In'}
            </Button>
          </form>
        </CardContent>
         <CardContent className="text-center text-sm">
            <Button variant="link" onClick={() => router.push(`/${lng}/login`)}>
                Cancel and go back
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function VerifyMfaPage({ params }: { params: {lng: string}}) {
    const { lng } = params;
    return (
        <Suspense fallback={<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>}>
            <VerifyMfaComponent lng={lng}/>
        </Suspense>
    )
}
