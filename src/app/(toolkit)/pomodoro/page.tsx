'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Settings, Bell } from 'lucide-react';

const WORK_MINS = 25;
const SHORT_BREAK_MINS = 5;
const LONG_BREAK_MINS = 15;

export default function PomodoroPage() {
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [minutes, setMinutes] = useState(WORK_MINS);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const switchMode = useCallback((newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setIsActive(false);
    setMode(newMode);
    switch (newMode) {
      case 'work':
        setMinutes(WORK_MINS);
        break;
      case 'shortBreak':
        setMinutes(SHORT_BREAK_MINS);
        break;
      case 'longBreak':
        setMinutes(LONG_BREAK_MINS);
        break;
    }
    setSeconds(0);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            if (audioRef.current) {
                audioRef.current.play();
            }

            if (mode === 'work') {
              const newCycles = cycles + 1;
              setCycles(newCycles);
              if (newCycles % 4 === 0) {
                switchMode('longBreak');
              } else {
                switchMode('shortBreak');
              }
            } else {
              switchMode('work');
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval!);
    }
    return () => clearInterval(interval!);
  }, [isActive, seconds, minutes, mode, cycles, switchMode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    switchMode(mode);
  };

  const totalSeconds = minutes * 60 + seconds;
  const initialTotalSeconds = (
    mode === 'work' ? WORK_MINS : mode === 'shortBreak' ? SHORT_BREAK_MINS : LONG_BREAK_MINS
  ) * 60;
  const progress = ((initialTotalSeconds - totalSeconds) / initialTotalSeconds) * 100;
  
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  useEffect(() => {
    document.title = `${timeDisplay} - ${mode === 'work' ? 'Work' : 'Break'} | StudentKit`;
  }, [timeDisplay, mode]);

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Pomodoro Timer</h1>
        <p className="text-muted-foreground mt-1">
          Boost your productivity by breaking down work into focused intervals.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <Tabs value={mode} onValueChange={(value) => switchMode(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="work">Work</TabsTrigger>
              <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
              <TabsTrigger value="longBreak">Long Break</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-8 py-16">
          <div className="relative h-64 w-64">
            <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                    className="stroke-current text-muted"
                    strokeWidth="4"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                ></circle>
                <circle
                    className="stroke-current text-primary transition-all duration-1000 ease-linear"
                    strokeWidth="4"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                    transform="rotate(-90 50 50)"
                ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-7xl font-bold font-mono tracking-tighter">{timeDisplay}</h2>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <div className="flex items-center justify-center gap-4">
            <Button onClick={toggleTimer} size="lg" className="w-40">
              {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
              {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button onClick={resetTimer} variant="outline" size="icon">
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Cycles completed: {cycles}</p>
        </CardFooter>
      </Card>
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
    </div>
  );
}
