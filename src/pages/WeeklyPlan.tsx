import React, { useState, useEffect } from 'react';
import { weeklyPlanService, challengeService, Challenge, WeeklyPlan as WeeklyPlanType } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { Calendar, Trophy, Check, Loader2, Award, Zap } from 'lucide-react';

export const WeeklyPlan: React.FC = () => {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanType | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [savingTarget, setSavingTarget] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [optInLoading, setOptInLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [wp, chgList, ucList] = await Promise.all([
        weeklyPlanService.get(),
        challengeService.getAll(),
        challengeService.getUserChallenges()
      ]);
      setWeeklyPlan(wp);
      setChallenges(chgList);
      setUserChallenges(ucList);
    } catch (err) {
      console.error("Failed to load weekly setup criteria", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTargetChange = async (target: number) => {
    setSavingTarget(true);
    setSuccessMsg(null);
    try {
      const updated = await weeklyPlanService.update(target);
      setWeeklyPlan(updated);
      setSuccessMsg(`Weekly target updated to ${target} workouts.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Failed to update target count", err);
    } finally {
      setSavingTarget(false);
    }
  };

  const handleJoinChallenge = async (chgId: string) => {
    setOptInLoading(chgId);
    try {
      await challengeService.optIn(chgId);
      await loadData();
    } catch (err) {
      console.error("Failed to opt-in into challenge", err);
    } finally {
      setOptInLoading(null);
    }
  };

  const targets = [2, 3, 4, 5];

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div 
          className="p-5 rounded-2xl border border-border"
          style={{ background: 'var(--card)' }}
        >
          <h1 className="text-lg font-black tracking-tight text-foreground">Weekly Workout Target</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Select your target workout count and complete challenges.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Target manager */}
            <div className="md:col-span-2 space-y-6">
              
              <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground text-sm">Target Workouts Count</h3>
                </div>

                <p className="text-xs text-muted-foreground leading-normal">
                  Select the number of workouts you aim to log this week. Complete the target to earn a weekly 50 XP bonus.
                </p>

                {successMsg && (
                  <div className="p-3 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-xl">
                    {successMsg}
                  </div>
                )}

                {savingTarget && (
                  <div className="flex items-center gap-2 text-xs text-primary font-mono">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating target...
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  {targets.map(num => (
                    <button
                      type="button"
                      key={num}
                      disabled={savingTarget}
                      onClick={() => handleTargetChange(num)}
                      className={`py-4 px-2 rounded-xl text-center border font-bold transition-all flex flex-col items-center gap-1.5 active:scale-[0.97] ${
                        weeklyPlan?.targetCount === num
                          ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                          : 'border-border bg-muted/10 hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="text-lg font-black">{num}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider">Session{num > 1 ? 's' : ''}</span>
                    </button>
                  ))}
                </div>

                {weeklyPlan && (
                  <div className="p-4 rounded-xl border border-border text-xs space-y-2 bg-muted/5">
                    <span className="font-bold text-muted-foreground">Weekly Target Status:</span>
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-muted-foreground">Logged workouts this week:</span>
                      <span className="font-black text-primary">{weeklyPlan.currentCount} of {weeklyPlan.targetCount}</span>
                    </div>
                    {weeklyPlan.currentCount >= weeklyPlan.targetCount ? (
                      <p className="text-primary font-bold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Target complete. Weekly bonus unlocked!
                      </p>
                    ) : (
                      <p className="text-muted-foreground font-medium">Continue logging your physical activities to hit your target.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Challenges list */}
              <div className="space-y-4">
                <h3 className="font-black text-foreground text-sm tracking-tight flex items-center gap-2">
                  <Trophy className="h-4.5 w-4.5 text-primary" />
                  Active Challenges
                </h3>

                <div className="space-y-3">
                  {challenges.map(chg => {
                    const userProgress = userChallenges.find(uc => uc.challengeId === chg.id);
                    const isJoined = !!userProgress;
                    const isCompleted = userProgress?.status === 'completed';

                    return (
                      <div 
                        key={chg.id} 
                        className="p-5 rounded-2xl border border-border bg-card flex justify-between items-start gap-4"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-foreground truncate">{chg.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{chg.description}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-3 text-[9px] font-bold">
                            <span className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Award className="h-2.5 w-2.5" />
                              +{chg.xpReward} XP Reward
                            </span>
                            <span className="text-muted-foreground font-mono">End: {chg.endDate}</span>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl flex items-center gap-1 leading-none">
                              <Check className="h-3 w-3" /> Completed
                            </span>
                          ) : isJoined ? (
                            <div className="text-right whitespace-nowrap">
                              <span className="text-[10px] font-bold text-foreground bg-muted/20 border border-border px-2.5 py-1 rounded-lg">
                                Progress: {userProgress.progress} / {chg.targetWorkouts}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleJoinChallenge(chg.id)}
                              disabled={optInLoading === chg.id}
                              className="px-3 py-1.5 whitespace-nowrap text-[10px] font-bold bg-foreground text-background rounded-xl hover:opacity-90 transition-all disabled:opacity-40 active:scale-95"
                            >
                              {optInLoading === chg.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Join'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Week progression stats banner */}
            <div className="space-y-6">
              <div 
                className="p-6 rounded-2xl border border-border space-y-3 relative overflow-hidden"
                style={{ background: 'var(--card)' }}
              >
                <div className="absolute -bottom-6 -left-6 text-primary/5 opacity-40">
                  <Award className="h-28 w-28" />
                </div>

                <div className="relative space-y-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-xs tracking-tight text-foreground uppercase tracking-widest leading-none">Current Plan Progress</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You have tracked <strong className="text-foreground">{weeklyPlan?.currentCount || 0}</strong> of <strong className="text-foreground">{weeklyPlan?.targetCount || 0}</strong> target sessions scheduled for this week.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </PageContainer>
  );
};
