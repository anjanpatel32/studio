
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Image as ImageIcon, Upload, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { handlePostUpload } from '@/app/upload/actions';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const formSchema = z.object({
  caption: z.string().max(2200, "Caption is too long.").optional(),
  images: z
    .any()
    .refine((files) => files?.length > 0, "At least one image is required.")
    .refine((files) => files?.length <= MAX_FILES, `You can upload a maximum of ${MAX_FILES} images.`)
    .refine((files) => Array.from(files).every((file: any) => file.size <= MAX_FILE_SIZE), `Each file size should be less than 10MB.`)
    .refine((files) => Array.from(files).every((file: any) => file.type.startsWith("image/")), "Only image files are accepted."),
});

type PostCreatorValues = z.infer<typeof formSchema>;

export function PostCreator({ lng }: { lng: string }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);
    
    const form = useForm<PostCreatorValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { caption: '' }
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            form.setValue('images', files);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(newPreviews);
        }
    };
    
    const onSubmit = async (data: PostCreatorValues) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Authentication Error' });
            return;
        }

        setIsSubmitting(true);
        
        try {
            const imageDataUris = await Promise.all(
                Array.from(data.images).map(file => {
                    return new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                })
            );

            const result = await handlePostUpload({
                ownerUid: user.uid,
                caption: data.caption || '',
                imageDataUris,
            });

            if (result.success) {
                toast({ title: 'Post Published!', description: 'Your new post is live.' });
                router.push(`/${lng}/profile/${user.uid}`);
            } else {
                throw new Error(result.error || 'Failed to upload post.');
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="image-upload">Images</Label>
            <Input 
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={isSubmitting}
            />
            {form.formState.errors.images && <p className="text-sm text-destructive mt-1">{form.formState.errors.images.message as string}</p>}
        </div>

        {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
                {previews.map((src, index) => (
                    <div key={index} className="relative aspect-square">
                        <Image src={src} alt={`Preview ${index + 1}`} layout="fill" className="rounded-md object-cover" />
                    </div>
                ))}
            </div>
        )}
        
        <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea 
                id="caption" 
                placeholder="Write a caption..." 
                rows={4}
                {...form.register('caption')}
            />
             {form.formState.errors.caption && <p className="text-sm text-destructive mt-1">{form.formState.errors.caption.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                </>
            ) : (
                <>
                    <Upload className="mr-2 h-4 w-4" />
                    Publish Post
                </>
            )}
        </Button>
    </form>
  );
}
