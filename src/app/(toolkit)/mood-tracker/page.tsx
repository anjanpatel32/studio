
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getFirestore, collection, onSnapshot, addDoc, doc, query, where, orderBy, serverTimestamp, limit, Timestamp } from 'firebase/firestore';
import { getAuth, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Smile, Frown, Meh, Laugh, Angry, History, Calendar, BarChart2 } from 'lucide-react';
import { format, subDays, startOfWeek, startOfDay, endOfDay } from 'date-fns';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Mood = 'ecstatic' | 'happy' | 'neutral' | 'sad' | 'angry';
type MoodLog = {
  id: string;
  mood: Mood;
  createdAt: Timestamp;
  uid: string;
};

const moodOptions: { mood: Mood; icon: React.ElementType; color: string; label: string }[] = [
  { mood: 'ecstatic', icon: Laugh, color: 'text-green-500', label: 'Ecstatic' },
  { mood: 'happy', icon: Smile, color: 'text-lime-500', label: 'Happy' },
  { mood: 'neutral', icon: Meh, color: 'text-yellow-500', label: 'Neutral' },
  { mood: 'sad', icon: Frown, color: 'text-blue-500', label: 'Sad' },
  { mood: 'angry', icon: Angry, color: 'text-red-500', label: 'Angry' },
];

export default function MoodTrackerPage() {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [todaysLog, setTodaysLog] = useState<MoodLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const auth = getAuth(app);
  const db = getFirestore(app);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const todayStart = startOfDay(new Date());
      
      const q = query(
        collection(db, "moodLogs"), 
        where("uid", "==", user.uid), 
        orderBy("createdAt", "desc"),
        limit(30) // Fetch last 30 days for history
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const logsData: MoodLog[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MoodLog));
        setMoodLogs(logsData);
        
        const todayLog = logsData.find(log => log.createdAt && log.createdAt.toDate() >= todayStart);
        setTodaysLog(todayLog || null);

        setLoading(false);
      }, (error) => {
        console.error("Error fetching mood logs: ", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setMoodLogs([]);
      setLoading(false);
    }
  }, [user, db]);

  const handleLogMood = async (mood: Mood) => {
    if (!user || todaysLog) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'moodLogs'), {
        mood,
        createdAt: serverTimestamp(),
        uid: user.uid,
      });
      toast({
        title: 'Mood Logged',
        description: `Your mood has been logged as ${mood}.`,
      });
    } catch (error) {
      console.error("Error logging mood:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to log your mood. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const moodChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i)).reverse();
    const data = last7Days.map(day => {
      const dayLogs = moodLogs.filter(log => log.createdAt && format(log.createdAt.toDate(), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
      const moodsCount = dayLogs.reduce((acc, log) => {
        acc[log.mood] = (acc[log.mood] || 0) + 1;
        return acc;
      }, {} as Record<Mood, number>);

      return {
        name: format(day, 'EEE'),
        ...moodsCount,
      };
    });
    return data;
  }, [moodLogs]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Mood Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Log your daily mood to understand your emotional patterns.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How are you feeling today?</CardTitle>
              <CardDescription>
                {todaysLog ? 'You have already logged your mood for today.' : 'Select a mood to log it for today.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                 <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
              ) : todaysLog ? (
                <Alert>
                    <Smile className="h-4 w-4" />
                    <AlertTitle>Today's Mood: {moodOptions.find(m => m.mood === todaysLog.mood)?.label}</AlertTitle>
                    <AlertDescription>
                        Come back tomorrow to log your mood again.
                    </AlertDescription>
                </Alert>
              ) : (
                <div className="flex justify-around items-center flex-wrap gap-4">
                  {moodOptions.map(({ mood, icon: Icon, color, label }) => (
                    <Button
                      key={mood}
                      variant="ghost"
                      className="flex flex-col h-24 w-24 gap-2 border-2 border-transparent hover:border-primary"
                      onClick={() => handleLogMood(mood)}
                      disabled={isSubmitting}
                    >
                      <Icon className={`h-10 w-10 ${color}`} />
                      <span className="text-muted-foreground">{label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
             {isSubmitting && <CardFooter><Loader2 className="h-5 w-5 animate-spin"/></CardFooter>}
          </Card>

           <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5"/>Weekly Mood Overview</CardTitle>
                <CardDescription>A look at your mood distribution over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={moodChartData}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        {moodOptions.map(m => (
                          <Bar key={m.mood} dataKey={m.mood} stackId="a" fill={`var(--chart-${moodOptions.indexOf(m) + 1})`} radius={[4, 4, 0, 0]} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/>Mood History</CardTitle>
              <CardDescription>Your recent mood logs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : moodLogs.length > 0 ? (
                moodLogs.map(log => {
                    const moodInfo = moodOptions.find(m => m.mood === log.mood);
                    if (!moodInfo) return null;
                    const { icon: Icon, color, label } = moodInfo;
                    return (
                        <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <Icon className={`h-6 w-6 ${color}`} />
                                <div>
                                    <p className="font-semibold">{label}</p>
                                    <p className="text-xs text-muted-foreground">{log.createdAt ? format(log.createdAt.toDate(), 'MMMM d, yyyy') : 'Just now'}</p>
                                </div>
                            </div>
                        </div>
                    );
                })
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-muted-foreground">No history</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Log your mood to see your history here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
