"use client";

import { useState, useEffect } from "react";
import { CardTitle } from "@/components/ui/card";

interface TimeGreeting {
  message: string;
  period: "morning" | "afternoon" | "evening" | "night";
}

const greetings = {
  morning: [
    "Good morning! Ready to start your day?",
    "Rise and shine! Welcome back",
    "Morning! Hope you're having a great start",
    "Good morning! Let's make today productive",
    "Welcome! Starting the day strong",
    "Morning sunshine! Ready to tackle the day?",
    "Good morning! Fresh start, fresh possibilities",
    "Welcome back! The early bird catches the worm",
  ],
  afternoon: [
    "Good afternoon! Hope your day is going well",
    "Afternoon! Welcome back to productivity",
    "Good afternoon! Midday energy boost time",
    "Welcome! Making the most of your afternoon?",
    "Afternoon! Keep up the great momentum",
    "Good afternoon! Halfway through, going strong",
    "Welcome back! Afternoon productivity mode activated",
    "Good afternoon! Hope you're having a fantastic day",
  ],
  evening: [
    "Good evening! Wrapping up the day nicely",
    "Evening! Welcome to the golden hours",
    "Good evening! Still going strong",
    "Welcome! Making the most of your evening",
    "Evening! Time to wind down and reflect",
    "Good evening! Hope your day was productive",
    "Welcome back! Evening vibes are the best",
    "Good evening! Perfect time to finish strong",
  ],
  night: [
    "Good night! Burning the midnight oil?",
    "Late night welcome! You're dedicated",
    "Night owl mode activated! Welcome back",
    "Good evening! Working late or early?",
    "Welcome, night warrior! Stay focused",
    "Late night productivity! Welcome back",
    "Good night! Hope you're not overworking",
    "Welcome! The night shift begins",
  ],
};

function getTimePeriod(
  hour: number
): "morning" | "afternoon" | "evening" | "night" {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

function getTimeBasedGreeting(): TimeGreeting {
  const now = new Date();
  const hour = now.getHours();
  const period = getTimePeriod(hour);
  const messages = greetings[period];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return {
    message: randomMessage,
    period,
  };
}

export function ClientGreeting() {
  const [greeting, setGreeting] = useState<TimeGreeting | null>(null);

  useEffect(() => {
    // Set the greeting on the client side to avoid hydration mismatch
    setGreeting(getTimeBasedGreeting());
  }, []);

  // Show a fallback while loading to prevent hydration issues
  if (!greeting) {
    return <CardTitle className="text-xl">Welcome!</CardTitle>;
  }

  return <CardTitle className="text-xl">{greeting.message}</CardTitle>;
}
