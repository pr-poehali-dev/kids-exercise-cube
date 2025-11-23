import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const exercises = [
  {
    id: 1,
    name: 'Прыжки',
    emoji: '🦘',
    instructions: 'Прыгай высоко-высоко! Руки вверх, ноги вместе!',
    color: '#FF6B9D'
  },
  {
    id: 2,
    name: 'Приседания',
    emoji: '🐸',
    instructions: 'Присядь как лягушка! Спинка прямая, руки вперёд!',
    color: '#8B5CF6'
  },
  {
    id: 3,
    name: 'Наклоны',
    emoji: '🌊',
    instructions: 'Наклонись и дотянись до пальчиков ног!',
    color: '#0EA5E9'
  },
  {
    id: 4,
    name: 'Махи руками',
    emoji: '🦅',
    instructions: 'Взмахни руками как птица! Широко-широко!',
    color: '#FFA629'
  },
  {
    id: 5,
    name: 'Повороты',
    emoji: '🌪️',
    instructions: 'Повернись вправо и влево! Как юла!',
    color: '#D946EF'
  },
  {
    id: 6,
    name: 'Бег на месте',
    emoji: '🏃',
    instructions: 'Беги на месте! Колени выше!',
    color: '#4ADE80'
  }
];

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const vibrate = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (e) {
    console.log('Audio not supported');
  }
};

const playDiceRollSound = () => {
  const notes = [200, 250, 300, 350, 400, 450, 500, 550];
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playSound(freq, 100, 'square');
    }, i * 200);
  });
  
  setTimeout(() => {
    playSound(600, 150, 'sine');
    setTimeout(() => playSound(650, 150, 'sine'), 80);
  }, notes.length * 200);
};

const playSuccess = () => {
  playSound(523, 100);
  setTimeout(() => playSound(659, 100), 100);
  setTimeout(() => playSound(784, 200), 200);
};

const playAchievement = () => {
  playSound(659, 150);
  setTimeout(() => playSound(784, 150), 150);
  setTimeout(() => playSound(880, 150), 300);
  setTimeout(() => playSound(1047, 300), 450);
};

const playTick = () => {
  playSound(800, 50, 'sine');
};

export default function Index() {
  const [isRolling, setIsRolling] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<number | null>(null);
  const [showExercise, setShowExercise] = useState(false);
  const [repsCount, setRepsCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [canComplete, setCanComplete] = useState(false);
  const [diceFace, setDiceFace] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<Array<{id: number, x: number, delay: number, color: string}>>([]);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('completedExercises');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('achievements');
    return saved ? JSON.parse(saved) : [
      { id: 'jump', title: 'Кенгуру 🦘', description: 'Выполнил прыжки', icon: '🦘', unlocked: false },
      { id: 'squat', title: 'Лягушонок 🐸', description: 'Выполнил приседания', icon: '🐸', unlocked: false },
      { id: 'bend', title: 'Волна 🌊', description: 'Выполнил наклоны', icon: '🌊', unlocked: false },
      { id: 'arms', title: 'Орёл 🦅', description: 'Выполнил махи руками', icon: '🦅', unlocked: false },
      { id: 'turn', title: 'Торнадо 🌪️', description: 'Выполнил повороты', icon: '🌪️', unlocked: false },
      { id: 'run', title: 'Спринтер 🏃', description: 'Выполнил бег на месте', icon: '🏃', unlocked: false },
      { id: 'master', title: 'Мастер Зарядки 🏆', description: 'Выполнил все упражнения!', icon: '🏆', unlocked: false }
    ];
  });
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [totalCompleted, setTotalCompleted] = useState(() => {
    const saved = localStorage.getItem('totalCompleted');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('completedExercises', JSON.stringify(Array.from(completedExercises)));
  }, [completedExercises]);

  useEffect(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('totalCompleted', totalCompleted.toString());
  }, [totalCompleted]);

  useEffect(() => {
    if (showExercise) {
      playSuccess();
      setTimeLeft(10);
      setCanComplete(false);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanComplete(true);
            playSuccess();
            clearInterval(timer);
            return 0;
          }
          if (prev <= 4) {
            playTick();
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showExercise]);

  const rollDice = () => {
    vibrate([50, 30, 50, 30, 50]);
    playDiceRollSound();
    
    setIsRolling(true);
    
    let rotationCount = 0;
    const animationInterval = setInterval(() => {
      setDiceFace((prev) => (prev + 1) % 6);
      rotationCount++;
      if (rotationCount >= 12) {
        clearInterval(animationInterval);
      }
    }, 150);

    setTimeout(() => {
      vibrate(100);
      playSound(400, 150, 'triangle');
      const randomIndex = Math.floor(Math.random() * exercises.length);
      const randomReps = Math.floor(Math.random() * 7) + 4;
      setCurrentExercise(randomIndex);
      setDiceFace(randomIndex);
      setRepsCount(randomReps);
      setIsRolling(false);
      
      setTimeout(() => {
        setShowExercise(true);
      }, 500);
    }, 2000);
  };

  const unlockAchievement = (exerciseId: number) => {
    const achievementIds = ['jump', 'squat', 'bend', 'arms', 'turn', 'run'];
    const achievementId = achievementIds[exerciseId];
    
    setAchievements(prev => {
      const updated = prev.map(ach => 
        ach.id === achievementId ? { ...ach, unlocked: true } : ach
      );
      
      const unlockedAch = updated.find(a => a.id === achievementId);
      if (unlockedAch && !achievements.find(a => a.id === achievementId)?.unlocked) {
        setNewAchievement(unlockedAch);
        playAchievement();
        vibrate([100, 50, 100, 50, 100]);
        
        setTimeout(() => setNewAchievement(null), 3000);
      }
      
      const allExercisesUnlocked = updated.slice(0, 6).every(a => a.unlocked);
      if (allExercisesUnlocked && !updated[6].unlocked) {
        setTimeout(() => {
          const masterAch = { ...updated[6], unlocked: true };
          setAchievements(prev => prev.map((a, i) => i === 6 ? masterAch : a));
          setNewAchievement(masterAch);
          playAchievement();
          vibrate([100, 50, 100, 50, 200]);
          setTimeout(() => setNewAchievement(null), 3000);
        }, 3500);
      }
      
      return updated;
    });
  };

  const handleComplete = () => {
    vibrate([100, 50, 100]);
    playSuccess();
    
    if (currentExercise !== null) {
      const newCompleted = new Set(completedExercises);
      newCompleted.add(currentExercise);
      setCompletedExercises(newCompleted);
      setTotalCompleted(prev => prev + 1);
      unlockAchievement(currentExercise);
    }
    
    const pieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 200,
      color: ['#FF6B9D', '#8B5CF6', '#0EA5E9', '#FFA629', '#D946EF', '#4ADE80'][Math.floor(Math.random() * 6)]
    }));
    setConfettiPieces(pieces);
    setShowConfetti(true);
    
    setTimeout(() => {
      setShowConfetti(false);
      setShowExercise(false);
      setCurrentExercise(null);
    }, 2000);
  };

  if (showExercise && currentExercise !== null) {
    const exercise = exercises[currentExercise];
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in safe-area-inset relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${exercise.color}40 0%, ${exercise.color}20 100%)`
        }}
      >
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {confettiPieces.map((piece) => (
              <div
                key={piece.id}
                className="confetti-piece"
                style={{
                  left: `${piece.x}%`,
                  animationDelay: `${piece.delay}ms`,
                  backgroundColor: piece.color
                }}
              />
            ))}
          </div>
        )}
        
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-white rounded-2xl sm:rounded-3xl shadow-2xl px-4 py-2 sm:px-8 sm:py-4 animate-scale-in animate-pulse-slow">
          <div className="text-4xl sm:text-6xl font-black" style={{ color: exercise.color }}>
            {repsCount}
          </div>
          <div className="text-xs sm:text-sm font-bold text-gray-600 text-center mt-1">раз</div>
        </div>

        <Card className="max-w-2xl w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-12 animate-scale-in mx-4">
          <div className="text-7xl sm:text-9xl text-center mb-6 sm:mb-8 animate-bounce-custom">
            {exercise.emoji}
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black text-center mb-4 sm:mb-6 animate-wiggle" style={{ color: exercise.color }}>
            {exercise.name}
          </h1>
          
          <p className="text-xl sm:text-3xl text-center text-gray-700 font-bold leading-relaxed mb-8 sm:mb-12">
            {exercise.instructions}
          </p>

          <div className="flex flex-col items-center gap-4 sm:gap-6">
            {!canComplete && (
              <div className={`text-xl sm:text-2xl font-bold ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                Подожди {timeLeft} сек... ⏳
              </div>
            )}
            
            <Button
              onClick={handleComplete}
              disabled={!canComplete}
              className={`text-2xl sm:text-3xl font-black py-6 px-12 sm:py-8 sm:px-16 rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-300 active:scale-95 sm:hover:scale-110 disabled:opacity-50 disabled:scale-100 touch-manipulation ${canComplete ? 'animate-wiggle' : ''}`}
              style={{
                backgroundColor: canComplete ? exercise.color : '#ccc',
                color: 'white'
              }}
            >
              Выполнил! ✓
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 safe-area-inset animate-gradient">
      {newAchievement && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-scale-in">
          <Card className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 border-4 border-yellow-400">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-4xl sm:text-5xl">{newAchievement.icon}</div>
              <div>
                <div className="text-lg sm:text-xl font-black text-yellow-600">
                  Достижение разблокировано!
                </div>
                <div className="text-base sm:text-lg font-bold text-gray-800">
                  {newAchievement.title}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-40 flex flex-col gap-3">
        <Button
          onClick={() => setShowAchievements(!showAchievements)}
          className="bg-white text-purple-600 rounded-full p-3 sm:p-4 shadow-xl hover:scale-110 transition-all relative"
        >
          <Icon name="Trophy" size={24} />
        </Button>
        
        <div className="bg-white rounded-2xl shadow-xl px-4 py-3 sm:px-6 sm:py-4 text-center animate-pulse-slow">
          <div className="text-3xl sm:text-4xl font-black text-purple-600">
            {totalCompleted}
          </div>
          <div className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap">
            выполнено
          </div>
        </div>
      </div>

      {showAchievements && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAchievements(false)}>
          <Card className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl sm:text-4xl font-black text-purple-600">Достижения 🏆</h2>
              <Button
                onClick={() => setShowAchievements(false)}
                className="bg-gray-200 text-gray-800 rounded-full p-2"
              >
                <Icon name="X" size={24} />
              </Button>
            </div>
            
            <div className="mb-6 bg-purple-100 rounded-xl p-4 text-center">
              <div className="text-5xl font-black text-purple-600 mb-2">{totalCompleted}</div>
              <div className="text-lg font-bold text-purple-800">Всего выполнено упражнений</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    ach.unlocked
                      ? 'bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-400'
                      : 'bg-gray-100 border-gray-300 opacity-50'
                  }`}
                >
                  <div className="text-4xl mb-2">{ach.icon}</div>
                  <div className="text-lg font-bold text-gray-800">{ach.title}</div>
                  <div className="text-sm text-gray-600">{ach.description}</div>
                  {ach.unlocked && (
                    <div className="mt-2 text-xs font-bold text-green-600">✓ Разблокировано</div>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                if (confirm('Вы уверены? Весь прогресс будет удалён!')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full bg-red-500 text-white hover:bg-red-600 py-3 rounded-xl font-bold"
            >
              Сбросить прогресс
            </Button>
          </Card>
        </div>
      )}

      <h1 className="text-4xl sm:text-7xl font-black text-white text-center mb-4 sm:mb-8 drop-shadow-2xl animate-fade-in px-4 animate-float">
        Весёлая Зарядка! 🌟
      </h1>
      
      <p className="text-xl sm:text-3xl text-white text-center mb-8 sm:mb-16 font-bold drop-shadow-lg animate-fade-in px-4">
        Брось кубик и узнай, какое упражнение тебя ждёт!
      </p>

      <div className="relative mb-8 sm:mb-16 perspective-2000">
        <div 
          className={`dice-container ${isRolling ? 'rolling' : ''}`}
        >
          <div className="dice">
            <div className="dice-face dice-front">
              <div className="text-6xl sm:text-8xl">{exercises[0].emoji}</div>
            </div>
            <div className="dice-face dice-back">
              <div className="text-6xl sm:text-8xl">{exercises[1].emoji}</div>
            </div>
            <div className="dice-face dice-right">
              <div className="text-6xl sm:text-8xl">{exercises[2].emoji}</div>
            </div>
            <div className="dice-face dice-left">
              <div className="text-6xl sm:text-8xl">{exercises[3].emoji}</div>
            </div>
            <div className="dice-face dice-top">
              <div className="text-6xl sm:text-8xl">{exercises[4].emoji}</div>
            </div>
            <div className="dice-face dice-bottom">
              <div className="text-6xl sm:text-8xl">{exercises[5].emoji}</div>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={rollDice}
        disabled={isRolling}
        className="text-2xl sm:text-4xl font-black py-6 px-12 sm:py-10 sm:px-20 rounded-full bg-white text-purple-600 shadow-2xl active:scale-95 sm:hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:scale-100 animate-scale-in touch-manipulation hover:shadow-glow"
      >
        {isRolling ? 'Бросаю... 🎲' : 'Бросить кубик! 🎯'}
      </Button>

      <div className="mt-8 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl animate-fade-in px-4">
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className={`bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg text-center active:scale-95 transition-all hover-float relative ${
              completedExercises.has(index) ? 'ring-4 ring-green-400' : ''
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {completedExercises.has(index) && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                <Icon name="Check" size={16} />
              </div>
            )}
            <div className="text-3xl sm:text-5xl mb-1 sm:mb-2">{exercise.emoji}</div>
            <div className="text-xs sm:text-lg font-bold" style={{ color: exercise.color }}>
              {exercise.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}