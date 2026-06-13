import React, { useState, useEffect } from 'react';
import { NutritionProfile } from '../types';
import { Loader2 } from 'lucide-react';

interface NutritionProfileFormProps {
  initialProfile: NutritionProfile;
  saving: boolean;
  onSave: (profile: Partial<NutritionProfile>) => Promise<void>;
}

export const NutritionProfileForm: React.FC<NutritionProfileFormProps> = ({
  initialProfile,
  saving,
  onSave
}) => {
  const [weightKg, setWeightKg] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [activityLevel, setActivityLevel] = useState<string>('');
  const [dietPreference, setDietPreference] = useState<string>('');
  const [allergyText, setAllergyText] = useState<string>('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setWeightKg(initialProfile.weightKg?.toString() || '');
    setHeightCm(initialProfile.heightCm?.toString() || '');
    setAge(initialProfile.age?.toString() || '');
    setGender(initialProfile.gender || '');
    setGoal(initialProfile.goal || '');
    setActivityLevel(initialProfile.activityLevel || '');
    setDietPreference(initialProfile.dietPreference || '');
    setAllergyText(initialProfile.allergies?.join(', ') || '');
  }, [initialProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    const parsedWeight = parseFloat(weightKg);
    const parsedHeight = parseFloat(heightCm);
    const parsedAge = parseInt(age, 10);

    // Frontend validations matching typical bounds
    if (!weightKg || isNaN(parsedWeight) || parsedWeight < 20 || parsedWeight > 500) {
      setError('Weight must be between 20 kg and 500 kg.');
      return;
    }
    if (!heightCm || isNaN(parsedHeight) || parsedHeight < 50 || parsedHeight > 280) {
      setError('Height must be between 50 cm and 280 cm.');
      return;
    }
    if (!age || isNaN(parsedAge) || parsedAge < 10 || parsedAge > 120) {
      setError('Age must be between 10 and 120.');
      return;
    }
    if (!gender) {
      setError('Please select a gender.');
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

    const parsedAllergies = allergyText
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    try {
      await onSave({
        weightKg: parsedWeight,
        heightCm: parsedHeight,
        age: parsedAge,
        gender,
        goal,
        activityLevel,
        dietPreference: dietPreference || null,
        allergies: parsedAllergies
      });
      setSuccess('Nutrition profile updated successfully.');
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating profile.');
    }
  };

  return (
    <div
      className="p-6 rounded-2xl border border-border"
      style={{ background: 'var(--card)' }}
    >
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Nutrition Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/15 border border-destructive/20 text-destructive text-xs rounded-xl font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-primary/15 border border-primary/20 text-primary text-xs rounded-xl font-medium">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="weightKg" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Weight (kg)
            </label>
            <input
              id="weightKg"
              type="number"
              step="any"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. 70"
            />
          </div>

          <div>
            <label htmlFor="heightCm" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Height (cm)
            </label>
            <input
              id="heightCm"
              type="number"
              step="any"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. 175"
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Age (years)
            </label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. 21"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="gender" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="goal" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Goal
            </label>
            <select
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select Goal</option>
              <option value="lose_weight">Lose weight</option>
              <option value="maintain_weight">Maintain weight</option>
              <option value="gain_muscle">Gain muscle</option>
              <option value="improve_fitness">Improve fitness</option>
            </select>
          </div>

          <div>
            <label htmlFor="activityLevel" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Activity Level
            </label>
            <select
              id="activityLevel"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select Activity</option>
              <option value="sedentary">Sedentary (desk job)</option>
              <option value="light">Lightly active (1-2 days/week)</option>
              <option value="moderate">Moderately active (3-5 days/week)</option>
              <option value="active">Active (6-7 days/week)</option>
              <option value="very_active">Very active (athlete/heavy manual labor)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dietPreference" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Dietary Preference (Optional)
            </label>
            <select
              id="dietPreference"
              value={dietPreference}
              onChange={(e) => setDietPreference(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">None / Anything</option>
              <option value="vegan">Vegan</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="low-carb">Low Carb / Keto</option>
            </select>
          </div>

          <div>
            <label htmlFor="allergies" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Allergies (Optional, comma separated)
            </label>
            <input
              id="allergies"
              type="text"
              value={allergyText}
              onChange={(e) => setAllergyText(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. peanut, dairy, egg"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
