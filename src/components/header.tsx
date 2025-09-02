
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Search,
  PlusCircle,
  Menu,
  Home,
  Compass,
  MessageCircle,
  Heart,
  User,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { searchUsers } from '@/app/search/actions';
import type { UserProfile } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';
import { SidebarTrigger } from './ui/sidebar';

const SearchResults = ({ results, lng }: { results: UserProfile[], lng: string }) => (
    <div className="absolute top-full mt-2 w-72 rounded-md bg-background border shadow-lg z-50">
        {results.length > 0 ? (
            results.map(user => (
                <Link href={`/${lng}/profile/${user.uid}`} key={user.uid} className="block">
                    <div className="flex items-center gap-3 p-3 hover:bg-muted">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL} alt={user.displayName} />
                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{user.displayName}</p>
                        </div>
                    </div>
                </Link>
            ))
        ) : (
            <p className="p-4 text-sm text-muted-foreground">No results found.</p>
        )}
    </div>
);

export default function Header({ lng }: { lng: string }) {
    const { user } = useAuth();
    const { profile } = useUserProfile(user?.uid);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

     useEffect(() => {
        if (debouncedSearchQuery.length > 1) {
            searchUsers(debouncedSearchQuery).then(setSearchResults);
        } else {
            setSearchResults([]);
        }
    }, [debouncedSearchQuery]);

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                     <SidebarTrigger />
                </div>

                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search users..."
                        className="pl-8 sm:w-64 md:w-80"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 100)} // delay to allow click on results
                    />
                    {isSearchFocused && searchQuery && <SearchResults results={searchResults} lng={lng} />}
                </div>

                <nav className="flex items-center gap-4 ml-auto">
                    <Button asChild variant="ghost" size="icon">
                         <Link href={`/${lng}/upload`}>
                            <PlusCircle className="h-6 w-6" />
                         </Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={profile?.photoURL} alt={profile?.displayName} />
                                    <AvatarFallback>{profile?.displayName ? profile.displayName.charAt(0) : <User />}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{profile?.displayName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem asChild>
                                <Link href={`/${lng}/profile`}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                             </DropdownMenuItem>
                             <DropdownMenuItem asChild>
                                <Link href={`/${lng}/settings`}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                             </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </nav>
            </div>
        </header>
    );
}
