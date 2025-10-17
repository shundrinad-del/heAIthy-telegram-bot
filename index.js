/**
 * Основной файл бота для отслеживания энергии и продуктивности
 */

// Подключаем библиотеку Telegraf для создания Telegram бота
const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

// Импортируем обработчики для функций питания
const {
  startNutritionPlanning,
  startUserInfoCollection,
  handleDaySelection,
  handleMealSelection,
  handleMealTemplateSelection,
  handleCustomMeal,
  showNutritionSummary,
  calculateNutritionByText,
  handleUserInfoInput,
  showMainMenu,
  nutritionSessions
} = require('./src/handlers/nutritionHandlers');

// Простое хранилище данных (в реальном приложении использовать базу данных)
const users = {};

// Создаем экземпляр бота с токеном из .env файла
// В .env файле должна быть строка BOT_TOKEN=ваш_токен
const bot = new Telegraf(process.env.BOT_TOKEN || '8238042855:AAEcWTiF1AujYFiwaAsJGkHdqzr3Up8kgzM');

// Состояния пользователей для отслеживания контекста диалога
const userStates = {};

// Обработчики команд
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const firstName = ctx.from.first_name || '';
  
  // Сохраняем пользователя
  users[userId] = {
    id: userId,
    firstName: firstName,
    registeredAt: new Date().toISOString()
  };
  
  // Сбрасываем состояние пользователя
  userStates[userId] = {
    activeMode: null
  };
  
  await ctx.reply(
    `Привет, ${firstName}! 👋\n\n` +
    'Я бот, который поможет тебе спланировать питание и рассчитать КБЖУ по твоим сообщениям.\n\n' +
    'Доступные команды:\n' +
    '/start - Начать работу с ботом\n' +
    '/help - Показать справку\n' +
    '/plan - Спланировать питание\n' +
    '/kbju - Рассчитать КБЖУ\n' +
    '/profile - Заполнить информацию о себе'
  );
  
  await showMainMenu(ctx);
});

bot.help(async (ctx) => {
  await ctx.reply(
    'Доступные команды:\n\n' +
    '/start - Начать работу с ботом\n' +
    '/plan - Спланировать питание\n' +
    '/kbju - Рассчитать КБЖУ\n' +
    '/profile - Заполнить информацию о себе\n' +
    '/help - Показать справку'
  );
});

// Команда для планирования питания
bot.command('plan', async (ctx) => {
  const userId = ctx.from.id;
  userStates[userId] = { activeMode: 'plan' };
  await startNutritionPlanning(ctx);
});

// Команда для расчета КБЖУ
bot.command('kbju', async (ctx) => {
  const userId = ctx.from.id;
  userStates[userId] = { activeMode: 'kbju' };
  
  await ctx.reply(
    'Режим расчета КБЖУ активирован.\n\n' +
    'Отправьте мне описание продуктов или блюд, и я рассчитаю их пищевую ценность.\n\n' +
    'Например: "2 яйца, 100г овсянки, банан"',
    Markup.keyboard([
      ['Спланировать питание'],
      ['Вернуться в главное меню']
    ]).resize()
  );
});

// Команда для заполнения профиля
bot.command('profile', async (ctx) => {
  const userId = ctx.from.id;
  userStates[userId] = { activeMode: 'profile' };
  await startUserInfoCollection(ctx);
});

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  
  // Если пользователя нет в базе, инициализируем его
  if (!users[userId]) {
    users[userId] = {
      id: userId,
      firstName: ctx.from.first_name || '',
      registeredAt: new Date().toISOString()
    };
  }
  
  // Если нет состояния, инициализируем его
  if (!userStates[userId]) {
    userStates[userId] = { activeMode: null };
  }
  
  // Обработка общих команд меню
  if (text === 'Вернуться в главное меню') {
    userStates[userId].activeMode = null;
    if (nutritionSessions[userId]) {
      delete nutritionSessions[userId];
    }
    return await showMainMenu(ctx);
  }
  
  if (text === 'Спланировать питание') {
    userStates[userId].activeMode = 'plan';
    return await startNutritionPlanning(ctx);
  }
  
  if (text === 'Рассчитать КБЖУ') {
    userStates[userId].activeMode = 'kbju';
    return await ctx.reply(
      'Режим расчета КБЖУ активирован.\n\n' +
      'Отправьте мне описание продуктов или блюд, и я рассчитаю их пищевую ценность.\n\n' +
      'Например: "2 яйца, 100г овсянки, банан"',
      Markup.keyboard([
        ['Спланировать питание'],
        ['Вернуться в главное меню']
      ]).resize()
    );
  }
  
  if (text === 'Мой профиль') {
    userStates[userId].activeMode = 'profile';
    return await startUserInfoCollection(ctx);
  }
  
  // Обработка в зависимости от активного режима
  switch (userStates[userId].activeMode) {
    case 'plan':
      // Если есть активная сессия планирования
      if (nutritionSessions[userId]) {
        const step = nutritionSessions[userId].step;
        
        switch (step) {
          case 'select_day':
            return await handleDaySelection(ctx);
          case 'select_meal':
            return await handleMealSelection(ctx);
          case 'select_meal_option':
            return await handleMealTemplateSelection(ctx);
          case 'custom_meal':
            return await handleCustomMeal(ctx);
          case 'plan_created':
            if (text === 'Изменить план') {
              nutritionSessions[userId].step = 'select_meal';
              return await ctx.reply(
                'Какой прием пищи хотите изменить?',
                Markup.keyboard([
                  ['Завтрак', 'Обед', 'Ужин'],
                  ['Перекус', 'Все приемы пищи'],
                  ['Готово', 'Отмена']
                ]).resize()
              );
            } else if (text === 'Сохранить план') {
              await ctx.reply(
                'План питания сохранен! Вы можете вернуться к нему позже через меню "Мои планы".',
                Markup.removeKeyboard()
              );
              return await showMainMenu(ctx);
            }
            break;
        }
      } else {
        return await startNutritionPlanning(ctx);
      }
      break;
      
    case 'kbju':
      return await calculateNutritionByText(ctx);
      
    case 'profile':
      return await handleUserInfoInput(ctx);
  }
  
  // Если ничего не сработало, показываем подсказку
  await ctx.reply('Я понимаю только команды. Используйте /help для просмотра доступных команд.');
  await showMainMenu(ctx);
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error(`Ошибка для ${ctx.updateType}`, err);
  ctx.reply('Произошла ошибка. Пожалуйста, попробуйте еще раз или используйте команду /start.');
});

// Определяем режим запуска: webhook для продакшена, polling для локальной разработки
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://heaithy-telegram-bot.onrender.com';

// Запускаем бота
if (process.env.NODE_ENV === 'production') {
  // Подключаем express
  const express = require('express');
  const app = express();
  
  // Парсим тело запроса как JSON
  app.use(express.json());
  
  // Настраиваем webhook
  bot.telegram.setWebhook(`${URL}/bot${process.env.BOT_TOKEN}`)
    .then(() => {
      console.log('Webhook установлен успешно!');
    })
    .catch(err => {
      console.error('Ошибка при установке webhook:', err);
    });
  
  // Обрабатываем запросы от Telegram
  app.use(bot.webhookCallback(`/bot${process.env.BOT_TOKEN}`));
  
  // Простой эндпоинт для проверки работоспособности
  app.get('/', (req, res) => {
    res.send('Бот работает!');
  });
  
  // Запускаем сервер
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
} else {
  // Режим polling для локальной разработки
  console.log('Запускаем бота в режиме polling...');
  bot.launch()
    .then(() => {
      console.log('Бот успешно запущен!');
    })
    .catch((err) => {
      console.error('Ошибка при запуске бота:', err);
    });
}

// Корректное завершение работы бота при остановке приложения
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));