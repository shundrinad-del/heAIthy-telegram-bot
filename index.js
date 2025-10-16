/**
 * Основной файл бота для отслеживания энергии и продуктивности
 */

// Подключаем библиотеку Telegraf для создания Telegram бота
// В реальном проекте нужно установить через npm: npm install telegraf dotenv
const { Telegraf } = require('telegraf');
require('dotenv').config();

// Импортируем обработчики
const { 
  handleStart, 
  handleHelp, 
  handleSettings, 
  handleStats 
} = require('./src/handlers/commandHandlers');

const { 
  startMorningSurvey, 
  startEveningSurvey, 
  startWeeklySurvey, 
  handleSurveyAnswer 
} = require('./src/handlers/surveyHandlers');

// Создаем экземпляр бота с токеном из .env файла
// В .env файле должна быть строка BOT_TOKEN=ваш_токен
const bot = new Telegraf(process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN');

// Обработчики команд
bot.start(handleStart);
bot.help(handleHelp);
bot.command('settings', handleSettings);
bot.command('stats', handleStats);

// Команды для опросов
bot.command('morning', startMorningSurvey);
bot.command('evening', startEveningSurvey);
bot.command('weekly', startWeeklySurvey);

// Обработка текстовых сообщений (ответы на вопросы опросов)
bot.on('text', handleSurveyAnswer);

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error(`Ошибка для ${ctx.updateType}`, err);
  ctx.reply('Произошла ошибка. Пожалуйста, попробуйте еще раз или используйте команду /start.');
});

// Запускаем бота
bot.launch()
  .then(() => {
    console.log('Бот запущен!');
  })
  .catch((err) => {
    console.error('Ошибка при запуске бота:', err);
  });

// Корректное завершение работы бота при остановке приложения
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
