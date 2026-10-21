import React, { useState, useEffect } from 'react';
import { 
  Home, 
  BookOpen, 
  Eye, 
  PenTool, 
  Library, 
  Plus, 
  Save, 
  ChevronRight,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Flame,
  Target,
  Play,
  Lightbulb,
  ArrowLeft,
  Quote,
  TrendingUp,
  Link as LinkIcon
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  setDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// --- Firebase Initialization with Safety Fallback ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "demo-api-key",
  authDomain: "demo-app.firebaseapp.com",
  projectId: "demo-app",
  storageBucket: "demo-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'punchline-lab-default';

// --- Constants & Data ---
const MOTIVATIONAL_QUOTES = [
  { text: "A joke is a truth wrapped in a lie.", author: "Steve Martin" },
  { text: "Comedy is tragedy plus time.", author: "Carol Burnett" },
  { text: "You can't be brave if you've only had wonderful things happen to you.", author: "Mary Tyler Moore" },
  { text: "The audience is a genius.", author: "Dave Chappelle" }
];

const SAMPLE_OBSERVATIONS = [
  {
    text: "Trying to negotiate with my 2-year-old is harder than dealing with taxpayers. At least taxpayers understand logic. My son just throws his toy car.",
    tags: "family, parenting, absurdity",
    color: "bg-rose-100 border-rose-200",
    id: "sample-obs-1"
  }
];

const SAMPLE_JOKES = [
  {
    title: "Gamer vs Government",
    premise: "Government office tech vs Gamer tech.",
    setup: "I work in a tax office by day and play tactical shooters by night.",
    punchline: "The hardest transition isn't the stress, it's going from a 144Hz gaming monitor to a government PC that takes three business days to open a PDF.",
    status: "Draft",
    color: "bg-sky-50 border-sky-200",
    id: "sample-joke-1"
  }
];

// --- 100-Day Curriculum Generator ---
const MODULE_TITLES = [
  "Module 1: The Art of Noticing",
  "Module 2: Structuring the Premise",
  "Module 3: Setups & Expectations",
  "Module 4: The Art of the Punchline",
  "Module 5: Misdirection & Reversals",
  "Module 6: Tags & Callbacks",
  "Module 7: Editing & Word Economy",
  "Module 8: Storytelling",
  "Module 9: Performance",
  "Module 10: Building Your Set"
];

const EXPLANATIONS = [
  "Stand-up is built on shared reality. An observation is a documented anomaly in that reality.",
  "Vagueness is the enemy. Specific details create vivid mental images and make the humor hit harder.",
  "The setup is meant to make the audience assume they know exactly where you are going.",
  "The punchline is the sudden reveal of the true narrative. It shatters the assumption.",
  "Misdirection uses the audience's own logic against them, leading them to a false conclusion.",
  "Every word that doesn't build the setup or deliver the punchline must be mercilessly cut.",
  "Tags are additional punchlines that ride the momentum of the first laugh without needing a new setup.",
  "A story in comedy isn't just a narrative; it's a connected string of setups and punchlines.",
  "Your physical delivery, tone, and pacing are just as important as the words written on the page.",
  "A complete set is a carefully constructed emotional ride, starting strong and ending stronger."
];

const EXAMPLES = [
  "'The DMV is the only place where the person taking your photo looks more depressed than you do.'",
  "Instead of 'a weird guy', use 'a guy wearing sunglasses indoors while eating a plain hotdog'.",
  "'I haven't slept for ten days, because that would be too long.' (Mitch Hedberg)",
  "'My wife went to the Caribbean... Jamaica? No, she went of her own accord.' (Jimmy Carr)",
  "'I put instant coffee in a microwave and almost went back in time.' (Steven Wright)",
  "'I'm not afraid of heights, I'm afraid of widths.' (Steven Wright)",
  "Instead of saying 'I was walking down the street and I saw', just say 'A guy walks into a bar...'",
  "Observe a public space and describe it as if you are an alien researcher.",
  "Take a generic complaint and rewrite it using three hyper-specific, sensory details.",
  "Write a setup about helping someone, then reveal a completely selfish ulterior motive."
];

const EXERCISES = [
  "Write down three things that annoyed you today, stripped of all emotion.",
  "Identify one rule you enforce for others but break yourself. Justify it.",
  "Take a 50-word joke and cut it down to exactly 25 words without losing the punch.",
  "Add two tags (follow-up jokes) to an existing punchline.",
  "Write a setup that relies on a common idiom, then take it entirely literally.",
  "Record yourself delivering a premise. Are you speaking too fast? Note where you should pause.",
  "Map out a 3-act structure for a funny personal story.",
  "Write an impassioned, dramatic monologue defending a terrible snack food.",
  "Write a joke that requires physical acting or a specific tone of voice to work.",
  "Assemble a mock 5-minute set list using your existing premises. Do the transitions make sense?"
];

const OBJECTIVES = [
  "Learn to separate facts from emotional judgments.",
  "Understand how specific details do the heavy lifting in comedy.",
  "Guiding the audience's mind to a false conclusion.",
  "Shattering expectations with the perfect reveal.",
  "Using the 'pull back and reveal' technique effectively.",
  "Trimming the fat: faster punchlines hit harder.",
  "Milking the joke: getting 3 laughs from 1 premise.",
  "Sustaining a premise and comedic tension over 2 minutes.",
  "Mastering delivery, pauses, and mic technique.",
  "Structuring openers, closers, and smooth transitions."
];

const CURRICULUM = MODULE_TITLES.map((modTitle, modIndex) => {
  return {
    module: `${modTitle} (Days ${modIndex * 10 + 1}-${modIndex * 10 + 10})`,
    days: Array.from({ length: 10 }, (_, dayIndex) => {
      const globalDay = (modIndex * 10) + dayIndex + 1;
      const contentIndex = (modIndex + dayIndex) % 10; 
      return {
        day: globalDay,
        title: `Lesson ${globalDay}: ${modTitle.split(': ')[1]} Techniques`,
        objective: OBJECTIVES[modIndex],
        explanation: EXPLANATIONS[contentIndex],
        example: EXAMPLES[(contentIndex + 3) % 10],
        exercise: EXERCISES[(contentIndex + 5) % 10],
        review: "Did you follow the objective constraints strictly?"
      };
    })
  };
});

CURRICULUM[0].days[0] = { day: 1, title: "Observation vs. Opinion", objective: "Learn to separate facts from judgments.", explanation: "Stand-up is built on specific, shared reality. An opinion is a judgment ('The DMV is awful'). An observation is a documented anomaly.", example: "'The DMV is the only place where the person taking your photo looks more depressed than you do.'", exercise: "Write down three things that annoyed you today. Strip away the emotion and describe purely the physical or logical contradiction that occurred.", review: "Did you use any emotional words (angry, sad, stupid) in your description? If so, remove them." };

const STUDY_CLUB_CATEGORIES = [
  { id: 'misdirection', title: 'Misdirection', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'economy', title: 'Economy of Words', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'escalation', title: 'Escalation', color: 'text-rose-600', bg: 'bg-rose-50' }
];

const STUDY_CLUB_ARTICLES = {
  misdirection: [
    {
      id: 'm1',
      title: "The Status Reversal",
      comic: "Anonymous / The Income Tax Inspector",
      content: "Misdirection works best when it plays on universal societal assumptions. We all have preconceived notions about certain jobs. Consider this masterful piece of redirection:\n\n'People think government jobs are stressful. But as an Income Tax Inspector, I find it quite relaxing. It's the people sitting across my desk having the panic attacks.'\n\n**The Breakdown:** The setup leans into the universal agreement that government bureaucracy is stressful. The listener assumes the speaker is the victim of this stress. The punchline pivots the camera 180 degrees, revealing the speaker is the source of the terror, not the victim. It shifts the status of the narrator entirely.",
      prompt: "Think of a situation where you are usually the victim (e.g., getting pulled over, going to the dentist). Write a setup where you complain about the stress, but reveal in the punchline that you are actually the one causing it."
    }
  ],
  economy: [
    { id: 'e1', title: "The 10-Word Masterpiece", comic: "Steven Wright", content: "'I'm not afraid of heights, I'm afraid of widths.' Ten words. It perfectly subverts a common phrase by targeting its opposite dimension. Every single syllable is necessary.", prompt: "Write a joke in exactly 10 words." }
  ],
  escalation: [
    { id: 'es1', title: "The Salt and Pepper Diner", comic: "John Mulaney", content: "Mulaney playing 'What's New Pussycat' 21 times on a jukebox is the gold standard of escalation.", prompt: "Take a minor annoyance and imagine it happening 20 times in a row." }
  ]
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data State
  const [observations, setObservations] = useState(SAMPLE_OBSERVATIONS);
  const [jokes, setJokes] = useState(SAMPLE_JOKES);
  const [stats, setStats] = useState({ minutesWritten: 0, completedLessons: [] });
  
  // App State
  const [loading, setLoading] = useState(true);
  const [workshopDraft, setWorkshopDraft] = useState(null);

  // --- Auth & Data Fetching with Timeout Safety ---
  useEffect(() => {
    // Safety timer: Never get stuck on loading for more than 2.5 seconds on mobile
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.warn("Auth initialization fallback active:", error);
        setLoading(false);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const obsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'observations');
    const jokesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'jokes');
    const statsDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'stats', 'main');

    const unsubscribeObs = onSnapshot(query(obsRef, orderBy('createdAt', 'desc')), 
      (snapshot) => {
        if (!snapshot.empty) {
          const obsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          setObservations(obsData);
        }
      },
      (err) => console.log("Firestore obs fallback active")
    );

    const unsubscribeJokes = onSnapshot(query(jokesRef, orderBy('createdAt', 'desc')),
      (snapshot) => {
        if (!snapshot.empty) {
          const jokesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          setJokes(jokesData);
        }
      },
      (err) => console.log("Firestore jokes fallback active")
    );

    const unsubscribeStats = onSnapshot(statsDocRef, 
      (docSnap) => {
        if (docSnap.exists()) setStats(docSnap.data());
      },
      (err) => console.log("Firestore stats fallback active")
    );

    return () => { unsubscribeObs(); unsubscribeJokes(); unsubscribeStats(); };
  }, [user]);

  // --- Handlers ---
  const handleAddMinutes = async (mins) => {
    const newMinutes = (stats.minutesWritten || 0) + mins;
    setStats(prev => ({ ...prev, minutesWritten: newMinutes }));
    if (user) {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'stats', 'main'), { minutesWritten: newMinutes });
      } catch(e){}
    }
  };

  const handleToggleLesson = async (day) => {
    const current = stats.completedLessons || [];
    const newLessons = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
    setStats(prev => ({ ...prev, completedLessons: newLessons }));
    if (user) {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'stats', 'main'), { completedLessons: newLessons });
      } catch(e){}
    }
  };

  const sendToWorkshop = (obs) => {
    setWorkshopDraft({
      title: '', premise: '', setup: '', punchline: '', status: 'Premise',
      linkedObservationId: obs.id, color: 'bg-white border-slate-200'
    });
    setActiveTab('workshop');
  };

  if (loading) return (
    <div className="flex flex-col h-screen items-center justify-center bg-slate-50 text-violet-600 font-bold p-6 text-center">
      <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-xl">Warming up the mic...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-rose-200">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 shadow-sm z-10">
        <div className="p-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-rose-500 flex items-center gap-2">
            <Target className="w-6 h-6 text-violet-600" /> Punchline Lab
          </h1>
        </div>
        <nav className="flex-1 space-y-2 px-4">
          <NavItem icon={Home} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} color="text-sky-500" bg="bg-sky-50" />
          <NavItem icon={BookOpen} label="Comedy School" active={activeTab === 'learn'} onClick={() => setActiveTab('learn')} color="text-violet-500" bg="bg-violet-50" />
          <NavItem icon={Eye} label="Observations" active={activeTab === 'observations'} onClick={() => setActiveTab('observations')} color="text-amber-500" bg="bg-amber-50" />
          <NavItem icon={PenTool} label="Joke Workshop" active={activeTab === 'workshop'} onClick={() => setActiveTab('workshop')} color="text-rose-500" bg="bg-rose-50" />
          <NavItem icon={Library} label="Study Club" active={activeTab === 'study'} onClick={() => setActiveTab('study')} color="text-emerald-500" bg="bg-emerald-50" />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-8 h-full">
          {activeTab === 'dashboard' && <DashboardView stats={stats} observations={observations} jokes={jokes} onAddMinutes={handleAddMinutes} setActiveTab={setActiveTab} />}
          {activeTab === 'learn' && <LearnView user={user} stats={stats} toggleLessonComplete={handleToggleLesson} />}
          {activeTab === 'observations' && <ObservationsView user={user} observations={observations} setObservations={setObservations} onSendToWorkshop={sendToWorkshop} />}
          {activeTab === 'workshop' && <WorkshopView user={user} jokes={jokes} setJokes={setJokes} draft={workshopDraft} setDraft={setWorkshopDraft} observations={observations} />}
          {activeTab === 'study' && <StudyClubView />}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-2 pb-safe shadow-[0_-4px_15px_-1px_rgba(0,0,0,0.08)] z-50">
        <MobileNavItem icon={Home} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} color="text-sky-500" />
        <MobileNavItem icon={BookOpen} label="School" active={activeTab === 'learn'} onClick={() => setActiveTab('learn')} color="text-violet-500" />
        <MobileNavItem icon={Eye} label="Observe" active={activeTab === 'observations'} onClick={() => setActiveTab('observations')} color="text-amber-500" />
        <MobileNavItem icon={PenTool} label="Write" active={activeTab === 'workshop'} onClick={() => setActiveTab('workshop')} color="text-rose-500" />
        <MobileNavItem icon={Library} label="Study" active={activeTab === 'study'} onClick={() => setActiveTab('study')} color="text-emerald-500" />
      </nav>
    </div>
  );
}

// --- Views ---

function DashboardView({ stats, observations, jokes, onAddMinutes, setActiveTab }) {
  const quote = MOTIVATIONAL_QUOTES[0];
  
  const completed = stats.completedLessons || [];
  let nextLessonDay = 1;
  for (let i = 1; i <= 100; i++) {
    if (!completed.includes(i)) {
      nextLessonDay = i;
      break;
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Studio</h2>
          <p className="text-slate-500 mt-2 text-lg">Turn life's absurdities into killer material.</p>
        </div>
        <button 
          onClick={() => setActiveTab('learn')}
          className="bg-violet-100 text-violet-700 hover:bg-violet-200 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-colors shadow-sm border border-violet-200"
        >
          <Target className="w-5 h-5" /> Next Lesson: Day {nextLessonDay}
        </button>
      </header>

      {/* Quote Card */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <Quote className="absolute -right-4 -top-4 w-32 h-32 text-white opacity-10" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-2xl md:text-3xl font-medium leading-snug mb-4">"{quote.text}"</p>
          <p className="font-bold text-violet-200 tracking-wider uppercase text-sm">— {quote.author}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div onClick={() => setActiveTab('observations')} className="cursor-pointer group bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-3xl shadow-md hover:shadow-xl transition-all text-white relative overflow-hidden">
          <Eye className="w-8 h-8 mb-4 opacity-80" />
          <h3 className="text-2xl font-bold mb-1">Capture Observation</h3>
          <p className="opacity-90">Did something weird just happen?</p>
          <Sparkles className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 group-hover:scale-110 transition-transform" />
        </div>
        <div onClick={() => { onAddMinutes(15); setActiveTab('workshop'); }} className="cursor-pointer group bg-gradient-to-br from-rose-500 to-pink-500 p-6 rounded-3xl shadow-md hover:shadow-xl transition-all text-white relative overflow-hidden">
          <Flame className="w-8 h-8 mb-4 opacity-80" />
          <h3 className="text-2xl font-bold mb-1">15-Min Writing Sprint</h3>
          <p className="opacity-90">Log 15 mins and head to the workshop.</p>
          <PenTool className="absolute -right-2 -bottom-2 w-32 h-32 opacity-20 group-hover:scale-110 group-hover:-rotate-12 transition-transform" />
        </div>
      </div>

      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
          <TrendingUp className="w-6 h-6 text-sky-500" /> Progress Dashboard
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ProgressBar label="Observations" current={observations.length} max={100} color="bg-amber-500" bg="bg-amber-100" text="text-amber-700" />
            <ProgressBar label="Drafts & Jokes" current={jokes.length} max={50} color="bg-rose-500" bg="bg-rose-100" text="text-rose-700" />
          </div>
          <div className="space-y-6">
            <ProgressBar label="Minutes Written" current={stats.minutesWritten || 0} max={1000} color="bg-sky-500" bg="bg-sky-100" text="text-sky-700" />
            <ProgressBar label="Lessons Completed" current={stats.completedLessons?.length || 0} max={100} color="bg-violet-500" bg="bg-violet-100" text="text-violet-700" />
          </div>
        </div>
      </section>
    </div>
  );
}

function ProgressBar({ label, current, max, color, bg, text }) {
  const percent = Math.min(100, (current / max) * 100);
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className={`font-bold ${text}`}>{current} <span className="text-slate-400 text-sm">/ {max}</span></span>
      </div>
      <div className={`w-full h-3 rounded-full overflow-hidden ${bg}`}>
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function LearnView({ user, stats, toggleLessonComplete }) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [expandedModule, setExpandedModule] = useState(0);
  const [answers, setAnswers] = useState({ exercise: '', selfReview: '' });
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  useEffect(() => {
    const modIndex = Math.floor((selectedDay - 1) / 10);
    setExpandedModule(modIndex);
  }, [selectedDay]);

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    setIsMobileListVisible(false);
  };

  const handleNext = () => { if (selectedDay < 100) handleSelectDay(selectedDay + 1); };
  const handlePrev = () => { if (selectedDay > 1) handleSelectDay(selectedDay - 1); };

  const lesson = CURRICULUM.flatMap(m => m.days).find(d => d.day === selectedDay);
  const isDone = (stats.completedLessons || []).includes(selectedDay);

  if (!lesson) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-6rem)] animate-in fade-in max-w-7xl mx-auto">
      {/* Sidebar: Accordion for Modules */}
      <div className={`w-full lg:w-80 flex-shrink-0 bg-white rounded-3xl border border-slate-200 shadow-sm flex-col overflow-hidden ${isMobileListVisible ? 'flex' : 'hidden lg:flex'}`}>
        <div className="p-6 bg-slate-900 text-white">
          <h3 className="font-bold text-xl">Comedy School</h3>
          <p className="text-slate-400 text-sm mt-1">{stats.completedLessons?.length || 0} / 100 Days Completed</p>
        </div>
        <div className="overflow-y-auto p-4 space-y-4 flex-1 bg-slate-50">
          {CURRICULUM.map((mod, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <button 
                onClick={() => setExpandedModule(expandedModule === idx ? null : idx)}
                className="w-full text-left px-4 py-4 font-bold text-sm text-slate-800 flex justify-between items-center hover:bg-slate-50 transition-colors"
              >
                <span className="truncate pr-4">{mod.module}</span>
                {expandedModule === idx ? <ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-400"/> : <ChevronRight className="w-4 h-4 flex-shrink-0 text-slate-400"/>}
              </button>
              
              {expandedModule === idx && (
                <div className="bg-slate-50 p-2 space-y-1 border-t border-slate-100">
                  {mod.days.map(d => {
                    const isDayDone = (stats.completedLessons || []).includes(d.day);
                    const active = selectedDay === d.day;
                    return (
                      <button 
                        key={d.day} 
                        onClick={() => handleSelectDay(d.day)} 
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${active ? 'bg-white shadow-sm text-violet-600 border border-slate-200' : 'text-slate-600 hover:bg-white/60'}`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center ${isDayDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                          {isDayDone && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                        <span className="truncate">Day {d.day}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel: Lesson Content */}
      <div className={`flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-y-auto relative p-6 md:p-10 ${!isMobileListVisible ? 'block' : 'hidden lg:block'}`}>
        <div className="max-w-3xl mx-auto space-y-10 pb-10">
          
          <button 
            onClick={() => setIsMobileListVisible(true)}
            className="lg:hidden mb-2 flex items-center gap-2 text-violet-600 font-bold hover:text-violet-700 bg-violet-50 px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Modules
          </button>

          <header className="border-b border-slate-100 pb-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
            <div>
                <span className="text-violet-500 font-bold tracking-widest text-sm uppercase">Day {selectedDay}</span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-2 leading-tight">{lesson.title}</h2>
            </div>
            <div className="flex gap-2 shrink-0">
                <button onClick={handlePrev} disabled={selectedDay === 1} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 disabled:opacity-50"><ArrowLeft className="w-5 h-5" /></button>
                <button onClick={handleNext} disabled={selectedDay === 100} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 disabled:opacity-50"><ArrowLeft className="w-5 h-5 rotate-180" /></button>
            </div>
          </header>

          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> Learning Objective
            </h3>
            <p className="text-xl text-slate-800 font-medium">{lesson.objective}</p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> The Lesson
            </h3>
            <p className="text-lg text-slate-600 leading-relaxed">{lesson.explanation}</p>
          </section>

          <section className="bg-sky-50 border border-sky-100 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-sky-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Example
            </h3>
            <p className="text-lg text-slate-700 italic border-l-4 border-sky-400 pl-4">"{lesson.example}"</p>
          </section>

          <section className="bg-amber-50 p-6 md:p-8 rounded-3xl border border-amber-200 shadow-inner">
            <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
              <PenTool className="w-6 h-6" /> Daily Exercise
            </h3>
            <p className="text-amber-800 font-medium mb-6 text-lg">{lesson.exercise}</p>
            <textarea 
              value={answers.exercise}
              onChange={(e) => setAnswers(prev => ({ ...prev, exercise: e.target.value }))}
              className="w-full bg-white border border-amber-200 rounded-2xl p-4 md:p-6 min-h-[160px] outline-none focus:ring-4 focus:ring-amber-100 text-slate-800 text-lg resize-y shadow-sm" 
              placeholder="Draft your response here..." 
            />
          </section>

          <div className="pt-6">
            <button 
              onClick={() => toggleLessonComplete(selectedDay)} 
              className={`w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg ${isDone ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              {isDone ? <><CheckCircle2 className="w-6 h-6"/> Lesson Completed</> : 'Mark Lesson Complete'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function ObservationsView({ user, observations, setObservations, onSendToWorkshop }) {
  const [newObs, setNewObs] = useState('');
  const [tags, setTags] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const COLORS = ['bg-rose-100 border-rose-200', 'bg-amber-100 border-amber-200', 'bg-emerald-100 border-emerald-200', 'bg-sky-100 border-sky-200', 'bg-violet-100 border-violet-200'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newObs.trim()) return;
    const item = {
      id: "obs-" + Date.now(),
      text: newObs.trim(),
      tags: tags.trim(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    setObservations(prev => [item, ...prev]);
    if (user) {
      try {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'observations'), {
          text: item.text, tags: item.tags, color: item.color, createdAt: serverTimestamp()
        });
      } catch(e){}
    }
    setNewObs(''); setTags(''); setIsAdding(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto">
      <header className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">The Notebook</h2>
          <p className="text-slate-500 mt-2 text-lg">Raw, unfiltered realities.</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <Plus className="w-5 h-5" /> <span className="hidden md:inline">New Observation</span>
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
          <textarea value={newObs} onChange={(e) => setNewObs(e.target.value)} placeholder="What contradiction, hypocrisy, or absurdity did you see today?" autoFocus className="w-full bg-slate-50 rounded-xl p-4 text-lg font-medium min-h-[120px] focus:ring-2 focus:ring-amber-200 outline-none mb-4 resize-y text-slate-800" />
          <div className="flex gap-4">
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" className="flex-1 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-200" />
            <button type="submit" disabled={!newObs.trim()} className="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-amber-600">Save</button>
          </div>
        </form>
      )}

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {observations.map((obs) => (
          <div key={obs.id} className={`${obs.color || 'bg-white border-slate-200'} p-6 rounded-3xl shadow-sm border break-inside-avoid flex flex-col group`}>
            <p className="text-lg font-medium leading-relaxed mb-6 text-slate-900">{obs.text}</p>
            <div className="mt-auto flex justify-between items-end">
              <div className="flex flex-wrap gap-2 max-w-[70%]">
                {obs.tags && obs.tags.split(',').map((tag, i) => (
                  <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-white/60 text-slate-700 px-2 py-1 rounded-md">{tag.trim()}</span>
                ))}
              </div>
              <button onClick={() => onSendToWorkshop(obs)} className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors shadow-sm text-slate-700 hover:text-rose-600" title="Develop in Workshop">
                <PenTool className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkshopView({ user, jokes, setJokes, draft, setDraft, observations }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', premise: '', setup: '', punchline: '', status: 'Premise', color: '', linkedObservationId: '' });
  
  const COLUMNS = [
    { id: 'Premise', title: 'Premise', color: 'border-t-amber-400', bg: 'bg-amber-50' },
    { id: 'Draft', title: 'Rough Draft', color: 'border-t-sky-400', bg: 'bg-sky-50' },
    { id: 'Testing', title: 'Ready to Test', color: 'border-t-violet-400', bg: 'bg-violet-50' },
    { id: 'Set Material', title: 'Set Material', color: 'border-t-emerald-400', bg: 'bg-emerald-50' }
  ];

  useEffect(() => {
    if (draft) {
      setFormData(draft);
      setEditingId('new');
      setDraft(null);
    }
  }, [draft, setDraft]);

  const handleSave = async () => {
    const data = { ...formData, id: editingId === 'new' ? "joke-" + Date.now() : editingId, color: formData.color || 'bg-white border-slate-200' };
    if (editingId === 'new') {
      setJokes(prev => [data, ...prev]);
    } else {
      setJokes(prev => prev.map(j => j.id === editingId ? data : j));
    }
    setEditingId(null);

    if (user) {
      try {
        if (editingId === 'new') {
          await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'jokes'), { ...data, createdAt: serverTimestamp() });
        } else {
          await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'jokes', editingId), { ...data, updatedAt: serverTimestamp() });
        }
      } catch(e){}
    }
  };

  if (editingId) {
    const linkedObs = observations.find(o => o.id === formData.linkedObservationId);
    
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-300 pb-20">
        <header className="flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 py-4 border-b border-slate-200 mb-6">
          <button onClick={() => setEditingId(null)} className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> Back to Board
          </button>
          <div className="flex gap-3">
             <select 
              value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="bg-white border border-slate-200 text-slate-700 font-bold rounded-xl px-4 py-2 outline-none"
            >
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800">
              <Save className="w-4 h-4" /> Save Material
            </button>
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12 space-y-8">
          <div>
            <input 
              type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Working Title (Optional)"
              className="w-full text-4xl md:text-5xl font-extrabold bg-transparent border-0 placeholder:text-slate-300 outline-none text-slate-900"
            />
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              <LinkIcon className="w-4 h-4" /> Linked Observation
            </label>
            {linkedObs ? (
              <p className="text-slate-700 font-medium italic border-l-4 border-amber-400 pl-4 py-1">{linkedObs.text}</p>
            ) : (
              <select 
                value={formData.linkedObservationId || ''} 
                onChange={e => setFormData({...formData, linkedObservationId: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-600 outline-none"
              >
                <option value="">-- Attach an Observation --</option>
                {observations.map(o => <option key={o.id} value={o.id}>{o.text.substring(0, 100)}...</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Core Premise
            </label>
            <textarea 
              value={formData.premise} onChange={e => setFormData({...formData, premise: e.target.value})}
              placeholder="What is the fundamental contradiction or truth you are exploring?"
              className="w-full bg-amber-50/50 border border-amber-200 rounded-2xl p-6 min-h-[120px] outline-none focus:ring-4 focus:ring-amber-100 resize-y text-xl text-slate-800 font-medium leading-relaxed"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-sky-600 uppercase tracking-widest mb-3">Setup</label>
              <textarea 
                value={formData.setup} onChange={e => setFormData({...formData, setup: e.target.value})}
                placeholder="Build the expectation. Guide the audience's mind down a specific path."
                className="w-full bg-sky-50/50 border border-sky-200 rounded-2xl p-6 min-h-[200px] outline-none focus:ring-4 focus:ring-sky-100 resize-y text-lg text-slate-700 leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-rose-600 uppercase tracking-widest mb-3">Punchline</label>
              <textarea 
                value={formData.punchline} onChange={e => setFormData({...formData, punchline: e.target.value})}
                placeholder="Shatter the expectation. The reveal."
                className="w-full bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 min-h-[200px] outline-none focus:ring-4 focus:ring-rose-200 resize-y text-2xl font-bold text-slate-900 leading-tight"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300 min-h-[calc(100vh-6rem)]">
      <header className="flex justify-between items-end mb-8 flex-shrink-0">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Workshop Board</h2>
          <p className="text-slate-500 mt-2 text-lg">Move ideas from premise to stage-ready.</p>
        </div>
        <button 
          onClick={() => { setFormData({ title: '', premise: '', setup: '', punchline: '', status: 'Premise', color: '' }); setEditingId('new'); }}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" /> <span className="hidden md:inline">New Material</span>
        </button>
      </header>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full items-start">
          {COLUMNS.map(col => {
            const columnJokes = jokes.filter(j => j.status === col.id || (!j.status && col.id === 'Premise'));
            return (
              <div key={col.id} className={`w-80 flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden border-t-8 ${col.color} max-h-[80vh]`}>
                <div className={`p-4 border-b border-slate-100 flex justify-between items-center ${col.bg}`}>
                  <h3 className="font-bold text-slate-800">{col.title}</h3>
                  <span className="bg-white text-slate-500 text-xs font-bold px-2 py-1 rounded-full shadow-sm">{columnJokes.length}</span>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-slate-50/50">
                  {columnJokes.map(joke => (
                    <div 
                      key={joke.id} onClick={() => { setFormData(joke); setEditingId(joke.id); }}
                      className={`${joke.color} p-5 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group`}
                    >
                      <h4 className="font-bold text-slate-900 text-lg leading-tight mb-2 line-clamp-2">
                        {joke.title || joke.premise || 'Untitled Idea'}
                      </h4>
                      {joke.punchline && (
                        <div className="mt-4 bg-white/80 p-3 rounded-xl border border-black/5">
                          <p className="text-sm font-bold text-slate-800 italic line-clamp-3">"{joke.punchline}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {columnJokes.length === 0 && <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">Empty</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StudyClubView() {
  const [activeCategory, setActiveCategory] = useState(STUDY_CLUB_CATEGORIES[0].id);
  const [activeArticleId, setActiveArticleId] = useState(STUDY_CLUB_ARTICLES[STUDY_CLUB_CATEGORIES[0].id][0].id);

  const categoryData = STUDY_CLUB_CATEGORIES.find(c => c.id === activeCategory);
  const articles = STUDY_CLUB_ARTICLES[activeCategory];
  const currentArticle = articles.find(a => a.id === activeArticleId);

  useEffect(() => {
    setActiveArticleId(STUDY_CLUB_ARTICLES[activeCategory][0].id);
  }, [activeCategory]);

  return (
    <div className="h-full flex flex-col animate-in fade-in min-h-[calc(100vh-6rem)]">
      <header className="mb-8 flex-shrink-0">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Study Club</h2>
        <p className="text-slate-500 mt-2 text-lg">Detailed analysis of comedic techniques.</p>
      </header>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 flex-shrink-0">
        {STUDY_CLUB_CATEGORIES.map(cat => (
          <button
            key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all border ${
              activeCategory === cat.id 
                ? `${cat.bg} ${cat.color} border-current shadow-sm` 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {cat.title} <span className="ml-2 text-xs opacity-70">({STUDY_CLUB_ARTICLES[cat.id].length})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        <div className="w-full md:w-1/3 bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-sm">
          <div className={`p-4 border-b border-slate-100 font-bold text-sm uppercase tracking-widest ${categoryData.color} ${categoryData.bg}`}>
            Articles in {categoryData.title}
          </div>
          <div className="overflow-y-auto flex-1">
            {articles.map((art, idx) => (
              <button
                key={art.id} onClick={() => setActiveArticleId(art.id)}
                className={`w-full text-left p-4 border-b border-slate-100 transition-colors ${
                  activeArticleId === art.id ? `${categoryData.bg} border-l-4 border-l-current` : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                }`}
              >
                <div className="text-xs font-bold text-slate-400 mb-1">Lesson {idx + 1}</div>
                <div className={`font-bold ${activeArticleId === art.id ? 'text-slate-900' : 'text-slate-700'}`}>{art.title}</div>
                <div className="text-xs text-slate-500 mt-1 truncate">Ref: {art.comic}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full md:w-2/3 bg-white border border-slate-200 rounded-3xl p-8 md:p-12 overflow-y-auto shadow-sm">
          {currentArticle && (
            <div className="max-w-3xl mx-auto animate-in slide-in-from-right-4">
              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${categoryData.bg} ${categoryData.color}`}>
                {categoryData.title}
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-6 mb-4 leading-tight">{currentArticle.title}</h2>
              <div className="flex items-center gap-2 text-slate-500 font-medium mb-10 pb-6 border-b border-slate-100">
                <Play className="w-4 h-4" /> <span>Example: <strong className="text-slate-700">{currentArticle.comic}</strong></span>
              </div>
              
              <div className="prose prose-lg prose-slate text-slate-700 whitespace-pre-wrap leading-relaxed">
                {currentArticle.content}
              </div>

              <div className="mt-12 bg-slate-50 p-8 rounded-3xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-slate-500" /> Apply This Technique
                </h3>
                <p className="text-slate-700 font-medium">{currentArticle.prompt}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, color, bg }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${active ? `${bg} ${color} shadow-sm border border-black/5` : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'}`}>
      <Icon className={`w-5 h-5 ${active ? color : ''}`} /> {label}
    </button>
  );
}

function MobileNavItem({ icon: Icon, label, active, onClick, color }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all ${active ? `${color} bg-slate-50 scale-105` : 'text-slate-400'}`}>
      <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5px]' : ''}`} />
      <span className="text-[10px] font-bold tracking-wide uppercase">{label}</span>
    </button>
  );
}
