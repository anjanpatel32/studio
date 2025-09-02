
'use client';

import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Video, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { uploadChunk } from '@/app/upload/actions';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  description: z.string().max(2200, "Description is too long.").optional(),
  video: z
    .any()
    .refine((files) => files?.length === 1, "A video file is required.")
    .refine((files) => files?.[0]?.size <= 100 * 1024 * 1024, `Max file size is 100MB.`)
    .refine(
      (files) => files?.[0]?.type?.startsWith("video/"),
      "Only video files are accepted."
    ),
});

type ReelCreatorValues = z.infer<typeof formSchema>;

export function ReelCreator({ lng }: { lng: string }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [videoPreview, setVideoPreview] = useState<string | null>(null);

    const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<ReelCreatorValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { description: '' }
    });
    
    const videoFile = watch('video');

    const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVideoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setVideoPreview(null);
        }
    };

    const handleUpload = async (file: File, description: string) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to upload.' });
            return;
        }

        setIsSubmitting(true);
        setUploadStatus('uploading');
        setUploadProgress(0);
        
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const fileId = `${file.name}-${file.lastModified}-${file.size}`;

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = start + CHUNK_SIZE;
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append('chunk', chunk);
            formData.append('chunkIndex', String(i));
            formData.append('totalChunks', String(totalChunks));
            formData.append('fileId', fileId);
            formData.append('description', description);
            formData.append('ownerUid', user.uid);
            
            try {
                const result = await uploadChunk(formData);
                if (!result.success) {
                    throw new Error(result.error || 'Chunk upload failed');
                }
                setUploadProgress(((i + 1) / totalChunks) * 100);

                if (result.isComplete) {
                     if (result.finalResult?.success) {
                        setUploadStatus('success');
                        toast({ title: 'Reel Uploaded!', description: 'Your reel is now live.' });
                        router.push(`/${lng}/profile/${user.uid}`);
                    } else {
                        throw new Error(result.finalResult?.error || 'Finalizing upload failed.');
                    }
                }
            } catch (error: any) {
                setUploadStatus('error');
                toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
                setIsSubmitting(false);
                return;
            }
        }
    };
    
    const onSubmit = (data: ReelCreatorValues) => {
        handleUpload(data.video[0], data.description || '');
    };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
            <Controller
                name="video"
                control={control}
                render={({ field }) => (
                    <FormItem>
                         <Label htmlFor="video-upload" className={cn(
                             "w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors",
                             errors.video && "border-destructive text-destructive"
                         )}>
                             {videoPreview ? (
                                <video src={videoPreview} className="h-full w-full object-contain rounded-lg" />
                             ) : (
                                <>
                                    <Video className="h-12 w-12" />
                                    <p className="mt-2 text-sm font-medium">Click to upload a video</p>
                                    <p className="text-xs text-muted-foreground">MP4, MOV, AVI up to 100MB</p>
                                </>
                             )}
                         </Label>
                         <Input 
                            {...field}
                            id="video-upload"
                            type="file"
                            className="hidden"
                            accept="video/*"
                            onChange={(e) => {
                                field.onChange(e.target.files);
                                handleVideoChange(e);
                            }}
                         />
                         {errors.video && <p className="text-sm text-destructive mt-1">{errors.video.message as string}</p>}
                    </FormItem>
                )}
            />
        </div>

        <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
             <Controller
                name="description"
                control={control}
                render={({ field }) => (
                    <Textarea 
                        {...field}
                        id="description" 
                        placeholder="Describe your reel, add #hashtags..." 
                        rows={4}
                    />
                )}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
        </div>

        {isSubmitting && (
            <div className="space-y-2">
                <Label>{uploadStatus === 'uploading' ? 'Uploading...' : 'Status'}</Label>
                <Progress value={uploadProgress} />
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
                    {uploadStatus === 'success' && <><CheckCircle className="h-4 w-4 text-green-500" /> <span>Upload Complete!</span></>}
                    {uploadStatus === 'error' && <><AlertCircle className="h-4 w-4 text-destructive" /> <span>An error occurred.</span></>}
                </div>
            </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading Reel...
                </>
            ) : (
                <>
                    <Upload className="mr-2 h-4 w-4" />
                    Post Reel
                </>
            )}
        </Button>
    </form>
  );
}

function FormItem({ children }: { children: React.ReactNode }) {
    return <div className="space-y-2">{children}</div>;
}
