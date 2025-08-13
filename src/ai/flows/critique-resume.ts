'use server';

/**
 * @fileOverview An AI agent for critiquing resumes.
 *
 * - critiqueResume - A function that analyzes a resume and provides feedback.
 * - CritiqueResumeInput - The input type for the critiqueResume function.
 * - CritiqueResumeOutput - The return type for the critiqueResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CritiqueResumeInputSchema = z.object({
  resumeText: z.string().describe('The full text content of the resume.'),
  jobDescription: z.string().optional().describe('The job description the user is applying for.'),
});
export type CritiqueResumeInput = z.infer<typeof CritiqueResumeInputSchema>;

const CritiqueResumeOutputSchema = z.object({
  critique: z.string().describe('A detailed critique of the resume, formatted as HTML with headings, lists, and bold text for readability. Provide actionable suggestions for improvement.'),
});
export type CritiqueResumeOutput = z.infer<typeof CritiqueResumeOutputSchema>;


export async function critiqueResume(input: CritiqueResumeInput): Promise<CritiqueResumeOutput> {
  return critiqueResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'critiqueResumePrompt',
  input: {schema: CritiqueResumeInputSchema},
  output: {schema: CritiqueResumeOutputSchema},
  prompt: `You are an expert career coach and professional resume writer. Your task is to provide a detailed critique of the user's resume.

Analyze the provided resume text.
{{#if jobDescription}}
Additionally, analyze the following job description to tailor your feedback.
Job Description:
---
{{jobDescription}}
---
{{/if}}

Your critique should be constructive, insightful, and actionable. Focus on the following areas:
1.  **Formatting and Readability**: Is the resume easy to read? Is the layout clean?
2.  **Clarity and Conciseness**: Is the language clear and to the point? Are there any verbose or confusing sections?
3.  **Impact and Achievements**: Does the resume focus on achievements rather than just duties? Does it use quantifiable results (e.g., "Increased sales by 20%")?
4.  **Keywords and ATS Optimization**: {{#if jobDescription}}Does the resume include relevant keywords from the job description to pass through Applicant Tracking Systems (ATS)?{{else}}Does the resume use strong action verbs and industry-standard keywords?{{/if}}
5.  **Overall Impression**: What is the overall quality of the resume? What are its main strengths and weaknesses?

Provide your feedback in a structured HTML format. Use headings (<h3>), lists (<ul>, <ol>, <li>), and bold tags (<strong>) to make the critique easy to read and digest. Do not use a title heading (<h1> or <h2>). Start directly with the first section of your critique.

Resume Text:
---
{{resumeText}}
---
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
