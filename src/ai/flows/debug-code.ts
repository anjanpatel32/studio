'use server';

/**
 * @fileOverview A code debugging AI agent.
 *
 * - debugCode - A function that handles code debugging.
 * - DebugCodeInput - The input type for the debugCode function.
 * - DebugCodeOutput - The return type for the debugCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DebugCodeInputSchema = z.object({
  code: z.string().describe('The code that has an error.'),
  language: z.string().describe('The programming language of the code.'),
  error: z.string().describe('The error message produced by the code.'),
});
export type DebugCodeInput = z.infer<typeof DebugCodeInputSchema>;

const DebugCodeOutputSchema = z.object({
  explanation: z.string().describe('An explanation of what the error is and why it occurred.'),
  fixedCode: z.string().describe('The corrected version of the code.'),
});
export type DebugCodeOutput = z.infer<typeof DebugCodeOutputSchema>;

export async function debugCode(input: DebugCodeInput): Promise<DebugCodeOutput> {
  return debugCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'debugCodePrompt',
  input: {schema: DebugCodeInputSchema},
  output: {schema: DebugCodeOutputSchema},
  prompt: `You are an expert programmer and debugger. A user has provided a piece of code in {{language}} that produced an error.

Your task is to:
1.  Analyze the code and the error message.
2.  Provide a clear, concise explanation of what the error is and why it happened.
3.  Provide the corrected code that fixes the error.

Error Message:
{{error}}

Code with Error:
\`\`\`{{language}}
{{code}}
\`\`\`

Return only the explanation and the fixed code in the specified output format.
`,
});

const debugCodeFlow = ai.defineFlow(
  {
    name: 'debugCodeFlow',
    inputSchema: DebugCodeInputSchema,
    outputSchema: DebugCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
