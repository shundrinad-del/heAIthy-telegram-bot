/**
 * Пример структуры данных пользователей
 * В реальном приложении данные будут храниться в БД или файловой системе
 */

const userExample = {
  id: 123456789, // Telegram user ID
  username: 'username',
  firstName: 'Имя',
  lastName: 'Фамилия',
  registeredAt: '2024-10-16T12:00:00Z',
  settings: {
    notifications: {
      morningReminder: true,
      eveningReminder: true,
      weeklyReport: true
    },
    reminderTimes: {
      morning: '08:00',
      evening: '20:00'
    },
    timezone: 'Europe/Moscow'
  },
  stats: {
    // Статистика по дням
    days: [
      {
        date: '2024-10-16',
        morning: {
          sleepQuality: 7,
          sleepDuration: 7.5,
          morningMood: 'Хорошее',
          breakfast: 'Белковый завтрак',
          morningActivity: 'Зарядка'
        },
        evening: {
          dayEnergy: 8,
          productivity: 7,
          mealsCount: 4,
          water: 8,
          physicalActivity: 'Легкая активность'
        }
      }
      // Другие дни...
    ],
    // Статистика по неделям
    weeks: [
      {
        weekStart: '2024-10-14',
        weekEnd: '2024-10-20',
        weekEnergy: 7,
        weekProductivity: 8,
        weekSleep: 7,
        weekNutrition: 6,
        weekActivity: 4
      }
      // Другие недели...
    ]
  },
  currentSurvey: {
    type: 'morning', // 'morning', 'evening', 'weekly'
    started: '2024-10-16T08:05:00Z',
    currentQuestion: 2,
    answers: {
      sleep_quality: 7,
      sleep_duration: 7.5
      // Остальные ответы...
    }
  }
};

// В реальном приложении здесь будет функционал для работы с пользовательскими данными
const users = {};

// Пример функций для работы с пользователями
const getUser = (userId) => {
  return users[userId] || null;
};

const saveUser = (userId, userData) => {
  users[userId] = userData;
  return userData;
};

const updateUserStat = (userId, statData) => {
  if (!users[userId]) {
    return null;
  }
  
  // Обновление статистики пользователя
  // Здесь будет логика обновления конкретных полей
  
  return users[userId];
};

module.exports = {
  userExample,
  getUser,
  saveUser,
  updateUserStat
};
