import { Subject } from './homework';

export interface DashboardStats {
  total_homework: number;
  total_practice_tests: number;
  total_flashcard_sets: number;
  avg_practice_score: number;
  study_streak_days: number;
  total_study_time_minutes: number;
}

export interface SubjectBreakdown {
  subject: Subject;
  count: number;
  percentage: number;
}

export interface ActivityItem {
  id: string;
  type: 'homework' | 'practice' | 'flashcard';
  title: string;
  subject: Subject;
  created_at: string;
  score?: number;
}

export interface WeeklyActivity {
  day: string;
  homework: number;
  practice: number;
  flashcards: number;
}

export interface PerformanceTrend {
  date: string;
  score: number;
  subject: Subject;
}

export interface DashboardData {
  stats: DashboardStats;
  subject_breakdown: SubjectBreakdown[];
  recent_activities: ActivityItem[];
  weekly_activity: WeeklyActivity[];
  performance_trends: PerformanceTrend[];
}
