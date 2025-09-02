
'use client';
import { ChatSidebar } from './_components/chat-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function MessagesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {lng: string};
}) {
  const isMobile = useIsMobile();
  const pageParams = useParams();

  // On mobile, if a specific chat is open, only show the chat view.
  if (isMobile) {
    if (pageParams.chatId) {
       return (
         <div className="h-[calc(100vh-8rem)] flex-1">
            {children}
         </div>
      );
    }
    return (
      <div className="h-[calc(100vh-8rem)]">
        <ChatSidebar lng={params.lng as string} />
      </div>
    );
  }

  return (
    <div className="container mx-auto h-[calc(100vh-4rem)] flex">
        <ChatSidebar lng={params.lng as string} />
        <div className="flex-1 border-l">
            {children}
        </div>
    </div>
  );
}
