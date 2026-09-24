/**
 * Types for Mahi AI Informational and Legal Pages System
 */

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  summary: string;
  tags: string[];
}

export interface TutorialCard {
  id: string;
  title: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: string[];
  description: string;
}

export interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  features: string[];
  improvements: string[];
  futurePlanned: string[];
}

export interface FeatureDetail {
  id: string;
  title: string;
  category: string;
  badge: string;
  tagline: string;
  description: string;
  highlights: string[];
  techDetails: string;
  iconName: string;
}

export interface HowToUseItem {
  id: string;
  title: string;
  audience: string;
  duration: string;
  overview: string;
  prerequisites: string[];
  steps: {
    stepNumber: number;
    heading: string;
    description: string;
    tip?: string;
  }[];
  proTips: string[];
}

export type GameType = 'none';

export type StudySubject = 'school' | 'competitive' | 'coding' | 'languages' | 'general';

export interface FlashcardItem {
  id: string;
  question: string;
  answer: string;
  topic: string;
}

export interface StudySessionStats {
  minutesStudied: number;
  completedPomodoros: number;
  streakDays: number;
}
