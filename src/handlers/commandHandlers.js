/**
 * Обработчики команд бота
 */

const path = require('path');
const { getUser, saveUser } = require(path.join(__dirname, '..', '..', 'data', 'users'));

/**
 * Обработчик команды /start
 */
const handleStart = async (ctx) => {
  const userId = ctx.from.id;
  const user = getUser(userId);

  if (!user) {
    // Создаем нового пользователя
    const newUser = {
      id: userId,
      username: ctx.from.username || '',
      firstName: ctx.from.first_name || '',
      lastName: ctx.from.last_name || '',
      registeredAt: new Date().toISOString(),
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
        days: [],
        weeks: []
      },
      currentSurvey: null
    };

    saveUser(userId, newUser);

    await ctx.reply(
      `Привет, ${newUser.firstName}! 👋\n\n` +
      'Я бот, который поможет тебе отслеживать и улучшать уровень энергии и продуктивности.\n\n' +
      'Каждое утро и вечер я буду задавать тебе несколько вопросов, а затем давать персональные рекомендации.\n\n' +
      'Давай начнем! Используй команду /morning для утреннего опроса или /evening для вечернего.'
    );
  } else {
    await ctx.reply(
      `С возвращением, ${user.firstName}! 👋\n\n` +
      'Что хочешь сделать сегодня?\n\n' +
      '/morning - Утренний опрос\n' +
      '/evening - Вечерний опрос\n' +
      '/stats - Посмотреть статистику\n' +
      '/settings - Настройки'
    );
  }
};

/**
 * Обработчик команды /help
 */
const handleHelp = async (ctx) => {
  await ctx.reply(
    'Доступные команды:\n\n' +
    '/start - Начать работу с ботом\n' +
    '/morning - Утренний опрос\n' +
    '/evening - Вечерний опрос\n' +
    '/stats - Посмотреть статистику\n' +
    '/settings - Настройки\n' +
    '/help - Показать справку'
  );
};

/**
 * Обработчик команды /settings
 */
const handleSettings = async (ctx) => {
  const userId = ctx.from.id;
  const user = getUser(userId);

  if (!user) {
    return ctx.reply('Пожалуйста, используйте команду /start для начала работы с ботом.');
  }

  await ctx.reply(
    'Настройки:\n\n' +
    `Утреннее напоминание: ${user.settings.notifications.morningReminder ? '✅' : '❌'}\n` +
    `Вечернее напоминание: ${user.settings.notifications.eveningReminder ? '✅' : '❌'}\n` +
    `Еженедельный отчет: ${user.settings.notifications.weeklyReport ? '✅' : '❌'}\n\n` +
    `Время утреннего напоминания: ${user.settings.reminderTimes.morning}\n` +
    `Время вечернего напоминания: ${user.settings.reminderTimes.evening}\n\n` +
    'Для изменения настроек используйте команды:\n' +
    '/toggle_morning - Включить/выключить утреннее напоминание\n' +
    '/toggle_evening - Включить/выключить вечернее напоминание\n' +
    '/toggle_weekly - Включить/выключить еженедельный отчет\n' +
    '/set_morning_time - Установить время утреннего напоминания\n' +
    '/set_evening_time - Установить время вечернего напоминания'
  );
};

/**
 * Обработчик команды /stats
 */
const handleStats = async (ctx) => {
  const userId = ctx.from.id;
  const user = getUser(userId);

  if (!user) {
    return ctx.reply('Пожалуйста, используйте команду /start для начала работы с ботом.');
  }

  if (user.stats.days.length === 0) {
    return ctx.reply('У вас пока нет статистики. Пройдите хотя бы один опрос.');
  }

  const lastDay = user.stats.days[user.stats.days.length - 1];
  
  let statsMessage = 'Ваша последняя статистика:\n\n';
  
  if (lastDay.morning) {
    statsMessage += `📅 ${lastDay.date}\n\n`;
    statsMessage += '🌅 Утро:\n';
    statsMessage += `- Качество сна: ${lastDay.morning.sleepQuality}/10\n`;
    statsMessage += `- Продолжительность сна: ${lastDay.morning.sleepDuration} ч\n`;
    statsMessage += `- Настроение: ${lastDay.morning.morningMood}\n`;
    statsMessage += `- Завтрак: ${lastDay.morning.breakfast}\n`;
    statsMessage += `- Активность: ${lastDay.morning.morningActivity}\n\n`;
  }
  
  if (lastDay.evening) {
    statsMessage += '🌃 Вечер:\n';
    statsMessage += `- Энергия за день: ${lastDay.evening.dayEnergy}/10\n`;
    statsMessage += `- Продуктивность: ${lastDay.evening.productivity}/10\n`;
    statsMessage += `- Приемы пищи: ${lastDay.evening.mealsCount}\n`;
    statsMessage += `- Стаканы воды: ${lastDay.evening.water}\n`;
    statsMessage += `- Физическая активность: ${lastDay.evening.physicalActivity}\n`;
  }

  await ctx.reply(statsMessage);
};

module.exports = {
  handleStart,
  handleHelp,
  handleSettings,
  handleStats
};
