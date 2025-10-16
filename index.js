/**
 * Основной файл бота для отслеживания энергии и продуктивности
 */

// Подключаем библиотеку Telegraf для создания Telegram бота
const { Telegraf } = require('telegraf');
require('dotenv').config();

// Простое хранилище данных (в реальном приложении использовать базу данных)
const users = {};

// Создаем экземпляр бота с токеном из .env файла
// В .env файле должна быть строка BOT_TOKEN=ваш_токен
const bot = new Telegraf(process.env.BOT_TOKEN || '8238042855:AAEcWTiF1AujYFiwaAsJGkHdqzr3Up8kgzM');

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
  
  await ctx.reply(
    `Привет, ${firstName}! 👋\n\n` +
    'Я бот, который поможет тебе отслеживать и улучшать уровень энергии и продуктивности.\n\n' +
    'Доступные команды:\n' +
    '/start - Начать работу с ботом\n' +
    '/help - Показать справку\n' +
    '/morning - Утренний опрос\n' +
    '/evening - Вечерний опрос'
  );
});

bot.help(async (ctx) => {
  await ctx.reply(
    'Доступные команды:\n\n' +
    '/start - Начать работу с ботом\n' +
    '/morning - Утренний опрос\n' +
    '/evening - Вечерний опрос\n' +
    '/help - Показать справку'
  );
});

bot.command('morning', async (ctx) => {
  await ctx.reply('Утренний опрос будет доступен в полной версии бота!');
});

bot.command('evening', async (ctx) => {
  await ctx.reply('Вечерний опрос будет доступен в полной версии бота!');
});

bot.command('settings', async (ctx) => {
  await ctx.reply('Настройки будут доступны в полной версии бота!');
});

bot.command('stats', async (ctx) => {
  await ctx.reply('Статистика будет доступна в полной версии бота!');
});

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
  await ctx.reply('Я понимаю только команды. Используйте /help для просмотра доступных команд.');
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
