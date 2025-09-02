
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, History, Upload, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { handleStoryUpload } from '@/app/upload/actions';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  image: z
    .any()
    .refine((files) => files?.length === 1, "An image file is required.")
    .refine((files) => files?.[0]?.size <= 10 * 1024 * 1024, `Max file size is 10MB.`)
    .refine(
      (files) => files?.[0]?.type?.startsWith("image/"),
      "Only image files are accepted."
    ),
});

type StoryCreatorValues = z.infer<typeof formSchema>;

export function StoryCreator({ lng }: { lng: string }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const form = useForm<StoryCreatorValues>({
        resolver: zodResolver(formSchema),
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            form.setValue('image', [file]);
            const newPreview = URL.createObjectURL(file);
            setPreview(newPreview);
        }
    };

    const onSubmit = async (data: StoryCreatorValues) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Authentication Error' });
            return;
        }

        setIsSubmitting(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(data.image[0]);
            reader.onloadend = async () => {
                const imageDataUri = reader.result as string;
                const result = await handleStoryUpload({
                    ownerUid: user.uid,
                    imageDataUri,
                });

                if (result.success) {
                    toast({ title: 'Story Posted!', description: 'Your story will be visible for 24 hours.' });
                    router.push(`/${lng}`);
                } else {
                    throw new Error(result.error || 'Failed to upload story.');
                }
            };
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="story-upload" className={cn(
                    "w-full h-80 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors",
                    form.formState.errors.image && "border-destructive text-destructive"
                )}>
                    {preview ? (
                        <Image src={preview} alt="Story preview" layout="fill" className="rounded-md object-cover" />
                    ) : (
                        <>
                            <Camera className="h-12 w-12" />
                            <p className="mt-2 text-sm font-medium">Click to upload an image</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                        </>
                    )}
                </Label>
                <Input 
                    id="story-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                />
                {form.formState.errors.image && <p className="text-sm text-destructive mt-1">{form.formState.errors.image.message as string}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
                ) : (
                    <><History className="mr-2 h-4 w-4" /> Share to Story</>
                )}
            </Button>
        </form>
    );
}
