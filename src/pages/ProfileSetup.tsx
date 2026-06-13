import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { nutritionService } from '../services/nutritionService';
import { Dumbbell, Loader2, AlertCircle } from 'lucide-react';

export const ProfileSetup: React.FC = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [activityLevel, setActivityLevel] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAge = parseInt(age, 10);
    const parsedHeight = parseFloat(height);
    const parsedWeight = parseFloat(weight);

    // Form validations matching system boundaries
    if (!age || isNaN(parsedAge) || parsedAge < 10 || parsedAge > 120) {
      setError('Age must be between 10 and 120.');
      return;
    }
    if (!gender) {
      setError('Please select a gender.');
      return;
    }
    if (!height || isNaN(parsedHeight) || parsedHeight < 50 || parsedHeight > 280) {
      setError('Height must be between 50 cm and 280 cm.');
      return;
    }
    if (!weight || isNaN(parsedWeight) || parsedWeight < 20 || parsedWeight > 500) {
      setError('Weight must be between 20 kg and 500 kg.');
      return;
    }
    if (!goal) {
      setError('Please select a goal.');
      return;
    }
    if (!activityLevel) {
      setError('Please select an activity level.');
      return;
    }

    setSaving(true);
    try {
      // Save stats to user profile
      const res = await nutritionService.updateProfile({
        age: parsedAge,
        gender,
        heightCm: parsedHeight,
        weightKg: parsedWeight,
        goal,
        activityLevel
      });

      if (res.success) {
        // Update auth state/user cache
        await refreshUser();
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Failed to save profile setup', err);
      setError(err.message || 'An error occurred while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 border-t-4 border-primary">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-md">
          <Dumbbell className="h-6 w-6" />
        </div>
        
        <h2 className="mt-4 font-sans font-extrabold text-3xl tracking-tight text-foreground">
          Complete Your Profile
        </h2>
        
        <p className="mt-2 text-xs text-muted-foreground font-semibold">
          Set up your profile details for estimated targets and workout guidance.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-sm rounded-2xl border border-border sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 border border-red-500/20 bg-red-500/10 text-red-400 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Age (Years)
                </label>
                <input
                  id="age"
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 21"
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-input-background focus:border-primary outline-none text-foreground"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Gender
                </label>
                <select
                  id="gender"
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-input-background focus:border-primary outline-none text-foreground"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="height" className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Height (cm)
                </label>
                <input
                  id="height"
                  type="number"
                  step="any"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 175"
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-input-background focus:border-primary outline-none text-foreground"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Weight (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  step="any"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 70"
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-input-background focus:border-primary outline-none text-foreground"
                />
              </div>
            </div>

            <div>
              <label htmlFor="goal" className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                Primary Goal
              </label>
              <select
                id="goal"
                required
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-input-background focus:border-primary outline-none text-foreground"
              >
                <option value="">Select Goal</option>
                <option value="lose_weight">Lose weight</option>
                <option value="maintain_weight">Maintain weight</option>
                <option value="gain_muscle">Gain muscle</option>
                <option value="improve_fitness">Improve fitness</option>
              </select>
            </div>

            <div>
              <label htmlFor="activityLevel" className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                Activity Level
              </label>
              <select
                id="activityLevel"
                required
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-input-background focus:border-primary outline-none text-foreground"
              >
                <option value="">Select Activity</option>
                <option value="sedentary">Sedentary (desk job)</option>
                <option value="light">Lightly active (1-2 days/week)</option>
                <option value="moderate">Moderately active (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very active (athlete/heavy manual labor)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-primary-foreground transition-all bg-primary hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save and Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
