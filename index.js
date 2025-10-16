/**
 * Основной файл бота для отслеживания энергии и продуктивности
 */

// Подключаем библиотеку Telegraf для создания Telegram бота
// В реальном проекте нужно установить через npm: npm install telegraf dotenv
const { Telegraf } = require('telegraf');
require('dotenv').config();

// Импортируем обработчики
const path = require('path');

const { 
  handleStart, 
  handleHelp, 
  handleSettings, 
  handleStats 
} = require(path.join(__dirname, 'src', 'handlers', 'commandHandlers'));

const { 
  startMorningSurvey, 
  startEveningSurvey, 
  startWeeklySurvey, 
  handleSurveyAnswer 
} = require(path.join(__dirname, 'src', 'handlers', 'surveyHandlers'));

// Создаем экземпляр бота с токеном из .env файла
// В .env файле должна быть строка BOT_TOKEN=ваш_токен
const bot = new Telegraf(process.env.BOT_TOKEN || '8238042855:AAEcWTiF1AujYFiwaAsJGkHdqzr3Up8kgzM');

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

// Определяем режим запуска: webhook для продакшена, polling для локальной разработки
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://heaithy-telegram-bot.onrender.com';

// Запускаем бота
if (process.env.NODE_ENV === 'production') {
  // Режим webhook для продакшена
  bot.telegram.setWebhook(`${URL}/bot${process.env.BOT_TOKEN}`)
    .then(() => {
      console.log('Webhook установлен!');
    })
    .catch(err => {
      console.error('Ошибка при установке webhook:', err);
    });
  
  // Запускаем Express сервер для обработки webhook
  const express = require('express');
  const app = express();
  
  // Парсим тело запроса как JSON
  app.use(express.json());
  
  // Обрабатываем запросы от Telegram
  app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body, res);
    res.sendStatus(200);
  });
  
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
  bot.launch()
    .then(() => {
      console.log('Бот запущен в режиме polling!');
    })
    .catch((err) => {
      console.error('Ошибка при запуске бота:', err);
    });
}

// Корректное завершение работы бота при остановке приложения
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
