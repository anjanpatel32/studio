'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, Edit, Save, XCircle, Notebook, Search, FilePlus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  updatedAt: any;
  uid: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const q = query(collection(db, "notes"), where("uid", "==", user.uid), orderBy("updatedAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notesData: Note[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
        setNotes(notesData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching notes: ", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setNotes([]);
      setLoading(false);
    }
  }, [user, db]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [notes, searchTerm]);

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsCreatingNew(false);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setTitle('Untitled Note');
    setContent('');
    setIsCreatingNew(true);
  };

  const handleSaveNote = async () => {
    if (!user) return;

    const noteData = {
      title,
      content,
      updatedAt: serverTimestamp(),
      uid: user.uid,
    };

    if (isCreatingNew) {
      const newNoteRef = await addDoc(collection(db, 'notes'), {
        ...noteData,
        createdAt: serverTimestamp(),
      });
      setIsCreatingNew(false);
      const newNote = { ...noteData, id: newNoteRef.id, createdAt: new Date(), updatedAt: new Date() };
      setSelectedNote(newNote as Note);
    } else if (selectedNote) {
      const noteRef = doc(db, 'notes', selectedNote.id);
      await updateDoc(noteRef, noteData);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!user) return;
    const noteRef = doc(db, 'notes', id);
    await deleteDoc(noteRef);
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setTitle('');
      setContent('');
    }
  };

  const isEditorDirty = useMemo(() => {
    if (isCreatingNew) {
      return title !== 'Untitled Note' || content !== '';
    }
    if (selectedNote) {
      return title !== selectedNote.title || content !== selectedNote.content;
    }
    return false;
  }, [title, content, selectedNote, isCreatingNew]);

  return (
    <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
       <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Notes</h1>
        <p className="text-muted-foreground mt-1">
          Your personal space to write down thoughts and ideas. Synced across all your devices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Notes</CardTitle>
              <CardDescription>Select a note to view or edit.</CardDescription>
            </div>
            <Button size="icon" variant="ghost" onClick={handleNewNote}>
              <FilePlus className="h-5 w-5" />
            </Button>
          </CardHeader>
           <div className="px-6 pb-4">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                      placeholder="Search notes..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
          <CardContent className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredNotes.length > 0 ? (
              <ul className="space-y-2">
                 <AnimatePresence>
                    {filteredNotes.map(note => (
                         <motion.li 
                            key={note.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -50 }}
                          >
                           <button
                             onClick={() => handleSelectNote(note)}
                             className={`w-full text-left p-3 rounded-lg transition-colors ${selectedNote?.id === note.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                           >
                             <h3 className="font-semibold truncate">{note.title}</h3>
                             <p className={`text-xs truncate ${selectedNote?.id === note.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                 Updated {note.updatedAt ? formatDistanceToNow(note.updatedAt.toDate(), { addSuffix: true }) : 'just now'}
                             </p>
                           </button>
                         </motion.li>
                    ))}
                  </AnimatePresence>
              </ul>
            ) : (
              <div className="text-center py-10 border-2 border-dashed rounded-lg h-full flex flex-col justify-center">
                <Notebook className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">No notes found</h3>
                <p className="mt-1 text-sm text-muted-foreground">Create your first note to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2 flex flex-col">
          {selectedNote || isCreatingNew ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                  placeholder="Note Title"
                />
                 <div className="flex items-center gap-2">
                    <Button onClick={handleSaveNote} disabled={!isEditorDirty}>
                      <Save className="h-4 w-4 mr-2" /> Save
                    </Button>
                     {selectedNote && (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the note titled "{selectedNote.title}". This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteNote(selectedNote.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     )}
                 </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-1 resize-none border-none shadow-none focus-visible:ring-0 text-base"
                  placeholder="Start writing your note here..."
                />
              </CardContent>
            </>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Notebook className="h-16 w-16 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-semibold">Select a note</h2>
                <p className="mt-2 text-muted-foreground">
                    Choose a note from the list on the left to view or edit it, or create a new one.
                </p>
                 <Button className="mt-6" onClick={handleNewNote}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Note
                </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
