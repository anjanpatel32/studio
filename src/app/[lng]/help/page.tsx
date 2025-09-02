
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from "lucide-react";


const faqs = [
    {
        question: "How do I earn coins?",
        answer: "You can earn coins by watching reels, uploading new content, sharing reels with friends, and watching rewarded ads on the Rewards page. Each action has a specific coin value and may have daily limits."
    },
    {
        question: "How can I change my password?",
        answer: "You can change your password by navigating to Settings > Security. You will need to enter your current password and then a new password to proceed."
    },
    {
        question: "Are the video ads real?",
        answer: "Currently, the 'Watch an Ad' feature is a simulation for this prototype. It mimics the behavior of a real rewarded ad system, but no actual ad is displayed."
    },
    {
        question: "How do I delete my account?",
        answer: "Account deletion is not yet available through the UI. Please contact support at support@zyreel.example.com for assistance with account deletion."
    }
]


export default function HelpPage() {
  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
            <HelpCircle className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Help Center</h1>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find answers to common questions about ZYREEL.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    </div>
  );
}
