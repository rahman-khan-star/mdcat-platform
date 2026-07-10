export interface Subject {
  id: string;
  name: string;
  icon: string;
  totalTopics: number;
  completedTopics: number;
  color: string;
  description: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  subjectId: string;
  questionCount: number;
  duration: number;
  difficulty: "Easy" | "Medium" | "Hard";
  attempted: boolean;
  score?: number;
  bestScore?: number;
  attempts: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  quizzesCompleted: number;
  streak: number;
}

export interface StatsData {
  totalQuizzes: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  studyStreak: number;
  totalStudyTime: string;
  weeklyData: { day: string; score: number; quizzes: number }[];
  subjectPerformance: { subject: string; score: number; fill: string }[];
  monthlyProgress: { month: string; score: number }[];
}

export const subjects: Subject[] = [
  {
    id: "biology",
    name: "Biology",
    icon: "Dna",
    totalTopics: 24,
    completedTopics: 18,
    color: "#10b981",
    description: "Cell biology, genetics, evolution, and human physiology",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: "FlaskConical",
    totalTopics: 20,
    completedTopics: 12,
    color: "#2563eb",
    description: "Organic, inorganic, and physical chemistry fundamentals",
  },
  {
    id: "physics",
    name: "Physics",
    icon: "Atom",
    totalTopics: 18,
    completedTopics: 10,
    color: "#8b5cf6",
    description: "Mechanics, thermodynamics, waves, and electromagnetism",
  },
  {
    id: "english",
    name: "English",
    icon: "BookOpen",
    totalTopics: 15,
    completedTopics: 14,
    color: "#f59e0b",
    description: "Grammar, comprehension, and vocabulary mastery",
  },
  {
    id: "logical-reasoning",
    name: "Logical Reasoning",
    icon: "Brain",
    totalTopics: 12,
    completedTopics: 8,
    color: "#ec4899",
    description: "Critical thinking, patterns, and analytical skills",
  },
];

export const quizzes: Quiz[] = [
  { id: "1", title: "Cell Biology Basics", subject: "Biology", subjectId: "biology", questionCount: 30, duration: 30, difficulty: "Easy", attempted: true, score: 85, bestScore: 85, attempts: 1 },
  { id: "2", title: "Genetics & Heredity", subject: "Biology", subjectId: "biology", questionCount: 30, duration: 30, difficulty: "Medium", attempted: true, score: 72, bestScore: 72, attempts: 1 },
  { id: "3", title: "Human Physiology", subject: "Biology", subjectId: "biology", questionCount: 40, duration: 40, difficulty: "Hard", attempted: false, attempts: 0 },
  { id: "4", title: "Organic Chemistry", subject: "Chemistry", subjectId: "chemistry", questionCount: 30, duration: 30, difficulty: "Medium", attempted: true, score: 90, bestScore: 90, attempts: 2 },
  { id: "5", title: "Chemical Bonding", subject: "Chemistry", subjectId: "chemistry", questionCount: 25, duration: 25, difficulty: "Easy", attempted: false, attempts: 0 },
  { id: "6", title: "Thermochemistry", subject: "Chemistry", subjectId: "chemistry", questionCount: 35, duration: 35, difficulty: "Hard", attempted: false, attempts: 0 },
  { id: "7", title: "Mechanics", subject: "Physics", subjectId: "physics", questionCount: 30, duration: 30, difficulty: "Medium", attempted: true, score: 68, bestScore: 68, attempts: 1 },
  { id: "8", title: "Waves & Optics", subject: "Physics", subjectId: "physics", questionCount: 25, duration: 25, difficulty: "Easy", attempted: false, attempts: 0 },
  { id: "9", title: "Electromagnetism", subject: "Physics", subjectId: "physics", questionCount: 35, duration: 35, difficulty: "Hard", attempted: false, attempts: 0 },
  { id: "10", title: "English Grammar", subject: "English", subjectId: "english", questionCount: 20, duration: 20, difficulty: "Easy", attempted: true, score: 95, bestScore: 95, attempts: 3 },
  { id: "11", title: "Reading Comprehension", subject: "English", subjectId: "english", questionCount: 25, duration: 30, difficulty: "Medium", attempted: false, attempts: 0 },
  { id: "12", title: "Critical Thinking", subject: "Logical Reasoning", subjectId: "logical-reasoning", questionCount: 20, duration: 20, difficulty: "Medium", attempted: true, score: 80, bestScore: 80, attempts: 1 },
];

export const sampleQuestions: Question[] = [
  {
    id: "q1",
    question: "Which organelle is known as the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
    correctAnswer: 1,
    explanation: "Mitochondria are called the powerhouse of the cell because they generate most of the cell's supply of ATP through oxidative phosphorylation.",
  },
  {
    id: "q2",
    question: "What is the primary function of ribosomes?",
    options: ["Energy production", "Protein synthesis", "Cell division", "DNA replication"],
    correctAnswer: 1,
    explanation: "Ribosomes are responsible for protein synthesis. They translate mRNA into polypeptide chains.",
  },
  {
    id: "q3",
    question: "Which type of bond involves the sharing of electron pairs between atoms?",
    options: ["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"],
    correctAnswer: 1,
    explanation: "Covalent bonds involve the sharing of electron pairs between atoms to achieve stable electron configurations.",
  },
  {
    id: "q4",
    question: "What is the SI unit of force?",
    options: ["Joule", "Watt", "Newton", "Pascal"],
    correctAnswer: 2,
    explanation: "The Newton (N) is the SI unit of force, defined as the force needed to accelerate a mass of 1 kg at 1 m/s².",
  },
  {
    id: "q5",
    question: "Which gas is most abundant in Earth's atmosphere?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"],
    correctAnswer: 2,
    explanation: "Nitrogen makes up approximately 78% of Earth's atmosphere, making it the most abundant gas.",
  },
];

export const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: "Ahmed Khan", avatar: "AK", score: 2450, quizzesCompleted: 45, streak: 30 },
  { rank: 2, name: "Sara Malik", avatar: "SM", score: 2380, quizzesCompleted: 42, streak: 25 },
  { rank: 3, name: "Hassan Ali", avatar: "HA", score: 2290, quizzesCompleted: 40, streak: 20 },
  { rank: 4, name: "Fatima Noor", avatar: "FN", score: 2180, quizzesCompleted: 38, streak: 18 },
  { rank: 5, name: "Usman Raza", avatar: "UR", score: 2100, quizzesCompleted: 36, streak: 15 },
  { rank: 6, name: "Ayesha Siddiq", avatar: "AS", score: 2050, quizzesCompleted: 35, streak: 14 },
  { rank: 7, name: "Bilal Ahmed", avatar: "BA", score: 1980, quizzesCompleted: 33, streak: 12 },
  { rank: 8, name: "Zainab Hussain", avatar: "ZH", score: 1920, quizzesCompleted: 31, streak: 10 },
  { rank: 9, name: "Omar Farooq", avatar: "OF", score: 1870, quizzesCompleted: 30, streak: 9 },
  { rank: 10, name: "Maryam Iqbal", avatar: "MI", score: 1820, quizzesCompleted: 28, streak: 8 },
];

export const statsData: StatsData = {
  totalQuizzes: 47,
  averageScore: 78.5,
  totalQuestions: 1410,
  correctAnswers: 1107,
  studyStreak: 12,
  totalStudyTime: "86h 45m",
  weeklyData: [
    { day: "Mon", score: 72, quizzes: 3 },
    { day: "Tue", score: 85, quizzes: 4 },
    { day: "Wed", score: 78, quizzes: 2 },
    { day: "Thu", score: 90, quizzes: 5 },
    { day: "Fri", score: 68, quizzes: 3 },
    { day: "Sat", score: 82, quizzes: 4 },
    { day: "Sun", score: 88, quizzes: 3 },
  ],
  subjectPerformance: [
    { subject: "Biology", score: 82, fill: "#10b981" },
    { subject: "Chemistry", score: 75, fill: "#2563eb" },
    { subject: "Physics", score: 70, fill: "#8b5cf6" },
    { subject: "English", score: 92, fill: "#f59e0b" },
    { subject: "Reasoning", score: 80, fill: "#ec4899" },
  ],
  monthlyProgress: [
    { month: "Jan", score: 65 },
    { month: "Feb", score: 70 },
    { month: "Mar", score: 72 },
    { month: "Apr", score: 78 },
    { month: "May", score: 82 },
    { month: "Jun", score: 78 },
  ],
};
