import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

export default function Index() {
  const [isRolling, setIsRolling] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<number | null>(null);
  const [showExercise, setShowExercise] = useState(false);
  const [repsCount, setRepsCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [canComplete, setCanComplete] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (showExercise) {
      setTimeLeft(10);
      setCanComplete(false);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanComplete(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showExercise]);

  const rollDice = () => {
    setIsRolling(true);
    setRotation({
      x: Math.random() * 720 + 360,
      y: Math.random() * 720 + 360
    });

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * exercises.length);
      const randomReps = Math.floor(Math.random() * 7) + 4;
      setCurrentExercise(randomIndex);
      setRepsCount(randomReps);
      setIsRolling(false);
      
      setTimeout(() => {
        setShowExercise(true);
      }, 500);
    }, 2000);
  };

  const handleComplete = () => {
    setShowExercise(false);
    setCurrentExercise(null);
  };

  if (showExercise && currentExercise !== null) {
    const exercise = exercises[currentExercise];
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in safe-area-inset"
        style={{
          background: `linear-gradient(135deg, ${exercise.color}40 0%, ${exercise.color}20 100%)`
        }}
      >
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-white rounded-2xl sm:rounded-3xl shadow-2xl px-4 py-2 sm:px-8 sm:py-4 animate-scale-in">
          <div className="text-4xl sm:text-6xl font-black" style={{ color: exercise.color }}>
            {repsCount}
          </div>
          <div className="text-xs sm:text-sm font-bold text-gray-600 text-center mt-1">раз</div>
        </div>

        <Card className="max-w-2xl w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-12 animate-scale-in mx-4">
          <div className="text-7xl sm:text-9xl text-center mb-6 sm:mb-8 animate-bounce">
            {exercise.emoji}
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black text-center mb-4 sm:mb-6" style={{ color: exercise.color }}>
            {exercise.name}
          </h1>
          
          <p className="text-xl sm:text-3xl text-center text-gray-700 font-bold leading-relaxed mb-8 sm:mb-12">
            {exercise.instructions}
          </p>

          <div className="flex flex-col items-center gap-4 sm:gap-6">
            {!canComplete && (
              <div className="text-xl sm:text-2xl font-bold text-gray-500">
                Подожди {timeLeft} сек... ⏳
              </div>
            )}
            
            <Button
              onClick={handleComplete}
              disabled={!canComplete}
              className="text-2xl sm:text-3xl font-black py-6 px-12 sm:py-8 sm:px-16 rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-300 active:scale-95 sm:hover:scale-110 disabled:opacity-50 disabled:scale-100 touch-manipulation"
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 safe-area-inset">
      <h1 className="text-4xl sm:text-7xl font-black text-white text-center mb-4 sm:mb-8 drop-shadow-2xl animate-fade-in px-4">
        Весёлая Зарядка! 🌟
      </h1>
      
      <p className="text-xl sm:text-3xl text-white text-center mb-8 sm:mb-16 font-bold drop-shadow-lg animate-fade-in px-4">
        Брось кубик и узнай, какое упражнение тебя ждёт!
      </p>

      <div className="relative mb-8 sm:mb-16 perspective-1000">
        <div 
          className={`w-36 h-36 sm:w-48 sm:h-48 transition-transform duration-2000 ease-out ${isRolling ? 'animate-bounce' : ''}`}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="w-full h-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-center border-4 sm:border-8 border-purple-300">
            <div className="text-6xl sm:text-8xl">{currentExercise !== null ? exercises[currentExercise].emoji : '🎲'}</div>
          </div>
        </div>
      </div>

      <Button
        onClick={rollDice}
        disabled={isRolling}
        className="text-2xl sm:text-4xl font-black py-6 px-12 sm:py-10 sm:px-20 rounded-full bg-white text-purple-600 shadow-2xl active:scale-95 sm:hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:scale-100 animate-scale-in touch-manipulation"
      >
        {isRolling ? 'Бросаю... 🎲' : 'Бросить кубик! 🎯'}
      </Button>

      <div className="mt-8 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl animate-fade-in px-4">
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg text-center active:scale-95 transition-all"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
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