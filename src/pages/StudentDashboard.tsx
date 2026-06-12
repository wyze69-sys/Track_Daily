import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  workoutService,
  weeklyPlanService,
  gamificationService,
  insightService,
  feedbackService,
  announcementService,
  Workout,
  WeeklyPlan,
  GamificationSummary,
  Announcement
} from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import {
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  Award,
  PlusCircle,
  Clock,
  History,
  Send,
  Loader2,
  Calendar,
  Zap,
  ArrowRight,
  Smile,
  Megaphone
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  // States
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [gamification, setGamification] = useState<GamificationSummary | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [insight, setInsight] = useState<string>('');
  
  // Interactive UI states
  const [feedbackContent, setFeedbackContent] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    try {
      const [workoutsList, plan, gs, anns, latestInsight] = await Promise.all([
        workoutService.getRecent(),
        weeklyPlanService.get(),
        gamificationService.getSummary(),
        announcementService.getAll(),
        insightService.getLatest()
      ]);
      setWorkouts(workoutsList);
      setWeeklyPlan(plan);
      setGamification(gs);
      setAnnouncements(anns.slice(0, 2)); // Show top 2 announcements
      setInsight(latestInsight.text);
    } catch (err) {
      console.error("Failed to fetch student dashboard data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRepeatLast = async () => {
    if (workouts.length === 0) {
      setActionMessage({ text: "No previous workout logs found. Use 'Log Workout' to create one!", type: 'error' });
      return;
    }
    
    setActionLoading(true);
    setActionMessage(null);
    try {
      const result = await workoutService.repeatLast();
      setActionMessage({
        text: `Repeated last workout! Earned +${result.xpEarned} XP!`,
        type: 'success'
      });
      loadData();
    } catch (err: any) {
      setActionMessage({ text: err?.message || "Failed to repeat last workout.", type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const generateAIInsight = async () => {
    setGeneratingInsight(true);
    try {
      const fresh = await insightService.generate();
      setInsight(fresh.text);
    } catch (err) {
      console.error("Failed to generate AI insight", err);
    } finally {
      setGeneratingInsight(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;

    setSubmittingFeedback(true);
    setFeedbackSuccess(false);
    try {
      await feedbackService.submit(feedbackContent);
      setFeedbackContent('');
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to log feedback", err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood?.toLowerCase()) {
      case 'energetic': return '⚡';
      case 'accomplished': return '🏆';
      case 'satisfied': return '😌';
      case 'tired': return '😴';
      case 'exhausted': return '🥵';
      default: return '💪';
    }
  };

  // Streak conditions for Comeback messaging
  const currentStreak = gamification?.currentStreak || 0;
  
  return (
    <PageContainer>
      <div className="space-y-6">
        
        {/* Top welcome greeting header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-xs gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-950">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Ready to invest 1 minute? Show up for yourself today.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/quick-log"
              className="px-4 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              Quick Log Workout
            </Link>
            <button
              onClick={handleRepeatLast}
              disabled={actionLoading || workouts.length === 0}
              className="px-4 py-2 text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              <RotateCcw className="h-4.5 w-4.5" />
              Repeat Last Workout
            </button>
          </div>
        </div>

        {/* Info alerts */}
        {actionMessage && (
          <div className={`p-4 rounded-xl border text-sm font-medium ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {actionMessage.text}
          </div>
        )}

        {/* Main interactive grid section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Col 1 & 2: Habit, AI, Announcements, Timeline */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Gamified Weekly Habit Board */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 font-bold text-sm tracking-tight flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  Weekly Target Consistency
                </h3>
                <Link to="/weekly-plan" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                  Update Target
                </Link>
              </div>

              {weeklyPlan && (
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>Target Completed: {weeklyPlan.currentCount} of {weeklyPlan.targetCount} Workouts</span>
                    <span>{Math.round((weeklyPlan.currentCount / weeklyPlan.targetCount) * 100)}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (weeklyPlan.currentCount / weeklyPlan.targetCount) * 100)}%` }}
                    />
                  </div>

                  {weeklyPlan.currentCount >= weeklyPlan.targetCount ? (
                    <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-teal-800 text-xs font-semibold flex items-center gap-1.5">
                      <Trophy className="h-4 w-4 shrink-0 fill-teal-100" />
                      Congratulations! You smashed your weekly workout target (+50 XP bonus claimed).
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 font-medium font-mono">
                      Log {weeklyPlan.targetCount - weeklyPlan.currentCount} more workouts to unlock this week's +50 XP target bonus!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* AI Weekly Insight Reflection (Gemini) */}
            <div className="bg-gradient-to-br from-teal-900 to-emerald-950 p-6 rounded-2xl text-white shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-800 text-teal-200">
                    <Sparkles className="h-4 w-4 fill-teal-200" />
                  </span>
                  <h3 className="font-bold text-sm tracking-tight text-white">AI Weekly Habits Reflection</h3>
                </div>
                <button
                  type="button"
                  onClick={generateAIInsight}
                  disabled={generatingInsight}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                >
                  {generatingInsight ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                  Refresh Insight
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                {generatingInsight ? (
                  <div className="flex flex-col items-center justify-center py-4 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
                    <p className="text-xs text-teal-200 font-mono">Asking Gemini Coach...</p>
                  </div>
                ) : (
                  <p className="text-sm font-medium leading-relaxed text-teal-50 font-sans">
                    {insight || "Logging your workouts helps build amazing routines. Click Refresh Insight to query Gemini for personalized advice on your consistency!"}
                  </p>
                )}
              </div>
              <p className="text-[10px] text-teal-300 mt-2 font-mono">Powered safely by Google Gemini API. Non-medical student encouragement only.</p>
            </div>

            {/* Announcements Panel */}
            {announcements.length > 0 && (
              <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-2xl">
                <h3 className="text-orange-950 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Megaphone className="h-4 w-4 text-orange-600" />
                  Global Campus News
                </h3>
                <div className="space-y-3">
                  {announcements.map(ann => (
                    <div key={ann.id} className="border-l-2 border-orange-400 pl-3">
                      <h4 className="text-xs font-bold text-gray-900">{ann.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workout Journal Timeline */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-gray-950 font-extrabold text-base tracking-tight flex items-center gap-2">
                  <History className="h-5 w-5 text-teal-600" />
                  Your Workout Journal Timeline
                </h3>
                <Link to="/history" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
                  Full History
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {workouts.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                  <PlusCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-semibold">No workouts logged yet.</p>
                  <p className="text-xs mt-1">Get started under 60 seconds with your first log!</p>
                  <Link to="/quick-log" className="mt-3 inline-block px-4 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold rounded-xl text-xs">
                    Quick Log Page
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {workouts.map((w) => (
                    <div key={w.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs hover:border-teal-150 transition-colors flex justify-between items-start">
                      <div className="flex gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xl">
                          {getMoodEmoji(w.moodAfterWorkout)}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-900">{w.workoutType} Session</h4>
                            <span className="flex items-center gap-0.5 text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full">
                              <Zap className="h-2.5 w-2.5 fill-purple-100" />
                              +{w.xpEarned} XP
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1 font-semibold">
                              <Clock className="h-3.5 w-3.5" />
                              {w.durationMinutes} min
                            </span>
                            <span>•</span>
                            <span className="font-mono">{new Date(w.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                          </div>

                          {w.note && (
                            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg mt-2 font-medium border-l border-gray-200">
                              {w.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Col 3: Streak / Comeback, level card, feedback submission */}
          <div className="space-y-6">
            
            {/* Level and XP visual Card */}
            {gamification && (
              <div className="bg-teal-700 text-white rounded-2xl p-6 shadow-sm overflow-hidden relative">
                <div className="absolute -bottom-6 -right-6 text-teal-800/30 opacity-70">
                  <Trophy className="h-32 w-32" />
                </div>

                <div className="relative space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-800 text-teal-200 text-xs font-bold shadow-xs">
                      <Award className="h-4.5 w-4.5" />
                    </span>
                    <h3 className="font-bold text-sm tracking-tight">XP Level Stats</h3>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight">Lvl {gamification.level}</span>
                    <span className="text-xs text-teal-200 font-mono">({gamification.xp} Total XP)</span>
                  </div>

                  {/* Meter to next level */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-teal-100 mb-1.5">
                      <span>XP Points to level up</span>
                      <span>{gamification.xp % 100} / 100 XP</span>
                    </div>
                    <div className="w-full h-2 bg-teal-900/40 rounded-full overflow-hidden">
                      <div 
                        className="bg-white h-full rounded-full"
                        style={{ width: `${gamification.xp % 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Streak & Comeback Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-600 fill-orange-50" />
                <h3 className="text-gray-950 font-bold text-sm tracking-tight">Consistency Streak</h3>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900">{currentStreak}</span>
                <span className="text-xs text-gray-500 font-mono">valid days</span>
              </div>

              {/* Show Comeback encouraging messages if streak is broken/0 or low */}
              {currentStreak === 0 ? (
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-orange-850 text-xs font-semibold leading-relaxed">
                  📢 <strong>Missed a day?</strong> Start again today. A 10-minute stretching session or walk still counts. Consistency beats intensity.
                </div>
              ) : currentStreak < 3 ? (
                <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-teal-800 text-xs font-medium leading-relaxed">
                  ✨ Excellent momentum! Log {3 - currentStreak} more consecutive days to secure the <strong>Consistency Starter</strong> badge!
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-medium leading-relaxed">
                  🔥 Incredible! Your streak is burning bright. Keep tracking under 60 seconds after your classes.
                </div>
              )}
            </div>

            {/* Academic Feedback Box */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <h3 className="font-bold text-sm tracking-tight text-gray-950 flex items-center gap-1.5 mb-2">
                <Send className="h-4 w-4 text-teal-600" />
                Campus Feedback Portal
              </h3>
              <p className="text-xs text-gray-500 mb-3 leading-normal">
                Submit ideas, bugs, or request custom badges directly to the administrators.
              </p>

              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <textarea
                  required
                  rows={3}
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="Can we add an 'Exam Week Survivor' badge or weightlifting categories?"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 shadow-xs focus:ring-1 focus:ring-teal-500 bg-gray-50/40"
                />

                {feedbackSuccess && (
                  <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded-lg">
                    Feedback logged. An administrator will review this soon!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingFeedback || !feedbackContent.trim()}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-900 text-white font-semibold text-xs rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40"
                >
                  {submittingFeedback ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Send className="h-3 w-3" />}
                  Send Review Note
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </PageContainer>
  );
};
