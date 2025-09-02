
'use client';
import { ChatSidebar } from './_components/chat-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useParams } from 'next/navigation';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const params = useParams();

  // On mobile, if a specific chat is open, only show the chat view.
  if (isMobile && params.chatId) {
    return (
       <div className="h-[calc(100vh-8rem)] flex-1">
          {children}
       </div>
    );
  }

  return (
    <div className="container mx-auto h-[calc(100vh-4rem)] flex">
        <div className={isMobile ? "w-full" : ""}>
          <ChatSidebar />
        </div>
        {!isMobile && (
           <div className="flex-1 border-l">
              {children}
           </div>
        )}
    </div>
  );
}
