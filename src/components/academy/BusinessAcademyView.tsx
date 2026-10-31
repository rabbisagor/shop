import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  HelpCircle,
  ListChecks,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LearningLesson } from '../../types';
import { formatNumber } from '../../utils/numberConverter';

export const BusinessAcademyView: React.FC = () => {
  const { learningLessons, markLessonCompleted, settings } = useApp();
  const useBn = settings.useBengaliNumerals;

  const [selectedLesson, setSelectedLesson] = useState<LearningLesson>(learningLessons[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Checklist state for active lesson
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Quiz state for active lesson
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const completedCount = learningLessons.filter((l) => l.isCompleted).length;
  const progressPercent = Math.round((completedCount / learningLessons.length) * 100);

  const categories = [
    'all',
    'প্রস্তুতি ও শুরু',
    'ক্রয় ও সরবরাহ',
    'মূল্য ও লাভ',
    'দোকান পরিচালনা',
    'ঝুঁকি ও আইনি বিষয়',
    'ব্যবসার সম্প্রসারণ',
  ];

  const filteredLessons = learningLessons.filter((l) => {
    if (selectedCategory !== 'all' && l.category !== selectedCategory) return false;
    return true;
  });

  const handleSelectLesson = (lesson: LearningLesson) => {
    setSelectedLesson(lesson);
    setUserAnswers({});
    setQuizSubmitted(false);
    setCheckedItems({});
  };

  const toggleCheckItem = (idx: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleSelectAnswer = (qIndex: number, optIndex: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qIndex]: optIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    selectedLesson.quiz.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);

    if (score === selectedLesson.quiz.length) {
      markLessonCompleted(selectedLesson.id);
      // Trigger festive confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  };

  return (
    <div className="space-y-6">
      {/* Academy Hero Header & Progress */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/60 backdrop-blur-xs text-xs font-bold text-emerald-200">
              <GraduationCap className="w-4 h-4" />
              <span>মুদি ব্যবসা প্রশিক্ষণ কোর্স</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              মুদি দোকান ব্যবসা শেখার সম্পূর্ণ একাডেমি
            </h2>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              দোকান শুরুর প্রস্তুতি থেকে লাভজনক পরিচালনা ও বড় সুপারশপে উন্নীত হওয়ার ১৮টি প্র্যাকটিক্যাল বাংলা পাঠ
            </p>
          </div>

          {/* Progress Badge */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 min-w-[200px] text-right">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-emerald-200 font-semibold">কোর্স অগ্রগতি:</span>
              <span className="font-mono font-bold text-sm">
                {formatNumber(completedCount, useBn)} / {formatNumber(learningLessons.length, useBn)} পাঠ
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              />
            </div>
            <span className="text-[11px] text-emerald-200/80 block mt-1">
              {formatNumber(progressPercent, useBn)}% সম্পন্ন হয়েছে
            </span>
          </div>
        </div>
      </div>

      {/* Main Course Layout: Left Navigation + Right Lesson Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Lesson Index (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>১৮টি পাঠের সূচিপত্র</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Curriculum</span>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold outline-none"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            {categories.filter((c) => c !== 'all').map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Lesson Buttons List */}
          <div className="max-h-[580px] overflow-y-auto space-y-1.5 pr-1">
            {filteredLessons.map((lesson) => {
              const isSelected = selectedLesson.id === lesson.id;
              const isDone = lesson.isCompleted;

              return (
                <button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  className={`w-full p-2.5 rounded-2xl text-left transition flex items-center justify-between gap-2 border ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 shadow-xs'
                      : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold font-mono shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isSelected
                          ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : formatNumber(lesson.id, useBn)}
                    </span>

                    <div className="truncate">
                      <div
                        className={`text-xs font-bold truncate ${
                          isSelected
                            ? 'text-emerald-900 dark:text-emerald-200'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {lesson.titleBn}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{formatNumber(lesson.readTimeMinutes, useBn)} মিনিট পাঠ</span>
                      </div>
                    </div>
                  </div>

                  {isDone && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold shrink-0">
                      উত্তীর্ণ
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Lesson Content (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          {/* Active Lesson Header */}
          <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {selectedLesson.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                সময়: {formatNumber(selectedLesson.readTimeMinutes, useBn)} মিনিট
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {selectedLesson.titleBn}
            </h3>

            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 leading-relaxed">
              {selectedLesson.overviewBn}
            </p>
          </div>

          {/* Detailed Paragraphs */}
          <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {selectedLesson.detailedContentBn.map((para, i) => (
              <p key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                {para}
              </p>
            ))}
          </div>

          {/* Practical Examples */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-xs">
            <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>বাস্তব দোকানের উদাহরণ (Real World Grocery Case Study)</span>
            </div>
            {selectedLesson.practicalExamplesBn.map((ex, i) => (
              <p key={i} className="text-emerald-950 dark:text-emerald-200 leading-relaxed">
                {ex}
              </p>
            ))}
          </div>

          {/* Action Checklist with interactive Checkboxes */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-emerald-600" />
              <span>বাস্তবায়ন চেকলিস্ট (আপনার করণীয় পদক্ষেপ)</span>
            </div>
            <div className="space-y-2">
              {selectedLesson.actionChecklistBn.map((item, idx) => {
                const isChecked = !!checkedItems[idx];
                return (
                  <label
                    key={idx}
                    onClick={() => toggleCheckItem(idx)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className={isChecked ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}>
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2 text-xs text-rose-900 dark:text-rose-200">
            <div className="font-bold flex items-center gap-1.5 text-rose-800 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>সাধারণ মারাত্মক ভুলসমূহ (যা কখনোই করবেন না)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-rose-900/90 dark:text-rose-200 leading-relaxed">
              {selectedLesson.commonMistakesBn.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>

          {/* Interactive Quiz Section */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white dark:bg-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  পাঠ মূল্যায়ন কুইজ (Quiz Test)
                </h4>
              </div>
              <span className="text-xs text-emerald-400 font-mono">
                {formatNumber(selectedLesson.quiz.length, useBn)}টি প্রশ্ন
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {selectedLesson.quiz.map((q, qIndex) => {
                const userSelected = userAnswers[qIndex];
                const isCorrect = userSelected === q.correctAnswerIndex;

                return (
                  <div key={qIndex} className="p-3.5 rounded-2xl bg-slate-800/80 dark:bg-slate-900/80 space-y-2">
                    <p className="font-bold text-white leading-relaxed">
                      {formatNumber(qIndex + 1, useBn)}. {q.questionBn}
                    </p>

                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {q.optionsBn.map((opt, optIndex) => {
                        const isChosen = userSelected === optIndex;
                        let btnStyle = 'bg-slate-700/60 hover:bg-slate-700 text-slate-200';

                        if (quizSubmitted) {
                          if (optIndex === q.correctAnswerIndex) {
                            btnStyle = 'bg-emerald-600 text-white font-bold';
                          } else if (isChosen && !isCorrect) {
                            btnStyle = 'bg-rose-600 text-white font-bold';
                          }
                        } else if (isChosen) {
                          btnStyle = 'bg-emerald-500 text-white font-bold';
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => handleSelectAnswer(qIndex, optIndex)}
                            className={`p-2.5 rounded-xl text-left text-xs transition ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-2.5 rounded-xl bg-slate-700/40 text-[11px] leading-relaxed text-emerald-300 mt-2">
                        <strong>ব্যাখ্যা:</strong> {q.explanationBn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Submit & Score */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              {quizSubmitted ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-emerald-400">
                    স্কোর: {formatNumber(quizScore, useBn)} / {formatNumber(selectedLesson.quiz.length, useBn)}
                  </span>
                  {quizScore === selectedLesson.quiz.length ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>চমৎকার! পাঠটি সম্পন্ন হয়েছে</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setUserAnswers({});
                      }}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      আবার চেষ্টা করুন
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-xs text-slate-400">
                  সব প্রশ্নের উত্তর দিয়ে সাবমিট বাটনে চাপুন।
                </span>
              )}

              {!quizSubmitted && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(userAnswers).length !== selectedLesson.quiz.length}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition ${
                    Object.keys(userAnswers).length === selectedLesson.quiz.length
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md'
                      : 'bg-slate-700 cursor-not-allowed opacity-60'
                  }`}
                >
                  কুইজ সাবমিট করুন
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
