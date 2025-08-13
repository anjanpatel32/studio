'use server';

/**
 * @fileOverview Resume critique AI agent.
 *
 * - critiqueResume - A function that handles the resume critique process.
 * - CritiqueResumeInput - The input type for the critiqueResume function.
 * - CritiqueResumeOutput - The return type for the critiqueResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CritiqueResumeInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be critiqued.'),
  jobDescription: z.string().optional().describe('Optional job description to tailor the resume towards.'),
});
export type CritiqueResumeInput = z.infer<typeof CritiqueResumeInputSchema>;

const CritiqueResumeOutputSchema = z.object({
  critique: z.string().describe('AI-powered suggestions for improving the resume.'),
});
export type CritiqueResumeOutput = z.infer<typeof CritiqueResumeOutputSchema>;

export async function critiqueResume(input: CritiqueResumeInput): Promise<CritiqueResumeOutput> {
  return critiqueResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'critiqueResumePrompt',
  input: {schema: CritiqueResumeInputSchema},
  output: {schema: CritiqueResumeOutputSchema},
  prompt: `You are an expert resume critique. Analyze the provided resume and offer suggestions for improvements, focusing on content, structure, and keywords to enhance its effectiveness.

Consider the following aspects:
- Content: Is the information clear, concise, and relevant?
- Structure: Is the resume well-organized and easy to read?
- Keywords: Does the resume include relevant keywords for the desired job or industry?

Resume:
{{resumeText}}

{% if jobDescription %}
Here is a job description to tailor the resume towards:
{{jobDescription}}
{% endif %}
`,
});

const critiqueResumeFlow = ai.defineFlow(
  {
    name: 'critiqueResumeFlow',
    inputSchema: CritiqueResumeInputSchema,
    outputSchema: CritiqueResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
