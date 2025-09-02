
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
        <MessageSquare className="h-24 w-24 text-muted-foreground" />
        <h2 className="text-2xl font-bold mt-4">Your Messages</h2>
        <p className="text-muted-foreground mt-2">
            Select a chat to start messaging.
        </p>
    </div>
  );
}
