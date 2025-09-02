'use server';
/**
 * @fileOverview A content moderation AI agent for reels.
 *
 * - moderateContent - A function that handles the content moderation process.
 * - ModerateContentInput - The input type for the moderateContent function.
 * - ModerateContentOutput - The return type for the moderateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ModerateContentInputSchema = z.object({
  reelDataUri: z
    .string()
    .describe(
      "The video reel, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description or caption of the reel.'),
});
export type ModerateContentInput = z.infer<typeof ModerateContentInputSchema>;

export const ModerateContentOutputSchema = z.object({
    isCompliant: z.boolean().describe('Whether or not the content is compliant with the guidelines.'),
    reason: z.string().describe('The reason for non-compliance. Provide a detailed explanation.'),
});
export type ModerateContentOutput = z.infer<typeof ModerateContentOutputSchema>;

export async function moderateContent(input: ModerateContentInput): Promise<ModerateContentOutput> {
  return moderateContentFlow(input);
}

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

const moderateContentFlow = ai.defineFlow(
  {
    name: 'moderateContentFlow',
    inputSchema: ModerateContentInputSchema,
    outputSchema: ModerateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
