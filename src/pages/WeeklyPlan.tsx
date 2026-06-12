import React, { useState, useEffect } from 'react';
import { weeklyPlanService, challengeService, Challenge, WeeklyPlan as WeeklyPlanType } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { Calendar, Trophy, Flame, Check, Loader2, Award, Zap } from 'lucide-react';

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
      setSuccessMsg(`Your weekly workout goal is successfully updated to ${target} sessions!`);
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
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-950">Campus Weekly Habit Commitments</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Pick a target that matches your busy lecture cycle. Consistency trumps intensity.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Target manager */}
            <div className="md:col-span-2 space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  <h3 className="font-bold text-gray-950 text-sm">Select Your Workout Target</h3>
                </div>

                <p className="text-xs text-gray-550 leading-normal">
                  How many times do you plan to log exercise this term week? When you complete this number of logs, you automatically fetch a <strong>+50 XP targets completed bonus</strong>.
                </p>

                {successMsg && (
                  <div className="p-3 bg-teal-50 border border-teal-100 text-teal-800 text-xs font-semibold rounded-xl">
                    {successMsg}
                  </div>
                )}

                {savingTarget && (
                  <div className="flex items-center gap-2 text-xs text-teal-700 font-mono">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Synchronizing workout targets...
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  {targets.map(num => (
                    <button
                      type="button"
                      key={num}
                      disabled={savingTarget}
                      onClick={() => handleTargetChange(num)}
                      className={`py-4 px-2 rounded-xl text-center border font-bold transition-all flex flex-col items-center gap-1.5 ${
                        weeklyPlan?.targetCount === num
                          ? 'border-teal-500 bg-teal-600 text-white shadow-xs'
                          : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{num}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Workouts</span>
                    </button>
                  ))}
                </div>

                {weeklyPlan && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs space-y-2">
                    <span className="font-bold text-gray-700">Weekly Progress Status:</span>
                    <div className="flex justify-between items-center font-mono">
                      <span>Logged workouts so far:</span>
                      <span className="font-extrabold text-teal-800">{weeklyPlan.currentCount} of {weeklyPlan.targetCount}</span>
                    </div>
                    {weeklyPlan.currentCount >= weeklyPlan.targetCount ? (
                      <p className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Target achieved! Awesome habit.
                      </p>
                    ) : (
                      <p className="text-gray-500 leading-normal font-medium">Keep showing up to claim your targets completed rewards.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Badges / Challenges block */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-gray-950 text-base tracking-tight flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-teal-600" />
                  Active Semester Challenges
                </h3>

                <div className="space-y-3">
                  {challenges.map(chg => {
                    const userProgress = userChallenges.find(uc => uc.challengeId === chg.id);
                    const isJoined = !!userProgress;
                    const isCompleted = userProgress?.status === 'completed';

                    return (
                      <div key={chg.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-gray-900">{chg.title}</h4>
                          <p className="text-xs text-gray-500 leading-normal font-medium">{chg.description}</p>
                          <div className="flex items-center gap-3 mt-3 text-[11px] font-semibold">
                            <span className="text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Zap className="h-3 w-3 fill-purple-100" />
                              +{chg.xpReward} XP Reward
                            </span>
                            <span className="text-gray-400 font-mono">End: {chg.endDate}</span>
                          </div>
                        </div>

                        <div>
                          {isCompleted ? (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl flex items-center gap-1">
                              <Check className="h-3 w-3" /> Completed
                            </span>
                          ) : isJoined ? (
                            <div className="text-right whitespace-nowrap">
                              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg">
                                Progress: {userProgress.progress} / {chg.targetWorkouts}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleJoinChallenge(chg.id)}
                              disabled={optInLoading === chg.id}
                              className="px-3.5 py-1.5 whitespace-nowrap text-xs font-bold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40"
                            >
                              {optInLoading === chg.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Join Challenge'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Motivational Panel / Comeback helper */}
            <div className="space-y-6">
              
              <div className="bg-teal-900 text-white p-6 rounded-2xl space-y-4 shadow-xs relative overflow-hidden">
                <div className="absolute -bottom-6 -left-6 text-teal-800/20 opacity-50">
                  <Award className="h-28 w-28" />
                </div>

                <div className="relative space-y-3">
                  <Flame className="h-6 w-6 text-orange-400 fill-orange-400" />
                  <h3 className="font-extrabold text-sm tracking-tight text-white leading-none">Habit Building Secrets</h3>
                  <p className="text-xs text-teal-100 leading-normal font-sans">
                    Did you know that students who set a small <strong>2-workout target</strong> are <strong>75% more likely</strong> to maintain workouts through exam weeks than those who go in without targets?
                  </p>
                  <p className="text-[10px] text-teal-300 font-mono uppercase tracking-wider font-bold">Start small, show up often.</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </PageContainer>
  );
};
