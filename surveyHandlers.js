/**
 * Обработчики опросов
 */

const { getUser, saveUser, updateUserStat } = require('../../data/users');
const { morningQuestions, eveningQuestions, weeklyQuestions } = require('../../data/questions');
const { 
  sleepRecommendations, 
  nutritionRecommendations, 
  activityRecommendations, 
  energyRecommendations 
} = require('../../data/recommendations');
const { getRandomRecommendation } = require('../utils/helpers');

/**
 * Начать утренний опрос
 */
const startMorningSurvey = async (ctx) => {
  const userId = ctx.from.id;
  const user = getUser(userId);

  if (!user) {
    return ctx.reply('Пожалуйста, используйте команду /start для начала работы с ботом.');
  }

  // Создаем новый опрос
  user.currentSurvey = {
    type: 'morning',
    started: new Date().toISOString(),
    currentQuestion: 0,
    answers: {}
  };

  saveUser(userId, user);

  // Задаем первый вопрос
  await askNextQuestion(ctx);
};

/**
 * Начать вечерний опрос
 */
const startEveningSurvey = async (ctx) => {
  const userId = ctx.from.id;
  const user = getUser(userId);

  if (!user) {
    return ctx.reply('Пожалуйста, используйте команду /start для начала работы с ботом.');
  }

  // Создаем новый опрос
  user.currentSurvey = {
    type: 'evening',
    started: new Date().toISOString(),
    currentQuestion: 0,
    answers: {}
  };

  saveUser(userId, user);

  // Задаем первый вопрос
  await askNextQuestion(ctx);
};

/**
 * Начать еженедельный опрос
 */
const startWeeklySurvey = async (ctx) => {
  const userId = ctx.from.id;
  const user = getUser(userId);

  if (!user) {
    return ctx.reply('Пожалуйста, используйте команду /start для начала работы с ботом.');
  }

  // Создаем новый опрос
  user.currentSurvey = {
    type: 'weekly',
    started: new Date().toISOString(),
    currentQuestion: 0,
    answers: {}
  };

  saveUser(userId, user);

  // Задаем первый вопрос
  await askNextQuestion(ctx);
};

/**
 * Задать следующий вопрос опроса
 */
const askNextQuestion = async (ctx) => {
  const userId = ctx.from.id;
  const user = getUser(userId);

  if (!user || !user.currentSurvey) {
    return ctx.reply('Активный опрос не найден. Используйте /morning или /evening для начала опроса.');
  }

  const { type, currentQuestion } = user.currentSurvey;
  
  // Определяем список вопросов в зависимости от типа опроса
  let questions;
  if (type === 'morning') {
    questions = morningQuestions;
  } else if (type === 'evening') {
    questions = eveningQuestions;
  } else if (type === 'weekly') {
    questions = weeklyQuestions;
  }

  // Проверяем, есть ли еще вопросы
  if (currentQuestion >= questions.length) {
    // Опрос завершен, показываем рекомендации
    await finishSurvey(ctx);
    return;
  }

  const question = questions[currentQuestion];
  
  // Формируем клавиатуру с вариантами ответов
  let keyboard;
  if (question.type === 'select') {
    keyboard = {
      reply_markup: {
        keyboard: question.options.map(option => [{ text: option }]),
        one_time_keyboard: true,
        resize_keyboard: true
      }
    };
  } else if (question.type === 'rating') {
    keyboard = {
      reply_markup: {
        keyboard: [question.options.map(option => ({ text: option.toString() }))],
        one_time_keyboard: true,
        resize_keyboard: true
      }
    };
  } else {
    keyboard = {
      reply_markup: {
        remove_keyboard: true
      }
    };
  }

  // Задаем вопрос
  await ctx.reply(question.text, keyboard);
};

/**
 * Обработать ответ на вопрос
 */
const handleSurveyAnswer = async (ctx) => {
  const userId = ctx.from.id;
  const user = getUser(userId);

  if (!user || !user.currentSurvey) {
    return;
  }

  const { type, currentQuestion } = user.currentSurvey;
  
  // Определяем список вопросов в зависимости от типа опроса
  let questions;
  if (type === 'morning') {
    questions = morningQuestions;
  } else if (type === 'evening') {
    questions = eveningQuestions;
  } else if (type === 'weekly') {
    questions = weeklyQuestions;
  }

  const question = questions[currentQuestion];
  let answer = ctx.message.text;

  // Преобразуем ответ в зависимости от типа вопроса
  if (question.type === 'rating' || question.type === 'number') {
    answer = parseInt(answer, 10);
    if (isNaN(answer) || answer < question.options[0] || answer > question.options[question.options.length - 1]) {
      await ctx.reply(`Пожалуйста, введите число от ${question.options[0]} до ${question.options[question.options.length - 1]}.`);
      return;
    }
  }

  // Сохраняем ответ
  user.currentSurvey.answers[question.id] = answer;
  
  // Переходим к следующему вопросу
  user.currentSurvey.currentQuestion++;
  saveUser(userId, user);
  
  // Задаем следующий вопрос
  await askNextQuestion(ctx);
};

/**
 * Завершить опрос и показать рекомендации
 */
const finishSurvey = async (ctx) => {
  const userId = ctx.from.id;
  const user = getUser(userId);

  if (!user || !user.currentSurvey) {
    return;
  }

  const { type, answers } = user.currentSurvey;
  const today = new Date().toISOString().split('T')[0];
  
  // Обновляем статистику пользователя
  if (!user.stats.days.find(day => day.date === today)) {
    user.stats.days.push({ date: today });
  }
  
  const dayIndex = user.stats.days.findIndex(day => day.date === today);
  
  if (type === 'morning') {
    user.stats.days[dayIndex].morning = {
      sleepQuality: answers.sleep_quality,
      sleepDuration: answers.sleep_duration,
      morningMood: answers.morning_mood,
      breakfast: answers.breakfast,
      morningActivity: answers.morning_activity
    };
  } else if (type === 'evening') {
    user.stats.days[dayIndex].evening = {
      dayEnergy: answers.day_energy,
      productivity: answers.productivity,
      mealsCount: answers.meals_count,
      water: answers.water,
      physicalActivity: answers.physical_activity
    };
  } else if (type === 'weekly') {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    user.stats.weeks.push({
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      weekEnergy: answers.week_energy,
      weekProductivity: answers.week_productivity,
      weekSleep: answers.week_sleep,
      weekNutrition: answers.week_nutrition,
      weekActivity: answers.week_activity
    });
  }
  
  // Формируем рекомендации
  let recommendations = [];
  
  if (type === 'morning') {
    // Рекомендации по сну
    if (answers.sleep_quality <= 4) {
      recommendations.push(getRandomRecommendation(sleepRecommendations.low));
    } else if (answers.sleep_quality <= 7) {
      recommendations.push(getRandomRecommendation(sleepRecommendations.medium));
    } else {
      recommendations.push(getRandomRecommendation(sleepRecommendations.high));
    }
    
    // Рекомендации по завтраку
    if (answers.breakfast === 'Белковый завтрак') {
      recommendations.push(getRandomRecommendation(nutritionRecommendations.breakfast_protein));
    } else if (answers.breakfast === 'Углеводный завтрак') {
      recommendations.push(getRandomRecommendation(nutritionRecommendations.breakfast_carbs));
    } else if (answers.breakfast === 'Смешанный') {
      recommendations.push(getRandomRecommendation(nutritionRecommendations.breakfast_mixed));
    } else if (answers.breakfast === 'Пропущу завтрак') {
      recommendations.push(getRandomRecommendation(nutritionRecommendations.breakfast_skip));
    }
    
    // Рекомендации по активности
    if (answers.morning_activity === 'Без активности') {
      recommendations.push(getRandomRecommendation(activityRecommendations.no_activity));
    } else if (answers.morning_activity === 'Прогулка') {
      recommendations.push(getRandomRecommendation(activityRecommendations.light_activity));
    } else {
      recommendations.push(getRandomRecommendation(activityRecommendations.good_activity));
    }
  } else if (type === 'evening') {
    // Рекомендации по энергии
    if (answers.day_energy <= 4) {
      recommendations.push(getRandomRecommendation(energyRecommendations.low));
    } else if (answers.day_energy <= 7) {
      recommendations.push(getRandomRecommendation(energyRecommendations.medium));
    } else {
      recommendations.push(getRandomRecommendation(energyRecommendations.high));
    }
    
    // Рекомендации по питанию
    if (answers.meals_count < 3) {
      recommendations.push(getRandomRecommendation(nutritionRecommendations.low_meals));
    } else {
      recommendations.push(getRandomRecommendation(nutritionRecommendations.good_meals));
    }
    
    // Рекомендации по воде
    if (answers.water < 6) {
      recommendations.push(getRandomRecommendation(nutritionRecommendations.low_water));
    } else {
      recommendations.push(getRandomRecommendation(nutritionRecommendations.good_water));
    }
  }
  
  // Очищаем текущий опрос
  user.currentSurvey = null;
  saveUser(userId, user);
  
  // Отправляем рекомендации
  let message = 'Спасибо за ответы! 👍\n\n';
  message += 'Вот мои рекомендации для тебя:\n\n';
  message += recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n\n');
  
  await ctx.reply(message, {
    reply_markup: {
      remove_keyboard: true
    }
  });
};

module.exports = {
  startMorningSurvey,
  startEveningSurvey,
  startWeeklySurvey,
  handleSurveyAnswer
};
