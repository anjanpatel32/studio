'use server';
/**
 * @fileOverview A content moderation AI agent for reels.
 *
 * - moderateContent - A function that handles the content moderation process.
 */

import {ai} from '@/ai/genkit';
import { ModerateContentInputSchema, ModerateContentOutputSchema, type ModerateContentInput, type ModerateContentOutput } from '@/lib/types';

export async function moderateContent(input: ModerateContentInput): Promise<ModerateContentOutput> {
    const moderateContentFlow = ai.defineFlow(
        {
            name: 'moderateContentFlow',
            inputSchema: ModerateContentInputSchema,
            outputSchema: ModerateContentOutputSchema,
        },
        async (input) => {
            const prompt = ai.definePrompt({
                name: 'moderateContentPrompt',
                input: {schema: ModerateContentInputSchema},
                output: {schema: ModerateContentOutputSchema},
                prompt: `You are a content moderator for a social media platform. Your task is to review a video reel and its description to determine if it complies with the community guidelines.

Guidelines:
- No hate speech or promotion of violence.
- No explicit nudity or sexually suggestive content.
- No graphic violence or gore.
- No harassment or bullying.
- No misinformation or dangerous content.

Analyze the provided video and description.
- If it complies with all guidelines, set isCompliant to true.
- If it violates any guideline, set isCompliant to false and provide a clear, concise reason for the violation.

Description: {{{description}}}
Video Reel: {{media url=reelDataUri}}`,
            });
            const {output} = await prompt(input);
            return output!;
        }
    );

    return await moderateContentFlow(input);
}
