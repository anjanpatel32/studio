'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth, User } from 'firebase/auth';
import { app } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Pencil, Save, X, ListTodo, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: any;
  uid: string;
};

const taskSchema = z.object({
  text: z.string().min(1, { message: 'Task cannot be empty.' }).max(200, { message: 'Task is too long.' }),
});

export default function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isSubmitting, startSubmitTransition] = useTransition();

  const auth = getAuth(app);
  const db = getFirestore(app);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const q = query(collection(db, "tasks"), where("uid", "==", user.uid), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksData: Task[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching tasks: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch tasks.' });
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user, db, toast]);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      text: '',
    },
  });

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    if (!user) return;
    startSubmitTransition(async () => {
      try {
        await addDoc(collection(db, 'tasks'), {
          text: values.text,
          completed: false,
          createdAt: serverTimestamp(),
          uid: user.uid,
        });
        form.reset();
      } catch (error) {
        console.error("Error adding task:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not add task.' });
      }
    });
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const taskRef = doc(db, 'tasks', id);
    try {
      await updateDoc(taskRef, { completed: !task.completed });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update task.' });
    }
  };

  const deleteTask = async (id: string) => {
    const taskRef = doc(db, 'tasks', id);
    try {
      await deleteDoc(taskRef);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete task.' });
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveEdit = async (id: string) => {
    if (editingText.trim() === '') {
      deleteTask(id);
    } else {
      const taskRef = doc(db, 'tasks', id);
      try {
        await updateDoc(taskRef, { text: editingText });
      } catch (error) {
        console.error("Error saving task:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save task.' });
      }
    }
    setEditingTaskId(null);
    setEditingText('');
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingText('');
  }

  const { pendingTasks, completedTasks } = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        if (task.completed) {
          acc.completedTasks.push(task);
        } else {
          acc.pendingTasks.push(task);
        }
        return acc;
      },
      { pendingTasks: [] as Task[], completedTasks: [] as Task[] }
    );
  }, [tasks]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">To-Do List</h1>
        <p className="text-muted-foreground mt-1">
          Organize your tasks and stay on top of your work. Your tasks are synced across all your devices.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a New Task</CardTitle>
          <CardDescription>What do you need to get done?</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">New Task</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="e.g., Finish math homework" {...field} />
                      </FormControl>
                      <Button type="submit" disabled={!user || isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        <span className="sr-only">Add Task</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </form>
        </Form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-headline font-semibold">Your Tasks ({pendingTasks.length})</h2>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-2">
            <AnimatePresence>
              {pendingTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                >
                  <Card className="flex items-center p-4 gap-4">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      aria-label={`Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
                    />
                    {editingTaskId === task.id ? (
                      <div className="flex-grow flex gap-2 items-center">
                        <Input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-grow"
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(task.id); if (e.key === 'Escape') cancelEdit(); }}
                          autoFocus
                        />
                        <Button size="icon" variant="ghost" onClick={() => saveEdit(task.id)}><Save className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <span
                        className={`flex-grow ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {task.text}
                      </span>
                    )}
                    <div className="flex gap-1">
                      {!task.completed && editingTaskId !== task.id && (
                        <Button size="icon" variant="ghost" onClick={() => startEditing(task)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <ListTodo className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">No tasks yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add a task above to get started.</p>
          </div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <h2 className="text-2xl font-headline font-semibold">Completed ({completedTasks.length})</h2>
          <div className="space-y-2">
            <AnimatePresence>
              {completedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                >
                  <Card className="flex items-center p-4 gap-4 bg-muted/50">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      aria-label={`Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
                    />
                    <span className="flex-grow line-through text-muted-foreground">
                      {task.text}
                    </span>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteTask(task.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
