'use server';
/**
 * @fileOverview A code execution AI agent.
 *
 * - executeCode - A function that handles code execution.
 */

import {ai} from '@/ai/genkit';
import { ExecuteCodeInputSchema, ExecuteCodeOutputSchema, type ExecuteCodeInput, type ExecuteCodeOutput } from '@/lib/types';


export async function executeCode(input: ExecuteCodeInput): Promise<ExecuteCodeOutput> {
    const executeCodeFlow = ai.defineFlow(
      {
        name: 'executeCodeFlow',
        inputSchema: ExecuteCodeInputSchema,
        outputSchema: ExecuteCodeOutputSchema,
      },
      async (input) => {
        const prompt = ai.definePrompt({
          name: 'executeCodePrompt',
          input: {schema: ExecuteCodeInputSchema},
          output: {schema: ExecuteCodeOutputSchema},
          prompt: `You are an online code compiler. Execute the following {{language}} code and return only the output. Do not provide any explanation or commentary. If the code has no output, return an empty string.

Code:
\'\'\'{{language}}
{{code}}
\'\'\'
`,
        });
        
        const {output} = await prompt(input);
        return output!;
      }
    );
    return await executeCodeFlow(input);
}
