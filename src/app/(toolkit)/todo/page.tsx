'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useLocalStorage from '@/hooks/use-local-storage';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Pencil, Save, X, ListTodo } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

const taskSchema = z.object({
  text: z.string().min(1, { message: 'Task cannot be empty.' }).max(200, { message: 'Task is too long.' }),
});

export default function TodoPage() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('todo-tasks', []);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      text: '',
    },
  });

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    const newTask: Task = {
      id: new Date().toISOString(),
      text: values.text,
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    form.reset();
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };
  
  const saveEdit = (id: string) => {
    if (editingText.trim() === '') {
      deleteTask(id);
    } else {
      setTasks(
        tasks.map((task) => (task.id === id ? { ...task, text: editingText } : task))
      );
    }
    setEditingTaskId(null);
    setEditingText('');
  };
  
  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingText('');
  }

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">To-Do List</h1>
        <p className="text-muted-foreground mt-1">
          Organize your tasks and stay on top of your work.
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
                      <Button type="submit">
                        <Plus className="h-4 w-4" />
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
        {tasks.length > 0 ? (
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
                          onKeyDown={(e) => { if(e.key === 'Enter') saveEdit(task.id); if(e.key === 'Escape') cancelEdit(); }}
                        />
                        <Button size="icon" variant="ghost" onClick={() => saveEdit(task.id)}><Save className="h-4 w-4"/></Button>
                        <Button size="icon" variant="ghost" onClick={cancelEdit}><X className="h-4 w-4"/></Button>
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
