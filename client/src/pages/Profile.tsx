import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService, profileService, weeklyPlanService } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { User, Shield, Check, Loader2, AlertCircle, Goal, Award } from 'lucide-react';

export const Profile: React.FC = () => {
  const { refreshUser, logout } = useAuth();
  
  // Loading & UX states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Raw fetched user details
  const [rawUser, setRawUser] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [targetWeight, setTargetWeight] = useState<number | ''>('');
  const [preferredWorkoutType, setPreferredWorkoutType] = useState('');
  const [goal, setGoal] = useState('');
  const [activityLevel, setActivityLevel] = useState<string>('');
  const [weeklyTarget, setWeeklyTarget] = useState<number>(3);

  // Load profile and weekly plan details on mount
  useEffect(() => {
    async function loadProfileData() {
      try {
        setLoading(true);
        const [meData, planData] = await Promise.all([
          authService.me(),
          weeklyPlanService.get()
        ]);

        const profile = meData.profile || meData;
        setRawUser(meData);

        setName(profile.name || profile.fullName || '');
        setAge(profile.age !== undefined && profile.age !== null ? Number(profile.age) : '');
        setGender(profile.gender || '');
        setHeight(profile.height !== undefined && profile.height !== null ? Number(profile.height) : '');
        setWeight(profile.weight !== undefined && profile.weight !== null ? Number(profile.weight) : '');
        setTargetWeight(profile.targetWeight !== undefined && profile.targetWeight !== null ? Number(profile.targetWeight) : '');
        setPreferredWorkoutType(profile.preferredWorkoutType || '');
        setGoal(profile.goal || '');
        setActivityLevel(profile.activityLevel || '');
        
        if (planData) {
          setWeeklyTarget(planData.targetCount);
        }
      } catch (err: any) {
        console.error('Failed to load profile details', err);
        setErrorMessages(['Could not retrieve profile information. Please reload the page.']);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessages([]);

    // Client-side validations
    const errors: string[] = [];
    if (!name.trim()) {
      errors.push('Full name is required.');
    }
    if (age !== '' && (age < 1 || age > 120)) {
      errors.push('Age must be between 1 and 120.');
    }
    if (height !== '' && (height < 50 || height > 280)) {
      errors.push('Height must be between 50 cm and 280 cm.');
    }
    if (weight !== '' && (weight < 20 || weight > 500)) {
      errors.push('Weight must be between 20 kg and 500 kg.');
    }
    if (targetWeight !== '' && (targetWeight < 20 || targetWeight > 500)) {
      errors.push('Target weight must be between 20 kg and 500 kg.');
    }

    if (errors.length > 0) {
      setErrorMessages(errors);
      setSaving(false);
      return;
    }

    try {
      // Save profile info
      const profilePayload = {
        name,
        age: age === '' ? null : Number(age),
        gender: gender === '' ? null : gender,
        height: height === '' ? null : Number(height),
        weight: weight === '' ? null : Number(weight),
        targetWeight: targetWeight === '' ? null : Number(targetWeight),
        preferredWorkoutType: preferredWorkoutType || null,
        goal: goal || null,
        activityLevel: activityLevel === '' ? null : activityLevel
      };

      await profileService.update(profilePayload);
      
      // Save weekly plan target
      await weeklyPlanService.update(weeklyTarget);

      // Refresh Auth Context state
      await refreshUser();
      
      setSuccessMessage('Your profile and settings have been updated successfully.');
      
      // Auto-scroll to top to see feedback
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to update profile settings', err);
      setErrorMessages([err.message || 'An unexpected error occurred while saving. Please try again.']);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Page Header */}
        <div 
          className="p-5 rounded-2xl border border-border"
          style={{ background: 'var(--card)' }}
        >
          <h1 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your personal stats, training preferences, and account configuration.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column - Account Summary Card & Actions */}
            <div className="space-y-6">
              
              {/* Account Summary Card */}
              <div 
                className="p-6 rounded-2xl border border-border text-center flex flex-col items-center relative overflow-hidden"
                style={{ background: 'var(--card)' }}
              >
                <div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center font-black text-3xl border border-primary/20 mb-4 shadow-md bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(${rawUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || 'User')}`})`,
                    backgroundSize: '100%'
                  }}
                />
                
                <h3 className="font-extrabold text-base text-foreground tracking-tight">{name || 'track_daily User'}</h3>
                <p className="text-xs text-muted-foreground mt-1 truncate max-w-full">{rawUser?.email}</p>
                
                <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border" style={{
                  borderColor: rawUser?.role === 'admin' ? 'rgba(251,191,36,0.2)' : 'rgba(163,230,53,0.2)',
                  background: rawUser?.role === 'admin' ? 'rgba(251,191,36,0.05)' : 'rgba(163,230,53,0.05)',
                  color: rawUser?.role === 'admin' ? 'var(--chart-3)' : 'var(--primary)'
                }}>
                  {rawUser?.role === 'admin' ? (
                    <>
                      <Shield className="h-3 w-3" />
                      Administrator
                    </>
                  ) : (
                    <>
                      <Award className="h-3 w-3" />
                      Standard Athlete
                    </>
                  )}
                </div>

                {/* Quick stats panel */}
                {rawUser?.gamification && (
                  <div className="w-full mt-6 pt-5 border-t border-border/60 grid grid-cols-2 gap-2 text-left">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">XP Total</span>
                      <span className="text-base font-black text-foreground">{rawUser.gamification.total_xp} XP</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Current Level</span>
                      <span className="text-base font-black text-primary">Lvl {rawUser.gamification.level}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Security & Quick Actions */}
              <div 
                className="p-5 rounded-2xl border border-border space-y-4"
                style={{ background: 'var(--card)' }}
              >
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Account Access</h3>
                
                <div>
                  <span className="text-[10px] text-muted-foreground block font-semibold">Registered Email</span>
                  <span className="text-xs font-medium text-foreground">{rawUser?.email}</span>
                </div>
                
                <div>
                  <span className="text-[10px] text-muted-foreground block font-semibold">Security Role</span>
                  <span className="text-xs font-medium text-foreground capitalize">{rawUser?.role || 'user'}</span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full py-2.5 rounded-xl border border-red-500/15 bg-red-500/10 hover:bg-red-500/15 transition-colors text-red-400 font-bold text-xs"
                  >
                    Log Out from Session
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column - Editable Profile Form */}
            <div className="md:col-span-2">
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Save Feedback Alerts */}
                {successMessage && (
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-medium text-foreground">{successMessage}</p>
                  </div>
                )}

                {errorMessages.length > 0 && (
                  <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="text-xs font-medium text-foreground space-y-1">
                      {errorMessages.map((msg, idx) => (
                        <p key={idx}>{msg}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Personal Details */}
                <div 
                  className="p-6 rounded-2xl border border-border space-y-5"
                  style={{ background: 'var(--card)' }}
                >
                  <div className="flex items-center gap-2 mb-2 pb-3 border-b border-border/40">
                    <User className="h-4.5 w-4.5 text-primary" />
                    <h3 className="font-extrabold text-sm text-foreground tracking-tight">Personal Details</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="name" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Display Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/40 font-medium"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="age" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Age (Years)
                      </label>
                      <input
                        id="age"
                        type="number"
                        min="1"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                        className="block w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/40 font-medium"
                        placeholder="Age"
                      />
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Gender
                      </label>
                      <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="block w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                      >
                        <option value="" style={{ background: 'var(--popover)' }}>Prefer not to say</option>
                        <option value="male" style={{ background: 'var(--popover)' }}>Male</option>
                        <option value="female" style={{ background: 'var(--popover)' }}>Female</option>
                        <option value="other" style={{ background: 'var(--popover)' }}>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section: Fitness Biometrics */}
                <div 
                  className="p-6 rounded-2xl border border-border space-y-5"
                  style={{ background: 'var(--card)' }}
                >
                  <div className="flex items-center gap-2 mb-2 pb-3 border-b border-border/40">
                    <Goal className="h-4.5 w-4.5 text-primary" />
                    <h3 className="font-extrabold text-sm text-foreground tracking-tight">Biometrics</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="height" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Height (cm)
                      </label>
                      <input
                        id="height"
                        type="number"
                        min="50"
                        max="280"
                        step="0.1"
                        value={height}
                        onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                        className="block w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/40 font-medium"
                        placeholder="e.g. 175"
                      />
                    </div>

                    <div>
                      <label htmlFor="weight" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Weight (kg)
                      </label>
                      <input
                        id="weight"
                        type="number"
                        min="20"
                        max="500"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                        className="block w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/40 font-medium"
                        placeholder="e.g. 70"
                      />
                      {weight === '' && (
                        <p className="text-[10px] text-yellow-500 mt-1.5 font-semibold">
                          Add your weight so track_daily can estimate calories more accurately.
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="targetWeight" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Target Weight (kg)
                      </label>
                      <input
                        id="targetWeight"
                        type="number"
                        min="20"
                        max="500"
                        step="0.1"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value === '' ? '' : Number(e.target.value))}
                        className="block w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/40 font-medium"
                        placeholder="e.g. 68"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Training Preferences */}
                <div 
                  className="p-6 rounded-2xl border border-border space-y-5"
                  style={{ background: 'var(--card)' }}
                >
                  <div className="flex items-center gap-2 mb-2 pb-3 border-b border-border/40">
                    <Goal className="h-4.5 w-4.5 text-primary" />
                    <h3 className="font-extrabold text-sm text-foreground tracking-tight">Training Preferences</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="activityLevel" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Daily Activity Level
                      </label>
                      <select
                        id="activityLevel"
                        value={activityLevel}
                        onChange={(e) => setActivityLevel(e.target.value)}
                        className="block w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                      >
                        <option value="" style={{ background: 'var(--popover)' }}>Select activity level</option>
                        <option value="sedentary" style={{ background: 'var(--popover)' }}>Sedentary</option>
                        <option value="light" style={{ background: 'var(--popover)' }}>Lightly active</option>
                        <option value="moderate" style={{ background: 'var(--popover)' }}>Moderately active</option>
                        <option value="active" style={{ background: 'var(--popover)' }}>Active</option>
                        <option value="very_active" style={{ background: 'var(--popover)' }}>Very active</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="preferredWorkoutType" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Preferred Category
                      </label>
                      <select
                        id="preferredWorkoutType"
                        value={preferredWorkoutType}
                        onChange={(e) => setPreferredWorkoutType(e.target.value)}
                        className="block w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                      >
                        <option value="" style={{ background: 'var(--popover)' }}>Select primary type</option>
                        <option value="Strength" style={{ background: 'var(--popover)' }}>Strength Training</option>
                        <option value="Cardio" style={{ background: 'var(--popover)' }}>Cardiovascular</option>
                        <option value="Mobility" style={{ background: 'var(--popover)' }}>Mobility & Recovery</option>
                        <option value="Flexibility" style={{ background: 'var(--popover)' }}>Flexibility</option>
                        <option value="Sports" style={{ background: 'var(--popover)' }}>Sports / Athletics</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="goal" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Primary Fitness Goal
                      </label>
                      <select
                        id="goal"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="block w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                      >
                        <option value="" style={{ background: 'var(--popover)' }}>Select goal</option>
                        <option value="lose_weight" style={{ background: 'var(--popover)' }}>Lose weight</option>
                        <option value="maintain_weight" style={{ background: 'var(--popover)' }}>Maintain weight</option>
                        <option value="gain_muscle" style={{ background: 'var(--popover)' }}>Gain muscle</option>
                        <option value="improve_fitness" style={{ background: 'var(--popover)' }}>Improve fitness</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section: Weekly Commitment Shortcut */}
                <div 
                  className="p-6 rounded-2xl border border-border space-y-5"
                  style={{ background: 'var(--card)' }}
                >
                  <div className="flex items-center gap-2 mb-2 pb-3 border-b border-border/40">
                    <Goal className="h-4.5 w-4.5 text-primary" />
                    <h3 className="font-extrabold text-sm text-foreground tracking-tight">Weekly Targets</h3>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Target Workout Sessions per Week
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {[2, 3, 4, 5].map((target) => (
                        <button
                          key={target}
                          type="button"
                          onClick={() => setWeeklyTarget(target)}
                          className={`py-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                            weeklyTarget === target
                              ? 'bg-primary/10 border-primary text-primary font-black scale-[1.02]'
                              : 'bg-muted border-border hover:border-muted-foreground/55 text-muted-foreground font-bold'
                          }`}
                        >
                          <span className="text-base">{target}</span>
                          <span className="text-[8px] uppercase tracking-wider mt-0.5">sessions</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
                      Setting a goal helps you stay committed. This is actively tracked inside your dashboard weekly progression view.
                    </p>
                  </div>
                </div>

                {/* Save Action */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-primary hover:bg-accent text-primary-foreground font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Updates...
                      </>
                    ) : (
                      <>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

          </div>
        )}
      </div>
    </PageContainer>
  );
};
