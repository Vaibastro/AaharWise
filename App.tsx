
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, Meal, DailyLog, ActivityLevel, Nutrients } from './types';
import { generateHealthAnalysis, analyzeMealImage, getNutrientsFromIngredients } from './services/geminiService';
import { Icons, APP_NAME } from './constants';

const Card: React.FC<{ children: React.ReactNode; className?: string; variant?: 'primary' | 'sage' | 'sky' | 'light' | 'dark' }> = ({ children, className = "", variant = 'light' }) => {
  const variantClass = {
    primary: 'bg-gradient-primary text-white',
    sage: 'bg-gradient-sage text-slate-800',
    sky: 'bg-gradient-sky text-slate-800',
    light: 'aahar-card-light',
    dark: 'bg-slate-900 dark:bg-slate-950 text-white'
  }[variant];

  return (
    <div className={`aahar-card ${variantClass} ${className}`}>
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

const SectionTitle: React.FC<{ title: string; icon?: React.ReactNode; color?: string }> = ({ title, icon, color = "text-slate-700 dark:text-slate-300" }) => (
  <h2 className={`text-sm font-black uppercase tracking-widest ${color} mb-6 flex items-center gap-3`}>
    {icon && <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">{icon}</span>}
    {title}
  </h2>
);

const NutrientProgress: React.FC<{ label: string; value: number; target: number; color: string; unit: string; icon: string }> = ({ label, value, target, color, unit, icon }) => {
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  return (
    <div className="group space-y-2">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <span className="text-lg opacity-70">{icon}</span>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-slate-800 dark:text-slate-100">{Math.round(value)}{unit}</span>
          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-tighter">/ {target}{unit}</span>
        </div>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-50 dark:border-slate-700">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out rounded-full shadow-sm`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const CoachFeedbackPanel: React.FC<{ analysis: string; onClose: () => void }> = ({ analysis, onClose }) => {
  const parsedSections = useMemo(() => {
    const rawSections = analysis.split(/###\s+/).filter(s => s.trim() !== '');
    return rawSections.map(s => {
      const lines = s.trim().split('\n');
      const headerLine = lines[0].trim();
      const separatorIndex = headerLine.indexOf(':');
      let title = headerLine;
      let inlineData = "";
      if (separatorIndex !== -1) {
        title = headerLine.substring(0, separatorIndex).trim();
        inlineData = headerLine.substring(separatorIndex + 1).trim();
      }
      const content = lines.slice(1).join('\n').trim();
      return { title: title.toUpperCase(), inlineData, content };
    });
  }, [analysis]);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <Card variant="dark" className="border-none ring-1 ring-slate-800 dark:ring-slate-700">
        <div className="flex justify-between items-start mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-xl font-black tracking-tight text-white italic">Unlocking Your Biological Potential</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-0.5">Metabolic Insight Synthesis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors no-print">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-10">
          {parsedSections.map((section, idx) => {
            if (section.title.includes('VERDICT')) {
              return (
                <div key={idx} className="bg-gradient-primary p-8 rounded-[20px] border border-white/10 relative overflow-hidden group shadow-2xl">
                  <h4 className="text-[10px] font-black text-sky-300 uppercase tracking-[0.3em] mb-2">Metabolic Status</h4>
                  <p className="text-3xl font-black leading-tight tracking-tighter text-white">{section.inlineData || 'CALCULATING...'}</p>
                  {section.content && <p className="text-slate-400 text-sm font-bold mt-4 leading-relaxed border-t border-white/5 pt-4 italic">{section.content}</p>}
                </div>
              );
            }
            if (section.title.includes('VITAL SCORE')) {
              const data = section.inlineData || section.content;
              const parts = data.split(' - ');
              const scorePart = parts[0] || "0/10";
              const labelPart = parts[1] || "EVALUATING";
              return (
                <div key={idx} className="flex items-center gap-8 py-4 px-2">
                  <div className="h-24 w-24 flex-shrink-0 rounded-[20px] bg-gradient-sky border border-white/20 flex flex-col items-center justify-center shadow-xl rotate-3">
                    <span className="text-4xl font-black text-slate-900 leading-none">{scorePart.split('/')[0]}</span>
                    <span className="text-[11px] font-black text-slate-900/40 uppercase tracking-widest mt-1">/ 10</span>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-1">Health Performance</h4>
                    <p className="text-3xl font-black text-white uppercase italic tracking-tighter">{labelPart}</p>
                  </div>
                </div>
              );
            }
            if (section.title.includes('FORECAST')) {
               return (
                <div key={idx} className="bg-sky-500/5 p-8 rounded-[20px] border border-sky-500/10 relative overflow-hidden group">
                  <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span> Biological Trajectory
                  </h4>
                  <p className="text-lg font-bold text-slate-200 leading-relaxed italic">
                    "{section.inlineData}"
                  </p>
                  <p className="text-slate-400 text-sm mt-4 font-medium leading-relaxed">
                    {section.content}
                  </p>
                </div>
               );
            }
            return (
              <div key={idx} className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.3)]"></span> {section.title}
                </h4>
                <div className="text-slate-300 text-sm md:text-base leading-relaxed font-medium pl-1">
                  {section.inlineData && !section.content.includes(section.inlineData) && <p className="mb-4 font-bold text-white text-xl">{section.inlineData}</p>}
                  {section.content.split('\n').map((line, lIdx) => (
                    <div key={lIdx} className={line.startsWith('-') ? "flex gap-3 mb-3 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors" : "mb-4"}>
                      {line.startsWith('-') ? (
                        <>
                          <span className="text-sky-400 font-black pt-0.5">→</span>
                          <span className="font-bold text-slate-200">{line.replace('- ', '').trim()}</span>
                        </>
                      ) : <p>{line.trim()}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          <div className="pt-10 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity">
            <p className="text-[9px] font-bold text-slate-400 italic text-center leading-relaxed px-4 max-w-sm mx-auto">
              AaharWise is a wellness and nutrition education tool, not medical advice or a medical device. 
              For diagnosis or treatment, please consult a doctor.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('aaharwise_profile');
    return saved ? JSON.parse(saved) : { age: 25, gender: 'Male', height: '175cm', weight: '70kg', activityLevel: ActivityLevel.MEDIUM, conditions: 'General wellbeing' };
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('aaharwise_theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterMl, setWaterMl] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [view, setView] = useState<'daily' | 'profile' | 'history'>('daily');
  const [pastLogs, setPastLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('aaharwise_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [pendingDrink, setPendingDrink] = useState<{ foodName: string; imageUrl: string; time: string } | null>(null);
  const [drinkIngredients, setDrinkIngredients] = useState("");
  const [isSubmittingDrink, setIsSubmittingDrink] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }), []);

  const totalNutrients = useMemo(() => {
    return meals.reduce((acc, m) => {
      if (m.nutrients) {
        acc.calories += m.nutrients.calories;
        acc.carbs += m.nutrients.carbs;
        acc.protein += m.nutrients.protein;
        acc.fiber += m.nutrients.fiber;
        acc.fats += m.nutrients.fats;
      }
      return acc;
    }, { calories: 0, carbs: 0, protein: 0, fiber: 0, fats: 0 });
  }, [meals]);

  const weeklyAverages = useMemo(() => {
    if (pastLogs.length === 0) return null;
    const count = pastLogs.length;
    const sums = pastLogs.reduce((acc, log) => {
      const n = log.totalNutrients || { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
      acc.cal += n.calories;
      acc.pro += n.protein;
      acc.car += n.carbs;
      acc.fat += n.fats;
      acc.fib += n.fiber;
      return acc;
    }, { cal: 0, pro: 0, car: 0, fat: 0, fib: 0 });
    return { cal: sums.cal / count, pro: sums.pro / count, car: sums.car / count, fat: sums.fat / count, fib: sums.fib / count };
  }, [pastLogs]);

  const calorieTarget = 2200;
  const calPercentage = Math.min((totalNutrients.calories / calorieTarget) * 100, 100);
  const radius = 82;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => { localStorage.setItem('aaharwise_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('aaharwise_history', JSON.stringify(pastLogs)); }, [pastLogs]);
  
  useEffect(() => {
    localStorage.setItem('aaharwise_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await analyzeMealImage(base64);
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (result.isBlendedDrink) {
          setPendingDrink({ foodName: result.foodName, imageUrl: reader.result as string, time: time });
        } else {
          const newMeal: Meal = {
            id: Date.now().toString(),
            time: time,
            food: result.foodName,
            portion: 'Smart scan',
            isJunk: false,
            isHomeCooked: true,
            nutrients: result.nutrients,
            imageUrl: reader.result as string
          };
          setMeals(prev => [...prev, newMeal]);
        }
      } catch (err) { alert("Oops! Could not identify that. Try a brighter shot!"); } finally { setIsProcessingImage(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleDrinkIngredientsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingDrink || !drinkIngredients.trim()) return;
    setIsSubmittingDrink(true);
    try {
      const nutrients = await getNutrientsFromIngredients(drinkIngredients, pendingDrink.foodName);
      const newMeal: Meal = {
        id: Date.now().toString(),
        time: pendingDrink.time,
        food: `${pendingDrink.foodName} (Custom Mix)`,
        portion: 'Blended serving',
        isJunk: false,
        isHomeCooked: true,
        nutrients: nutrients,
        imageUrl: pendingDrink.imageUrl
      };
      setMeals(prev => [...prev, newMeal]);
      setPendingDrink(null);
      setDrinkIngredients("");
    } catch (err) { alert("Error analyzing ingredients."); } finally { setIsSubmittingDrink(false); }
  };

  const handleAddMeal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const foodName = formData.get('food') as string;
    if (!foodName) return;
    const newMeal: Meal = {
      id: Date.now().toString(),
      time: (formData.get('time') as string) || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      food: foodName,
      portion: (formData.get('portion') as string) || 'Standard serving',
      isJunk: formData.get('isJunk') === 'on',
      isHomeCooked: formData.get('isHomeCooked') === 'on',
      nutrients: { calories: 150, carbs: 20, protein: 5, fats: 5, fiber: 2 }
    };
    setMeals(prev => [...prev, newMeal]);
    e.currentTarget.reset();
  };

  const removeMeal = (id: string) => { setMeals(prev => prev.filter(m => m.id !== id)); };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const todayLog: DailyLog = { id: Date.now().toString(), date: todayStr, meals, waterMl, profileSnapshot: profile, totalNutrients };
      const result = await generateHealthAnalysis(todayLog, pastLogs);
      setAnalysis(result);
      const updatedLog = { ...todayLog, analysis: result };
      setPastLogs(prev => {
        const filtered = prev.filter(log => log.date !== todayStr);
        return [updatedLog, ...filtered].slice(0, 30);
      });
    } catch (err) { setAnalysis("Analysis hit a snag. Please try again!"); } finally { setIsAnalyzing(false); }
  };

  const exportDailyCSV = () => {
    let csv = "Date,Time,Food,Portion,Type,Calories,Protein(g),Carbs(g),Fats(g),Fiber(g),Water(ml)\n";
    meals.forEach(m => { csv += `${todayStr},${m.time},"${m.food}","${m.portion}",${m.isJunk ? 'Cheat' : 'Clean'},${m.nutrients?.calories || 0},${m.nutrients?.protein || 0},${m.nutrients?.carbs || 0},${m.nutrients?.fats || 0},${m.nutrients?.fiber || 0},${waterMl}\n`; });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.setAttribute('href', URL.createObjectURL(blob)); link.setAttribute('download', `AaharWise_${todayStr.replace(/\s/g, '_')}.csv`); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <div className="min-h-screen pb-32 md:pb-24 text-slate-700 dark:text-slate-300 transition-colors duration-300">
      <header className="sticky top-0 z-50 px-4 pt-6 pb-4 no-print">
        <div className="max-w-5xl mx-auto flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-[20px] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 p-1">
              <Icons.NeuralLogo />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tighter leading-none">{APP_NAME}</h1>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.1em] mt-1 italic">Wellness begins with what you eat</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className="w-10 h-10 rounded-xl flex items-center justify-center border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
              {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
            </button>
            <button onClick={() => setView('history')} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${view === 'history' ? 'bg-slate-800 dark:bg-slate-700 text-white border-transparent shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><Icons.History /></button>
            <button onClick={() => setView(view === 'profile' ? 'daily' : 'profile')} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${view === 'profile' ? 'bg-slate-800 dark:bg-slate-700 text-white border-transparent shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><Icons.User /></button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-8">
        {pendingDrink && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <Card variant="light" className="w-full max-w-md shadow-2xl relative overflow-hidden border-none dark:bg-slate-900">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-md flex-shrink-0">
                  <img src={pendingDrink.imageUrl} alt="Drink" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">Blended Drink!</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manual Ingredients Required</p>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Liquid nutrients vary wildly based on ingredients. Please list them exactly.
              </p>
              <form onSubmit={handleDrinkIngredientsSubmit} className="space-y-4">
                <textarea autoFocus value={drinkIngredients} onChange={(e) => setDrinkIngredients(e.target.value)} placeholder="e.g. 2 Apples, 1 Carrot, Ginger, 1 tsp Honey" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl h-28 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900 outline-none font-bold text-slate-700 dark:text-slate-200 resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600" required />
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setPendingDrink(null); setDrinkIngredients(""); }} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl font-black transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700">Cancel</button>
                  <button type="submit" disabled={isSubmittingDrink || !drinkIngredients.trim()} className={`flex-[2] py-4 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-black shadow-lg transition-all ${isSubmittingDrink ? 'opacity-50' : 'hover:scale-[1.01]'}`}>
                    {isSubmittingDrink ? 'Analyzing...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {view === 'profile' && (
          <Card className="max-w-2xl mx-auto" variant="light">
            <SectionTitle title="Biological Profile" icon={<Icons.User />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label><input type="number" value={profile.age} onChange={e => setProfile({...profile, age: parseInt(e.target.value) || 0})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-700 outline-none font-bold text-slate-700 dark:text-slate-200" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label><select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-700 outline-none font-bold text-slate-700 dark:text-slate-200"><option>Male</option><option>Female</option><option>Non-binary</option></select></div>
              <div className="md:col-span-2 space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Activity Level</label><div className="grid grid-cols-3 gap-3">{[ActivityLevel.LOW, ActivityLevel.MEDIUM, ActivityLevel.HIGH].map(lvl => (<button key={lvl} onClick={() => setProfile({...profile, activityLevel: lvl})} className={`py-4 rounded-xl font-bold capitalize transition-all border ${profile.activityLevel === lvl ? 'bg-slate-800 dark:bg-slate-700 border-transparent text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-600'}`}>{lvl}</button>))}</div></div>
              <div className="md:col-span-2 space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Health Intentions</label><textarea value={profile.conditions} onChange={e => setProfile({...profile, conditions: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl h-24 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-700 outline-none font-medium text-slate-700 dark:text-slate-200 resize-none" /></div>
            </div>
            <button onClick={() => setView('daily')} className="mt-8 w-full bg-slate-800 dark:bg-slate-700 text-white py-4 rounded-xl font-black text-base shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all">Update & Continue</button>
          </Card>
        )}

        {view === 'history' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card variant="sage" className="dark:bg-slate-800/80">
              <div className="flex justify-between items-start"><SectionTitle title="Weekly Trends" icon={<Icons.History />} color="text-slate-800 dark:text-slate-100" /><button onClick={exportDailyCSV} className="flex items-center gap-2 px-4 py-2 bg-white/40 dark:bg-slate-700/40 hover:bg-white/60 dark:hover:bg-slate-700/60 rounded-xl text-[10px] font-black no-print transition-all border border-black/5 uppercase tracking-widest">Download Data</button></div>
              {weeklyAverages ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {Object.entries({ Cal: weeklyAverages.cal, Pro: weeklyAverages.pro, Car: weeklyAverages.car, Fat: weeklyAverages.fat, Fib: weeklyAverages.fib }).map(([k, v]) => (
                    <div key={k} className="p-4 bg-white/40 dark:bg-slate-900/40 rounded-xl backdrop-blur-sm border border-white/20 dark:border-slate-700/40"><p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">{k}</p><p className="text-xl font-black">{Math.round(v as number)}{k === 'Cal' ? '' : 'g'}</p></div>
                  ))}
                </div>
              ) : <p className="text-center py-12 text-slate-500 font-bold italic opacity-40">No historical data recorded.</p>}
            </Card>
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 px-2">Recent Logs</h3>
              {pastLogs.length === 0 ? <Card className="text-center py-16" variant="light"><p className="text-slate-400 font-bold">Your journal is empty.</p></Card> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastLogs.map(log => (
                    <Card key={log.id} variant="light" className="relative group border border-slate-100 dark:border-slate-800"><div className="flex justify-between items-start mb-2"><div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">{log.date}</p><p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{log.meals.length} Meals • {log.waterMl}ml Water</p></div><div className="text-right"><p className="text-lg font-black text-slate-800 dark:text-slate-100">{Math.round(log.totalNutrients?.calories || 0)} <span className="text-[10px] text-slate-400">kcal</span></p></div></div><button onClick={() => setPastLogs(prev => prev.filter(p => p.id !== log.id))} className="absolute top-4 right-4 text-slate-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all no-print"><Icons.Trash /></button></Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'daily' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="flex justify-between items-center px-2 no-print">
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 tracking-tight uppercase tracking-widest opacity-80">Daily Journal</h2>
              <button onClick={exportDailyCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-400 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all uppercase tracking-widest">Export CSV</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-4 flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-900/40" variant="light">
                <SectionTitle title="Energy Scale" />
                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                  <svg viewBox="0 0 192 192" className="w-full h-full -rotate-90 block">
                    <defs>
                      <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#86a390" stopOpacity="0.4" />
                        <stop offset="30%" stopColor="#8db0a6" stopOpacity="0.6" />
                        <stop offset="60%" stopColor="#7da0c1" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#7091b1" />
                      </linearGradient>
                    </defs>
                    <circle cx="96" cy="96" r={radius} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="12" fill="transparent" />
                    <circle 
                      cx="96" cy="96" r={radius} 
                      stroke="url(#energyGradient)" 
                      strokeWidth="12" fill="transparent" 
                      strokeDasharray={circumference} 
                      strokeDashoffset={circumference - (circumference * calPercentage) / 100} 
                      strokeLinecap="round" 
                      className="transition-all duration-1000 ease-in-out drop-shadow-xl" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center"><span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{Math.round(totalNutrients.calories)}</span><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">kcal</span></div>
                </div>
                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/50">Target: {calorieTarget}</div>
              </Card>

              <Card className="lg:col-span-8" variant="sky">
                <div className="flex justify-between items-start mb-6"><SectionTitle title="Macro Distribution" icon={<Icons.Plus />} color="text-slate-800 dark:text-slate-900" /><div className="text-right"><p className="text-[10px] font-black text-slate-700 uppercase tracking-widest opacity-60">{todayStr}</p></div></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <NutrientProgress label="Protein" icon="🥩" value={totalNutrients.protein} target={120} color="bg-slate-700" unit="g" />
                  <NutrientProgress label="Fiber" icon="🥗" value={totalNutrients.fiber} target={30} color="bg-slate-500" unit="g" />
                  <NutrientProgress label="Carbs" icon="🍞" value={totalNutrients.carbs} target={250} color="bg-slate-400" unit="g" />
                  <NutrientProgress label="Fats" icon="🥑" value={totalNutrients.fats} target={70} color="bg-slate-300" unit="g" />
                </div>
              </Card>
            </div>

            {isAnalyzing && (
              <div className="animate-float no-print">
                <Card className="bg-slate-800 dark:bg-slate-900 border-none flex items-center gap-6 py-6" variant="dark">
                  <div className="bg-slate-700 dark:bg-slate-800 p-3 rounded-xl animate-pulse text-sky-300"><Icons.Sparkles /></div>
                  <div><h3 className="text-base font-black tracking-tight text-white">Synthesizing Habits...</h3><p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest">Modeling metabolic trajectory</p></div>
                </Card>
              </div>
            )}

            {analysis && <CoachFeedbackPanel analysis={analysis} onClose={() => setAnalysis(null)} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card variant="light" className="no-print bg-white/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800">
                <SectionTitle title="Add Log" icon={<Icons.Plus />} color="text-slate-800 dark:text-slate-200" />
                <div className="mb-8">
                  <button onClick={() => fileInputRef.current?.click()} disabled={isProcessingImage} className="w-full py-10 border border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-3 bg-slate-50/30 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all group">
                    {isProcessingImage ? <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> : (
                      <><div className="bg-slate-800 dark:bg-slate-700 p-3 rounded-xl text-white shadow-md group-hover:scale-110 transition-transform"><Icons.Camera /></div><span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Plate Scan</span></>
                    )}
                  </button>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                </div>
                <form onSubmit={handleAddMeal} className="space-y-3">
                  <input name="food" placeholder="Meal name..." className="w-full p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-slate-200 dark:focus:ring-slate-700 font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600" required />
                  <div className="grid grid-cols-2 gap-3"><input name="time" type="time" className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-slate-700 dark:text-slate-200" /><input name="portion" placeholder="Portion" className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600" /></div>
                  <div className="flex gap-4 justify-center py-2"><label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><input name="isHomeCooked" type="checkbox" className="w-4 h-4 rounded border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800" /> Homemade</label><label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><input name="isJunk" type="checkbox" className="w-4 h-4 rounded border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800" /> Cheat</label></div>
                  <button type="submit" className="w-full py-4 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-black text-sm shadow-md mt-2 hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors">Log Meal</button>
                </form>
              </Card>

              <div className="space-y-8">
                <Card variant="sage" className="dark:bg-slate-800/60">
                  <div className="flex justify-between items-center mb-6"><h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-3"><Icons.Droplet /> Hydration</h2><span className="text-[9px] font-black uppercase opacity-60 dark:text-slate-400">Goal: 2.5L</span></div>
                  <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-black text-slate-900 dark:text-slate-100">{waterMl}</span><span className="text-sm font-bold opacity-40 dark:text-slate-400">ml</span></div>
                  <div className="grid grid-cols-3 gap-2 no-print">{[250, 500, 1000].map(amt => (<button key={amt} onClick={() => setWaterMl(prev => prev + amt)} className="py-2.5 bg-white/30 dark:bg-slate-700/30 border border-white/40 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all">+{amt}ml</button>))}</div>
                </Card>
                <Card variant="light" className="flex flex-col max-h-[360px] bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 shadow-none">
                  <SectionTitle title="Timeline" icon={<Icons.History />} color="text-slate-800 dark:text-slate-200" />
                  <div className="overflow-y-auto space-y-2 scrollbar-hide flex-grow pr-1">
                    {meals.length === 0 ? <div className="py-12 text-center text-slate-300 dark:text-slate-600 font-bold italic text-xs">No entries for today.</div> : meals.map(meal => (
                      <div key={meal.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 group transition-all">
                        <div className="flex gap-4 items-center"><div className="w-8 h-8 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-center text-sm">{meal.isJunk ? '🍔' : '🥗'}</div><div><p className="text-xs font-black text-slate-800 dark:text-slate-100 leading-none">{meal.food}</p><p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-1">{meal.time} • {Math.round(meal.nutrients?.calories || 0)} kcal</p></div></div>
                        <button onClick={() => removeMeal(meal.id)} className="text-slate-200 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-400 p-2 opacity-0 group-hover:opacity-100 transition-all no-print"><Icons.Trash /></button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-50 no-print">
              <button disabled={meals.length === 0 || isAnalyzing} onClick={handleAnalysis} className={`w-full py-5 rounded-xl font-black text-base shadow-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 group ${meals.length === 0 || isAnalyzing ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed shadow-none' : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 dark:hover:bg-slate-600 shadow-slate-200/50 dark:shadow-slate-900/50'}`}>
                {isAnalyzing ? 'Synthesizing...' : 'Unlocking Potential'}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} {APP_NAME} &ndash; Prototype by Vaibhavi Hiremath.
        </p>
      </footer>
    </div>
  );
}
