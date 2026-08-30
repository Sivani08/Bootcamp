import * as XLSX from "xlsx";

export interface VocabularyWord {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  meaning: string;
  simpleMeaning: string;
  prefix: string | null;
  prefixMeaning: string | null;
  root: string | null;
  rootMeaning: string | null;
  suffix: string | null;
  suffixMeaning: string | null;
  etymology: string | null;
  hasMorphologicalBreakdown: boolean;
  exampleSentence: string;
  synonyms: string[];
  antonyms: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface SentenceEvaluationItem {
  sentenceIndex: number; // 0, 1, 2
  text: string;
  passed: boolean;
  score: number; // 0 - 100
  vocabularyUsageScore: number; // 30%
  grammarScore: number; // 25%
  contextScore: number; // 20%
  structureScore: number; // 15%
  naturalnessScore: number; // 10%
  feedback: string;
  issueReason?: string;
  suggestedImprovementHint?: string;
}

export interface SpeechEvaluationResult {
  transcript: string;
  targetWordDetected: boolean;
  pronunciationScore: number; // 0 - 100
  isEstimatedPronunciation: boolean;
  grammarScore: number;
  usageScore: number;
  fluencyScore: number;
  confidenceScore: number;
  overallSpeakingScore: number;
  feedback: string;
}

export interface DailyVocabularyChallenge {
  id: string;
  traineeId: string;
  date: string; // YYYY-MM-DD
  wordId: string;
  word: string;
  currentStage: "word" | "explanation" | "writing" | "speaking" | "synonym_antonym" | "complete";
  completed: boolean;
  sentences: string[];
  sentenceEvaluations: SentenceEvaluationItem[];
  writingScore: number;
  typingDurationMs?: number;
  typingSuspicious?: boolean;
  suspiciousReason?: string;
  followUpAnswer?: string;
  speechTranscript: string | null;
  speechEvaluation: SpeechEvaluationResult | null;
  speakingScore: number;
  synonymSubmitted: string | null;
  antonymSubmitted: string | null;
  synonymCorrect: boolean | null;
  antonymCorrect: boolean | null;
  synonymFeedback?: string;
  antonymFeedback?: string;
  grammarScore: number;
  pronunciationScore: number;
  overallScore: number;
  createdAt: string;
  completedAt: string | null;
}

export interface TraineeVocabularyStreak {
  traineeId: string;
  currentStreak: number;
  longestStreak: number;
  wordsLearned: number;
  wordsMastered: number;
  avgWritingScore: number;
  avgSpeakingScore: number;
  avgGrammarScore: number;
  avgPronunciationScore: number;
  overallScore: number;
  lastCompletedDate: string | null;
  completedDates: string[]; // list of YYYY-MM-DD
}

export interface WordMasteryRecord {
  id: string;
  traineeId: string;
  wordId: string;
  word: string;
  status: "Learned" | "Practiced" | "Spoken" | "Mastered" | "Needs Revision";
  timesPracticed: number;
  lastScore: number;
  lastPracticedAt: string;
}

export interface VocabularyAchievement {
  id: string;
  traineeId: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

// Built-in dictionary database for common high-impact vocabulary words
export const DICTIONARY_DATABASE: Record<string, VocabularyWord> = {
  meticulous: {
    id: "word-meticulous",
    word: "meticulous",
    pronunciation: "meh-TIK-yuh-lus",
    partOfSpeech: "Adjective",
    meaning: "Very careful and precise, paying extreme attention to every detail.",
    simpleMeaning: "Careful and detail-oriented",
    prefix: null,
    prefixMeaning: null,
    root: "metus",
    rootMeaning: "fear / dread (Latin: originally fearful of making mistakes)",
    suffix: "-ous",
    suffixMeaning: "full of / possessing the quality of",
    etymology: "From Latin meticulosus (fearful, timid), later evolving in French and English to mean careful about small details.",
    hasMorphologicalBreakdown: true,
    exampleSentence: "She was meticulous when preparing the financial audit report for the executive board.",
    synonyms: ["careful", "thorough", "precise", "painstaking", "scrupulous", "fastidious", "detailed"],
    antonyms: ["careless", "slapdash", "negligent", "sloppy", "hasty", "inaccurate"],
    difficulty: "Intermediate",
  },
  pragmatic: {
    id: "word-pragmatic",
    word: "pragmatic",
    pronunciation: "prag-MAT-ik",
    partOfSpeech: "Adjective",
    meaning: "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.",
    simpleMeaning: "Practical and result-oriented",
    prefix: null,
    prefixMeaning: null,
    root: "pragma",
    rootMeaning: "deed / act / business (Greek)",
    suffix: "-ic",
    suffixMeaning: "relating to or characteristic of",
    etymology: "From Greek pragmatikos (fit for business or practical action).",
    hasMorphologicalBreakdown: true,
    exampleSentence: "The tech lead took a pragmatic approach to scope management to meet the project deadline.",
    synonyms: ["practical", "realistic", "sensible", "expedient", "down-to-earth", "businesslike"],
    antonyms: ["idealistic", "impractical", "unrealistic", "theoretical", "visionary"],
    difficulty: "Intermediate",
  },
  resilient: {
    id: "word-resilient",
    word: "resilient",
    pronunciation: "ri-ZIL-yuhnt",
    partOfSpeech: "Adjective",
    meaning: "Able to withstand or recover quickly from difficult conditions, setbacks, or stress.",
    simpleMeaning: "Quick to recover from hardship",
    prefix: "re-",
    prefixMeaning: "back / again",
    root: "salire",
    rootMeaning: "to leap / jump (Latin)",
    suffix: "-ent",
    suffixMeaning: "performing an action / being in a state",
    etymology: "From Latin resilientem, meaning to spring back or rebound.",
    hasMorphologicalBreakdown: true,
    exampleSentence: "The software architecture proved resilient even during peak infrastructure loads.",
    synonyms: ["adaptable", "tough", "buoyant", "robust", "tenacious", "flexible"],
    antonyms: ["fragile", "vulnerable", "weak", "rigid", "delicate"],
    difficulty: "Intermediate",
  },
  articulate: {
    id: "word-articulate",
    word: "articulate",
    pronunciation: "ar-TIK-yuh-lit",
    partOfSpeech: "Adjective / Verb",
    meaning: "Having or showing the ability to speak fluently and coherently; expressing ideas clearly.",
    simpleMeaning: "Clear and fluent in speech",
    prefix: null,
    prefixMeaning: null,
    root: "articulus",
    rootMeaning: "small joint or distinct part (Latin)",
    suffix: "-ate",
    suffixMeaning: "having the quality of / cause to become",
    etymology: "From Latin articulatus, meaning divided into distinct parts or joints.",
    hasMorphologicalBreakdown: true,
    exampleSentence: "He gave an articulate explanation of the microservices strategy during the client demo.",
    synonyms: ["fluent", "eloquent", "expressive", "clear", "coherent", "lucid"],
    antonyms: ["inarticulate", "unclear", "hesitant", "mumbling", "incoherent"],
    difficulty: "Intermediate",
  },
  ubiquitous: {
    id: "word-ubiquitous",
    word: "ubiquitous",
    pronunciation: "yoo-BIK-wih-tus",
    partOfSpeech: "Adjective",
    meaning: "Present, appearing, or found everywhere at the same time.",
    simpleMeaning: "Found everywhere",
    prefix: null,
    prefixMeaning: null,
    root: "ubique",
    rootMeaning: "everywhere (Latin)",
    suffix: "-ous",
    suffixMeaning: "full of / characterized by",
    etymology: "From Latin ubique (everywhere), formed by analogy with words like continuous.",
    hasMorphologicalBreakdown: true,
    exampleSentence: "Cloud computing infrastructure has become ubiquitous across modern corporate enterprises.",
    synonyms: ["omnipresent", "pervasive", "universal", "widespread", "ever-present"],
    antonyms: ["rare", "scarce", "uncommon", "infrequent"],
    difficulty: "Advanced",
  },
  tenacious: {
    id: "word-tenacious",
    word: "tenacious",
    pronunciation: "tuh-NAY-shus",
    partOfSpeech: "Adjective",
    meaning: "Holding firm to a purpose, opinion, or goal; highly persistent and determined.",
    simpleMeaning: "Persistent and determined",
    prefix: null,
    prefixMeaning: null,
    root: "tenere",
    rootMeaning: "to hold (Latin)",
    suffix: "-ious",
    suffixMeaning: "full of / tending to",
    etymology: "From Latin tenax (holding fast, clinging).",
    hasMorphologicalBreakdown: true,
    exampleSentence: "The debugging team was tenacious in uncovering the root cause of the memory leak.",
    synonyms: ["persistent", "determined", "resolute", "steadfast", "dogged", "persevering"],
    antonyms: ["half-hearted", "yielding", "irresolute", "surrendering", "wavering"],
    difficulty: "Intermediate",
  },
  ephemeral: {
    id: "word-ephemeral",
    word: "ephemeral",
    pronunciation: "ih-FEM-er-uhl",
    partOfSpeech: "Adjective",
    meaning: "Lasting for a very short time; transitory or fleeting.",
    simpleMeaning: "Short-lived or temporary",
    prefix: "epi-",
    prefixMeaning: "upon / for",
    root: "hemera",
    rootMeaning: "day (Greek)",
    suffix: "-al",
    suffixMeaning: "relating to",
    etymology: "From Greek ephemeros (lasting only one day).",
    hasMorphologicalBreakdown: true,
    exampleSentence: "Container logs are ephemeral unless explicitly backed up to a persistent log stream.",
    synonyms: ["fleeting", "transient", "temporary", "momentary", "short-lived", "brief"],
    antonyms: ["permanent", "eternal", "everlasting", "enduring", "perpetual"],
    difficulty: "Advanced",
  },
  synergy: {
    id: "word-synergy",
    word: "synergy",
    pronunciation: "SIN-er-jee",
    partOfSpeech: "Noun",
    meaning: "The interaction or cooperation of two or more organizations or substances to produce a combined effect greater than the sum of their separate effects.",
    simpleMeaning: "Combined effort producing greater results",
    prefix: "syn-",
    prefixMeaning: "together / with",
    root: "ergon",
    rootMeaning: "work (Greek)",
    suffix: "-y",
    suffixMeaning: "state / quality",
    etymology: "From Greek synergia (working together).",
    hasMorphologicalBreakdown: true,
    exampleSentence: "The synergy between data science and product engineering delivered exceptional automated insights.",
    synonyms: ["cooperation", "collaboration", "teamwork", "alliance", "symbiosis", "harmony"],
    antonyms: ["antagonism", "conflict", "discord", "incompatibility"],
    difficulty: "Intermediate",
  },
  candor: {
    id: "word-candor",
    word: "candor",
    pronunciation: "KAN-der",
    partOfSpeech: "Noun",
    meaning: "The quality of being open, honest, and sincere in speech or expression.",
    simpleMeaning: "Frank honesty and openness",
    prefix: null,
    prefixMeaning: null,
    root: "candere",
    rootMeaning: "to shine / be white (Latin)",
    suffix: "-or",
    suffixMeaning: "state or quality",
    etymology: "From Latin candor (whiteness, brightness, purity).",
    hasMorphologicalBreakdown: true,
    exampleSentence: "The team appreciated the mentor's candor during the retrospective meeting.",
    synonyms: ["honesty", "frankness", "openness", "directness", "sincerity", "truthfulness"],
    antonyms: ["deceit", "guile", "insincerity", "dishonesty", "evasiveness"],
    difficulty: "Intermediate",
  },
  ambiguous: {
    id: "word-ambiguous",
    word: "ambiguous",
    pronunciation: "am-BIG-yoo-us",
    partOfSpeech: "Adjective",
    meaning: "Open to more than one interpretation; not having one obvious meaning.",
    simpleMeaning: "Unclear or open to interpretation",
    prefix: "ambi-",
    prefixMeaning: "both / around",
    root: "agere",
    rootMeaning: "to drive / lead (Latin)",
    suffix: "-ous",
    suffixMeaning: "possessing the qualities of",
    etymology: "From Latin ambiguus (uncertain, moving from side to side).",
    hasMorphologicalBreakdown: true,
    exampleSentence: "The requirements doc had ambiguous phrasing, so the trainee requested clarification.",
    synonyms: ["unclear", "equivocal", "vague", "uncertain", "doubtful", "obscure"],
    antonyms: ["clear", "explicit", "unambiguous", "lucid", "definitive"],
    difficulty: "Intermediate",
  },
};

// Local storage key constants
const STORAGE_KEYS = {
  STREAK: "bootmind_local_vocab_streak",
  CHALLENGES: "bootmind_local_vocab_challenges",
  MASTERY: "bootmind_local_vocab_mastery",
  ACHIEVEMENTS: "bootmind_local_vocab_achievements",
};

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function readLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function writeLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("Error saving vocabulary data to localStorage:", err);
  }
}

export function getTraineeStreak(traineeId: string): TraineeVocabularyStreak {
  const allStreaks = readLocalStorage<Record<string, TraineeVocabularyStreak>>(STORAGE_KEYS.STREAK, {});
  if (allStreaks[traineeId]) {
    return allStreaks[traineeId];
  }
  // Initial default streak state for new or seeded trainee
  const defaultStreak: TraineeVocabularyStreak = {
    traineeId,
    currentStreak: 5,
    longestStreak: 12,
    wordsLearned: 14,
    wordsMastered: 10,
    avgWritingScore: 88,
    avgSpeakingScore: 84,
    avgGrammarScore: 90,
    avgPronunciationScore: 85,
    overallScore: 87,
    lastCompletedDate: null,
    completedDates: [],
  };
  allStreaks[traineeId] = defaultStreak;
  writeLocalStorage(STORAGE_KEYS.STREAK, allStreaks);
  return defaultStreak;
}

export function updateTraineeStreak(traineeId: string, challenge: DailyVocabularyChallenge): TraineeVocabularyStreak {
  const allStreaks = readLocalStorage<Record<string, TraineeVocabularyStreak>>(STORAGE_KEYS.STREAK, {});
  let s = allStreaks[traineeId] || getTraineeStreak(traineeId);

  const today = challenge.date;
  const dates = new Set(s.completedDates || []);

  // Check if today was already completed
  if (!dates.has(today) && challenge.completed) {
    dates.add(today);

    // Calculate streak logic (check yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    let newCurrent = s.currentStreak;
    if (s.lastCompletedDate === yStr) {
      newCurrent += 1;
    } else if (s.lastCompletedDate === today) {
      // already recorded today, no change
    } else {
      // streak reset if missed day
      newCurrent = 1;
    }

    const newLongest = Math.max(s.longestStreak, newCurrent);
    const newLearned = s.wordsLearned + 1;
    const newMastered = challenge.overallScore >= 85 ? s.wordsMastered + 1 : s.wordsMastered;

    // Recalculate average scores
    const count = dates.size || 1;
    const newAvgWriting = Math.round(((s.avgWritingScore * (count - 1)) + challenge.writingScore) / count);
    const newAvgSpeaking = Math.round(((s.avgSpeakingScore * (count - 1)) + challenge.speakingScore) / count);
    const newAvgGrammar = Math.round(((s.avgGrammarScore * (count - 1)) + challenge.grammarScore) / count);
    const newAvgPronunciation = Math.round(((s.avgPronunciationScore * (count - 1)) + challenge.pronunciationScore) / count);
    const newOverall = Math.round((newAvgWriting + newAvgSpeaking + newAvgGrammar + newAvgPronunciation) / 4);

    s = {
      ...s,
      currentStreak: newCurrent,
      longestStreak: newLongest,
      wordsLearned: newLearned,
      wordsMastered: newMastered,
      avgWritingScore: newAvgWriting,
      avgSpeakingScore: newAvgSpeaking,
      avgGrammarScore: newAvgGrammar,
      avgPronunciationScore: newAvgPronunciation,
      overallScore: newOverall,
      lastCompletedDate: today,
      completedDates: Array.from(dates),
    };

    allStreaks[traineeId] = s;
    writeLocalStorage(STORAGE_KEYS.STREAK, allStreaks);
    checkAndUnlockAchievements(traineeId, s, challenge);
  }

  return s;
}

export function getDailyChallenge(traineeId: string, date: string): DailyVocabularyChallenge | null {
  const challenges = readLocalStorage<DailyVocabularyChallenge[]>(STORAGE_KEYS.CHALLENGES, []);
  return challenges.find((c) => c.traineeId === traineeId && c.date === date) || null;
}

export function saveDailyChallenge(challenge: DailyVocabularyChallenge): void {
  const challenges = readLocalStorage<DailyVocabularyChallenge[]>(STORAGE_KEYS.CHALLENGES, []);
  const idx = challenges.findIndex((c) => c.traineeId === challenge.traineeId && c.date === challenge.date);
  if (idx >= 0) {
    challenges[idx] = challenge;
  } else {
    challenges.push(challenge);
  }
  writeLocalStorage(STORAGE_KEYS.CHALLENGES, challenges);

  // If completed, update streak & mastery
  if (challenge.completed) {
    updateTraineeStreak(challenge.traineeId, challenge);
    updateWordMastery(challenge.traineeId, challenge.wordId, challenge.word, challenge.overallScore);
  }
}

export function getAllTraineeChallenges(traineeId: string): DailyVocabularyChallenge[] {
  const challenges = readLocalStorage<DailyVocabularyChallenge[]>(STORAGE_KEYS.CHALLENGES, []);
  return challenges.filter((c) => c.traineeId === traineeId).sort((a, b) => b.date.localeCompare(a.date));
}

export function getAllChallenges(): DailyVocabularyChallenge[] {
  return readLocalStorage<DailyVocabularyChallenge[]>(STORAGE_KEYS.CHALLENGES, []);
}

export function getWordMasteryRecords(traineeId: string): WordMasteryRecord[] {
  const allMastery = readLocalStorage<Record<string, WordMasteryRecord[]>>(STORAGE_KEYS.MASTERY, {});
  return allMastery[traineeId] || [];
}

export function updateWordMastery(traineeId: string, wordId: string, word: string, score: number): void {
  const allMastery = readLocalStorage<Record<string, WordMasteryRecord[]>>(STORAGE_KEYS.MASTERY, {});
  const records = allMastery[traineeId] || [];

  const existingIdx = records.findIndex((r) => r.wordId === wordId || r.word.toLowerCase() === word.toLowerCase());
  const status: WordMasteryRecord["status"] = score >= 90 ? "Mastered" : score >= 80 ? "Spoken" : score >= 70 ? "Practiced" : "Needs Revision";

  if (existingIdx >= 0 && records[existingIdx]) {
    const rec = records[existingIdx];
    records[existingIdx] = {
      ...rec,
      status,
      timesPracticed: rec.timesPracticed + 1,
      lastScore: score,
      lastPracticedAt: new Date().toISOString(),
    };
  } else {
    records.push({
      id: `mastery-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      traineeId,
      wordId,
      word,
      status,
      timesPracticed: 1,
      lastScore: score,
      lastPracticedAt: new Date().toISOString(),
    });
  }

  allMastery[traineeId] = records;
  writeLocalStorage(STORAGE_KEYS.MASTERY, allMastery);
}

export function getTraineeAchievements(traineeId: string): VocabularyAchievement[] {
  const allAch = readLocalStorage<Record<string, VocabularyAchievement[]>>(STORAGE_KEYS.ACHIEVEMENTS, {});
  return allAch[traineeId] || getSeedAchievements(traineeId);
}

function getSeedAchievements(traineeId: string): VocabularyAchievement[] {
  const now = new Date().toISOString();
  return [
    { id: "ach-1", traineeId, code: "streak_7", title: "7-Day Streak", description: "Completed 7 consecutive days of vocabulary challenges", icon: "🔥", unlockedAt: now },
    { id: "ach-2", traineeId, code: "words_10", title: "10 Words Learned", description: "Learned and completed 10 vocabulary breakdown modules", icon: "📚", unlockedAt: now },
    { id: "ach-3", traineeId, code: "speaking_90", title: "Speech Master", description: "Achieved 90%+ in speaking challenge evaluation", icon: "🎙️", unlockedAt: now },
  ];
}

export function checkAndUnlockAchievements(traineeId: string, streak: TraineeVocabularyStreak, challenge: DailyVocabularyChallenge): void {
  const current = getTraineeAchievements(traineeId);
  const existingCodes = new Set(current.map((a) => a.code));
  const newUnlocks: VocabularyAchievement[] = [];
  const now = new Date().toISOString();

  if (streak.currentStreak >= 7 && !existingCodes.has("streak_7")) {
    newUnlocks.push({ id: `ach-${Date.now()}-1`, traineeId, code: "streak_7", title: "7-Day Streak", description: "Completed 7 consecutive days of vocabulary challenges", icon: "🔥", unlockedAt: now });
  }
  if (streak.currentStreak >= 14 && !existingCodes.has("streak_14")) {
    newUnlocks.push({ id: `ach-${Date.now()}-2`, traineeId, code: "streak_14", title: "14-Day Streak", description: "Completed 14 consecutive days of vocabulary challenges", icon: "🔥", unlockedAt: now });
  }
  if (streak.currentStreak >= 30 && !existingCodes.has("streak_30")) {
    newUnlocks.push({ id: `ach-${Date.now()}-3`, traineeId, code: "streak_30", title: "30-Day Streak", description: "Completed 30 consecutive days of vocabulary challenges", icon: "🏆", unlockedAt: now });
  }
  if (streak.wordsLearned >= 25 && !existingCodes.has("words_25")) {
    newUnlocks.push({ id: `ach-${Date.now()}-4`, traineeId, code: "words_25", title: "25 Words Learned", description: "Mastered 25 corporate vocabulary words", icon: "📚", unlockedAt: now });
  }
  if (streak.wordsLearned >= 50 && !existingCodes.has("words_50")) {
    newUnlocks.push({ id: `ach-${Date.now()}-5`, traineeId, code: "words_50", title: "50 Words Mastered", description: "Expanded vocabulary database to 50 active words", icon: "🎓", unlockedAt: now });
  }
  if (challenge.speakingScore >= 90 && !existingCodes.has("speaking_90")) {
    newUnlocks.push({ id: `ach-${Date.now()}-6`, traineeId, code: "speaking_90", title: "Voice & Fluency Star", description: "Scored 90%+ in a daily speaking assessment", icon: "🎙️", unlockedAt: now });
  }
  if (challenge.writingScore >= 90 && !existingCodes.has("writing_90")) {
    newUnlocks.push({ id: `ach-${Date.now()}-7`, traineeId, code: "writing_90", title: "Syntax & Grammar Expert", description: "Constructed 3 perfect sentences with 90%+ writing score", icon: "✍️", unlockedAt: now });
  }
  if (streak.wordsMastered >= 10 && !existingCodes.has("mastered_10")) {
    newUnlocks.push({ id: `ach-${Date.now()}-8`, traineeId, code: "mastered_10", title: "10 Words Mastered", description: "Achieved Mastered rank for 10 vocabulary items", icon: "⭐", unlockedAt: now });
  }

  if (newUnlocks.length > 0) {
    const updated = [...current, ...newUnlocks];
    const allAch = readLocalStorage<Record<string, VocabularyAchievement[]>>(STORAGE_KEYS.ACHIEVEMENTS, {});
    allAch[traineeId] = updated;
    writeLocalStorage(STORAGE_KEYS.ACHIEVEMENTS, allAch);
  }
}

// Anti-cheating submission verification logic
export interface AntiCheatResult {
  isSuspicious: boolean;
  reason?: string;
}

export function validateSentencesAntiCheat(sentences: string[], durationMs: number): AntiCheatResult {
  const trimmed = sentences.map((s) => s.trim());
  if (trimmed.some((s) => s.length === 0)) {
    return { isSuspicious: false };
  }

  // 1. Duplicate or near-identical sentence check
  const lower = trimmed.map((s) => s.toLowerCase());
  if (new Set(lower).size < trimmed.length) {
    return {
      isSuspicious: true,
      reason: "Sentences appear to be identical or duplicate. Please enter 3 distinct original sentences.",
    };
  }

  // 2. Instant typing detection (< 3.5 seconds total for 3 full sentences)
  const totalLength = trimmed.join(" ").length;
  if (totalLength > 60 && durationMs < 3500) {
    return {
      isSuspicious: true,
      reason: "Sentences were entered extremely fast. Please type out your own original sentences.",
    };
  }

  // 3. High similarity detection (e.g. changing just 1 word)
  const similarityScore = (str1: string, str2: string) => {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    return (intersection.size * 2) / (words1.size + words2.size);
  };

  const s0 = trimmed[0] || "";
  const s1 = trimmed[1] || "";
  const s2 = trimmed[2] || "";

  if (
    similarityScore(s0, s1) > 0.85 ||
    similarityScore(s1, s2) > 0.85 ||
    similarityScore(s0, s2) > 0.85
  ) {
    return {
      isSuspicious: true,
      reason: "Your sentences look almost identical to each other. Try using the word in completely different business contexts.",
    };
  }

  return { isSuspicious: false };
}

// Excel exporter for Mentor Vocabulary Reports
export function exportVocabularyReport(
  trainees: { id: string; name: string; email: string; batch: string; domain: string }[],
  challenges: DailyVocabularyChallenge[],
  streaks: Record<string, TraineeVocabularyStreak>,
  filename: string = "BootMind-Vocabulary-Report.xlsx"
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Cohort Overview
  const overviewRows = trainees.map((t) => {
    const s = streaks[t.id] || {
      currentStreak: 0,
      longestStreak: 0,
      wordsLearned: 0,
      wordsMastered: 0,
      avgWritingScore: 0,
      avgSpeakingScore: 0,
      avgGrammarScore: 0,
      avgPronunciationScore: 0,
      overallScore: 0,
    };
    return {
      "Trainee Name": t.name,
      Email: t.email,
      Batch: t.batch,
      Domain: t.domain,
      "Current Streak 🔥": s.currentStreak,
      "Longest Streak": s.longestStreak,
      "Words Learned": s.wordsLearned,
      "Words Mastered": s.wordsMastered,
      "Writing Score %": s.avgWritingScore,
      "Speaking Score %": s.avgSpeakingScore,
      "Grammar Score %": s.avgGrammarScore,
      "Pronunciation Score %": s.avgPronunciationScore,
      "Overall Score %": s.overallScore,
      Status: s.overallScore >= 85 ? "Strong" : s.overallScore >= 75 ? "Improving" : "Needs Support",
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(overviewRows), "Cohort Overview");

  // Sheet 2: Daily Submissions Log
  const logRows = challenges.map((c) => {
    const trainee = trainees.find((t) => t.id === c.traineeId);
    return {
      Date: c.date,
      "Trainee Name": trainee?.name ?? c.traineeId,
      Batch: trainee?.batch ?? "—",
      Word: c.word.toUpperCase(),
      Writing: c.writingScore,
      Speaking: c.speakingScore,
      Grammar: c.grammarScore,
      Pronunciation: c.pronunciationScore,
      "Synonym Valid": c.synonymCorrect ? "YES" : "NO",
      "Antonym Valid": c.antonymCorrect ? "YES" : "NO",
      "Overall Score %": c.overallScore,
      "Completion Status": c.completed ? "COMPLETED" : "INCOMPLETE",
      "Sentence 1": c.sentences[0] || "",
      "Sentence 2": c.sentences[1] || "",
      "Sentence 3": c.sentences[2] || "",
      "Spoken Transcript": c.speechTranscript || "",
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logRows), "Submission Log");

  XLSX.writeFile(wb, filename);
}
