import React, { useState, useEffect } from 'react';
import { gamificationService, BadgeStatus, GamificationSummary } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { Award, Zap, Lock, CheckCircle, Loader2, Trophy } from 'lucide-react';

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
        <div 
          className="p-5 rounded-2xl border border-border"
          style={{ background: 'var(--card)' }}
        >
          <h1 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Milestone Achievements
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Celebrate your habit commitment and unlock milestone achievements at your own pace.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Gamification summary left banner */}
            <div className="space-y-4">
              {summary && (
                <div 
                  className="p-6 rounded-2xl border border-border space-y-5 text-center"
                  style={{ background: 'var(--card)' }}
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>

                  <div>
                    <h3 className="font-black text-2xl tracking-tight text-foreground">Level {summary.level}</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1 tracking-widest">Active Rank Status</p>
                  </div>

                  {/* Meter to next rank */}
                  <div className="border-t border-border pt-4 text-left">
                    <div className="flex justify-between text-[11px] text-muted-foreground font-mono mb-1.5 font-bold">
                      <span>XP Progress</span>
                      <span className="text-foreground">{summary.xp % 100} / 100 XP</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${summary.xp % 100}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-2 text-center font-mono">
                      {100 - (summary.xp % 100)} XP to Level {summary.level + 1}
                    </p>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-2 gap-2 border-t border-border pt-4 text-xs">
                    <div className="bg-muted/10 p-2.5 rounded-xl border border-border">
                      <p className="text-muted-foreground font-bold uppercase tracking-wider text-[9px]">Total XP</p>
                      <p className="text-xs font-black mt-1 text-foreground font-mono">{summary.xp} XP</p>
                    </div>

                    <div className="bg-muted/10 p-2.5 rounded-xl border border-border">
                      <p className="text-muted-foreground font-bold uppercase tracking-wider text-[9px]">Unlocks</p>
                      <p className="text-xs font-black mt-1 text-primary font-mono">{summary.badgesCount} / {badges.length}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Badges list right side */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-foreground font-black text-sm tracking-tight">Milestone Checklist</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badges.map(badge => {
                  return (
                    <div 
                      key={badge.id} 
                      className={`p-5 rounded-2xl border transition-all flex gap-4 items-start ${
                        badge.unlocked
                          ? 'bg-primary/5 border-primary/20 text-foreground shadow-2xs'
                          : 'bg-card border-border text-muted-foreground'
                      }`}
                    >
                      {/* Icon container */}
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border flex-shrink-0 ${
                        badge.unlocked
                          ? 'bg-primary/10 border-primary/20 text-primary shadow-sm'
                          : 'bg-muted/10 border-border text-muted-foreground/30'
                      }`}>
                        {badge.unlocked ? (
                          <Award className="h-5.5 w-5.5 text-primary" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground/45" />
                        )}
                      </span>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs font-bold leading-tight ${badge.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {badge.name}
                          </h4>
                          {badge.unlocked && (
                            <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{badge.description}</p>
                        
                        {badge.unlocked ? (
                          <p className="text-[9px] text-primary font-bold font-mono uppercase mt-2">
                            Unlocked: {new Date(badge.unlockedAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        ) : (
                          <span className="inline-block text-[8px] uppercase tracking-wider font-bold text-muted-foreground font-mono mt-2 bg-muted/10 border border-border px-1.5 py-0.5 rounded-md">
                            Locked
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
