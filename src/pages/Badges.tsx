import React, { useState, useEffect } from 'react';
import { gamificationService, BadgeStatus, GamificationSummary } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { Award, Zap, Flame, Lock, CheckCircle, Loader2, Trophy } from 'lucide-react';

export const Badges: React.FC = () => {
  const [summary, setSummary] = useState<GamificationSummary | null>(null);
  const [badges, setBadges] = useState<BadgeStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGamification() {
      try {
        const [gs, bs] = await Promise.all([
          gamificationService.getSummary(),
          gamificationService.getBadges()
        ]);
        setSummary(gs);
        setBadges(bs);
      } catch (err) {
        console.error("Failed to load gamification status", err);
      } finally {
        setLoading(false);
      }
    }
    loadGamification();
  }, []);

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-950 flex items-center gap-2">
            <Award className="h-5.5 w-5.5 text-teal-600" />
            Your Milestone Badges & Rewards
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Celebrate your habit commitment and efforts. Simple unlocks at your own speed.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Gamification summary left banner */}
            <div className="space-y-4">
              
              {summary && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-650 border border-teal-100 shadow-2xs">
                    <Trophy className="h-8 w-8 text-teal-600" />
                  </div>

                  <div>
                    <h3 className="font-heading font-black text-2xl tracking-tight text-gray-950">Level {summary.level}</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase mt-1 tracking-widest">Active Rank Status</p>
                  </div>

                  {/* Meter to next rank */}
                  <div className="border-t border-gray-50 pt-4 text-left">
                    <div className="flex justify-between text-xs text-gray-700 font-mono mb-1.5 font-bold">
                      <span>XP Progress</span>
                      <span>{summary.xp % 100} / 100 XP</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="bg-teal-600 h-full rounded-full"
                        style={{ width: `${summary.xp % 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 text-center font-mono font-medium lowercase">
                      {100 - (summary.xp % 100)} xp points away from level {summary.level + 1}
                    </p>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-4 text-xs">
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Total XP</p>
                      <p className="text-base font-extrabold mt-1 text-gray-800 font-mono">{summary.xp} XP</p>
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Unlocks</p>
                      <p className="text-base font-extrabold mt-1 text-teal-700 font-mono">{summary.badgesCount} / {badges.length}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Badges list right side */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-gray-950 font-extrabold text-base tracking-tight">Milestone Checklist</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badges.map(badge => {
                  return (
                    <div 
                      key={badge.id} 
                      className={`p-5 rounded-2xl border transition-all flex gap-4 items-start ${
                        badge.unlocked
                          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900 shadow-2xs'
                          : 'bg-white border-gray-100 text-gray-700'
                      }`}
                    >
                      {/* Icon container */}
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl border ${
                        badge.unlocked
                          ? 'bg-emerald-100 border-emerald-250 text-emerald-800 shadow-sm'
                          : 'bg-gray-50 border-gray-100 text-gray-400'
                      }`}>
                        {badge.unlocked ? (
                          <Award className="h-5.5 w-5.5 text-emerald-700 fill-emerald-50" />
                        ) : (
                          <Lock className="h-4.5 w-4.5 text-gray-400" />
                        )}
                      </span>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold leading-tight text-gray-950">{badge.name}</h4>
                          {badge.unlocked && (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-normal font-medium">{badge.description}</p>
                        
                        {badge.unlocked ? (
                          <p className="text-[10px] text-emerald-750 font-semibold font-mono uppercase mt-2">
                            Unlocked: {new Date(badge.unlockedAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        ) : (
                          <span className="inline-block text-[9px] uppercase tracking-wider font-extrabold text-gray-400 font-mono mt-2 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-md">
                            Locked Status
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </PageContainer>
  );
};
