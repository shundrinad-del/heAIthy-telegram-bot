/**
 * Обработчики для функций питания и расчета КБЖУ
 */

const { products, mealTemplates, nutritionGoals } = require('../../data/nutrition');
const { Markup } = require('telegraf');

// Хранилище текущих сессий планирования питания
const nutritionSessions = {};

/**
 * Начать процесс планирования питания
 */
async function startNutritionPlanning(ctx) {
  const userId = ctx.from.id;
  
  // Инициализация сессии планирования
  nutritionSessions[userId] = {
    step: 'select_day',
    meals: {},
    userInfo: {}
  };
  
  await ctx.reply(
    'Давайте спланируем ваше питание! На какой день составляем план?',
    Markup.keyboard([
      ['Сегодня', 'Завтра'],
      ['На всю неделю'],
      ['Отмена']
    ]).resize()
  );
}

/**
 * Начать процесс сбора информации о пользователе
 */
async function startUserInfoCollection(ctx) {
  const userId = ctx.from.id;
  
  // Инициализация сессии с информацией о пользователе
  if (!nutritionSessions[userId]) {
    nutritionSessions[userId] = {
      step: 'ask_gender',
      userInfo: {}
    };
  } else {
    nutritionSessions[userId].step = 'ask_gender';
  }
  
  await ctx.reply(
    'Для более точных рекомендаций мне нужна некоторая информация о вас.\n\n' +
    'Укажите ваш пол:',
    Markup.keyboard([
      ['Мужской', 'Женский'],
      ['Пропустить']
    ]).resize()
  );
}

/**
 * Обработка выбора дня для планирования
 */
async function handleDaySelection(ctx) {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  
  if (!nutritionSessions[userId]) return;
  
  if (text === 'Отмена') {
    delete nutritionSessions[userId];
    return await ctx.reply(
      'Планирование питания отменено.',
      Markup.removeKeyboard()
    );
  }
  
  // Сохраняем выбранный день
  nutritionSessions[userId].selectedDay = text;
  nutritionSessions[userId].step = 'select_meal';
  
  await ctx.reply(
    `Отлично! Планируем питание на ${text.toLowerCase()}.\n\n` +
    'Какой прием пищи хотите запланировать?',
    Markup.keyboard([
      ['Завтрак', 'Обед', 'Ужин'],
      ['Перекус', 'Все приемы пищи'],
      ['Готово', 'Отмена']
    ]).resize()
  );
}

/**
 * Обработка выбора приема пищи
 */
async function handleMealSelection(ctx) {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  
  if (!nutritionSessions[userId]) return;
  
  if (text === 'Отмена') {
    delete nutritionSessions[userId];
    return await ctx.reply(
      'Планирование питания отменено.',
      Markup.removeKeyboard()
    );
  }
  
  if (text === 'Готово') {
    return await showNutritionSummary(ctx);
  }
  
  // Маппинг названий приемов пищи на английские ключи
  const mealTypeMap = {
    'Завтрак': 'breakfast',
    'Обед': 'lunch',
    'Ужин': 'dinner',
    'Перекус': 'snack'
  };
  
  if (text === 'Все приемы пищи') {
    nutritionSessions[userId].step = 'all_meals';
    return await planAllMeals(ctx);
  }
  
  const mealType = mealTypeMap[text];
  
  if (!mealType) {
    return await ctx.reply('Пожалуйста, выберите один из предложенных вариантов.');
  }
  
  nutritionSessions[userId].currentMeal = mealType;
  nutritionSessions[userId].step = 'select_meal_option';
  
  // Получаем шаблоны для выбранного приема пищи
  const templates = mealTemplates[mealType];
  
  const buttons = templates.map(template => [template.name]);
  buttons.push(['Свой вариант']);
  buttons.push(['Назад']);
  
  await ctx.reply(
    `Выберите вариант для ${text.toLowerCase()} или введите свой:`,
    Markup.keyboard(buttons).resize()
  );
}

/**
 * Планирование всех приемов пищи сразу
 */
async function planAllMeals(ctx) {
  const userId = ctx.from.id;
  
  if (!nutritionSessions[userId]) return;
  
  // Выбираем случайные шаблоны для каждого приема пищи
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const plan = {};
  
  mealTypes.forEach(type => {
    const templates = mealTemplates[type];
    const randomIndex = Math.floor(Math.random() * templates.length);
    plan[type] = templates[randomIndex];
  });
  
  nutritionSessions[userId].meals = plan;
  
  // Рассчитываем общую пищевую ценность
  const totalNutrition = calculateTotalNutrition(plan);
  
  // Формируем сообщение с планом
  let message = `📋 План питания на ${nutritionSessions[userId].selectedDay.toLowerCase()}:\n\n`;
  
  message += `🍳 *Завтрак*: ${plan.breakfast.name}\n`;
  message += formatMealItems(plan.breakfast.items);
  message += '\n\n';
  
  message += `🥗 *Обед*: ${plan.lunch.name}\n`;
  message += formatMealItems(plan.lunch.items);
  message += '\n\n';
  
  message += `🍽 *Ужин*: ${plan.dinner.name}\n`;
  message += formatMealItems(plan.dinner.items);
  message += '\n\n';
  
  message += `🍌 *Перекус*: ${plan.snack.name}\n`;
  message += formatMealItems(plan.snack.items);
  message += '\n\n';
  
  message += `📊 *Общая пищевая ценность*:\n`;
  message += `Калории: ${Math.round(totalNutrition.calories)} ккал\n`;
  message += `Белки: ${Math.round(totalNutrition.protein)}г\n`;
  message += `Жиры: ${Math.round(totalNutrition.fat)}г\n`;
  message += `Углеводы: ${Math.round(totalNutrition.carbs)}г\n`;
  
  await ctx.replyWithMarkdown(
    message,
    Markup.keyboard([
      ['Сохранить план', 'Изменить план'],
      ['Вернуться в главное меню']
    ]).resize()
  );
  
  nutritionSessions[userId].step = 'plan_created';
}

/**
 * Форматирование списка продуктов для вывода
 */
function formatMealItems(items) {
  return items.map(item => {
    const product = products[item.name];
    const unit = product && product.unit ? product.unit : 'г';
    return `  • ${item.name} - ${item.amount} ${unit}`;
  }).join('\n');
}

/**
 * Обработка выбора шаблона приема пищи
 */
async function handleMealTemplateSelection(ctx) {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  
  if (!nutritionSessions[userId]) return;
  
  if (text === 'Назад') {
    nutritionSessions[userId].step = 'select_meal';
    return await ctx.reply(
      'Какой прием пищи хотите запланировать?',
      Markup.keyboard([
        ['Завтрак', 'Обед', 'Ужин'],
        ['Перекус', 'Все приемы пищи'],
        ['Готово', 'Отмена']
      ]).resize()
    );
  }
  
  const currentMeal = nutritionSessions[userId].currentMeal;
  const templates = mealTemplates[currentMeal];
  
  if (text === 'Свой вариант') {
    nutritionSessions[userId].step = 'custom_meal';
    return await ctx.reply(
      'Опишите свой вариант приема пищи. Перечислите продукты через запятую с указанием количества, например:\n\n' +
      'яйцо 2 шт, творог 100 г, банан 1 шт',
      Markup.keyboard([['Отмена']]).resize()
    );
  }
  
  // Находим выбранный шаблон
  const selectedTemplate = templates.find(template => template.name === text);
  
  if (!selectedTemplate) {
    return await ctx.reply('Пожалуйста, выберите один из предложенных вариантов.');
  }
  
  // Сохраняем выбранный шаблон
  if (!nutritionSessions[userId].meals) {
    nutritionSessions[userId].meals = {};
  }
  
  nutritionSessions[userId].meals[currentMeal] = selectedTemplate;
  
  // Рассчитываем пищевую ценность
  const nutrition = calculateNutrition(selectedTemplate.items);
  
  // Формируем сообщение с выбранным шаблоном и его пищевой ценностью
  let message = `Вы выбрали: *${selectedTemplate.name}*\n\n`;
  message += formatMealItems(selectedTemplate.items);
  message += '\n\n';
  message += `📊 *Пищевая ценность*:\n`;
  message += `Калории: ${Math.round(nutrition.calories)} ккал\n`;
  message += `Белки: ${Math.round(nutrition.protein)}г\n`;
  message += `Жиры: ${Math.round(nutrition.fat)}г\n`;
  message += `Углеводы: ${Math.round(nutrition.carbs)}г\n`;
  
  await ctx.replyWithMarkdown(
    message,
    Markup.keyboard([
      ['Завтрак', 'Обед', 'Ужин'],
      ['Перекус', 'Все приемы пищи'],
      ['Готово', 'Отмена']
    ]).resize()
  );
  
  nutritionSessions[userId].step = 'select_meal';
}

/**
 * Обработка пользовательского ввода для приема пищи
 */
async function handleCustomMeal(ctx) {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  
  if (!nutritionSessions[userId]) return;
  
  if (text === 'Отмена') {
    nutritionSessions[userId].step = 'select_meal';
    return await ctx.reply(
      'Какой прием пищи хотите запланировать?',
      Markup.keyboard([
        ['Завтрак', 'Обед', 'Ужин'],
        ['Перекус', 'Все приемы пищи'],
        ['Готово', 'Отмена']
      ]).resize()
    );
  }
  
  // Парсим введенный текст
  const items = parseProductsText(text);
  
  if (items.length === 0) {
    return await ctx.reply(
      'Не удалось распознать продукты. Пожалуйста, введите их в формате:\n' +
      'яйцо 2 шт, творог 100 г, банан 1 шт'
    );
  }
  
  // Создаем пользовательский шаблон
  const customTemplate = {
    name: 'Мой вариант',
    items: items
  };
  
  const currentMeal = nutritionSessions[userId].currentMeal;
  
  // Сохраняем пользовательский шаблон
  if (!nutritionSessions[userId].meals) {
    nutritionSessions[userId].meals = {};
  }
  
  nutritionSessions[userId].meals[currentMeal] = customTemplate;
  
  // Рассчитываем пищевую ценность
  const nutrition = calculateNutrition(items);
  
  // Формируем сообщение с пользовательским шаблоном и его пищевой ценностью
  let message = `Вы выбрали: *${customTemplate.name}*\n\n`;
  message += formatMealItems(items);
  message += '\n\n';
  message += `📊 *Пищевая ценность*:\n`;
  message += `Калории: ${Math.round(nutrition.calories)} ккал\n`;
  message += `Белки: ${Math.round(nutrition.protein)}г\n`;
  message += `Жиры: ${Math.round(nutrition.fat)}г\n`;
  message += `Углеводы: ${Math.round(nutrition.carbs)}г\n`;
  
  await ctx.replyWithMarkdown(
    message,
    Markup.keyboard([
      ['Завтрак', 'Обед', 'Ужин'],
      ['Перекус', 'Все приемы пищи'],
      ['Готово', 'Отмена']
    ]).resize()
  );
  
  nutritionSessions[userId].step = 'select_meal';
}

/**
 * Показать сводку по питанию
 */
async function showNutritionSummary(ctx) {
  const userId = ctx.from.id;
  
  if (!nutritionSessions[userId] || !nutritionSessions[userId].meals) {
    return await ctx.reply(
      'У вас еще нет запланированных приемов пищи. Выберите прием пищи для планирования.',
      Markup.keyboard([
        ['Завтрак', 'Обед', 'Ужин'],
        ['Перекус', 'Все приемы пищи'],
        ['Отмена']
      ]).resize()
    );
  }
  
  const meals = nutritionSessions[userId].meals;
  const mealKeys = Object.keys(meals);
  
  if (mealKeys.length === 0) {
    return await ctx.reply(
      'У вас еще нет запланированных приемов пищи. Выберите прием пищи для планирования.',
      Markup.keyboard([
        ['Завтрак', 'Обед', 'Ужин'],
        ['Перекус', 'Все приемы пищи'],
        ['Отмена']
      ]).resize()
    );
  }
  
  // Рассчитываем общую пищевую ценность
  const totalNutrition = calculateTotalNutrition(meals);
  
  // Формируем сообщение со сводкой
  let message = `📋 План питания на ${nutritionSessions[userId].selectedDay.toLowerCase()}:\n\n`;
  
  // Маппинг английских ключей на русские названия
  const mealTypeMap = {
    'breakfast': '🍳 Завтрак',
    'lunch': '🥗 Обед',
    'dinner': '🍽 Ужин',
    'snack': '🍌 Перекус'
  };
  
  mealKeys.forEach(key => {
    const meal = meals[key];
    message += `${mealTypeMap[key]}: *${meal.name}*\n`;
    message += formatMealItems(meal.items);
    message += '\n\n';
  });
  
  message += `📊 *Общая пищевая ценность*:\n`;
  message += `Калории: ${Math.round(totalNutrition.calories)} ккал\n`;
  message += `Белки: ${Math.round(totalNutrition.protein)}г\n`;
  message += `Жиры: ${Math.round(totalNutrition.fat)}г\n`;
  message += `Углеводы: ${Math.round(totalNutrition.carbs)}г\n`;
  
  // Добавляем советы по питанию
  message += '\n💡 *Советы*:\n';
  message += '• Старайтесь придерживаться регулярного графика приемов пищи\n';
  message += '• Пейте достаточно воды в течение дня\n';
  message += '• Не забывайте о разнообразии продуктов в рационе\n';
  
  await ctx.replyWithMarkdown(
    message,
    Markup.keyboard([
      ['Сохранить план', 'Изменить план'],
      ['Вернуться в главное меню']
    ]).resize()
  );
  
  nutritionSessions[userId].step = 'plan_created';
}

/**
 * Рассчитать КБЖУ по описанию продуктов
 */
async function calculateNutritionByText(ctx) {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  
  // Парсим введенный текст
  const items = parseProductsText(text);
  
  if (items.length === 0) {
    return await ctx.reply(
      'Не удалось распознать продукты. Пожалуйста, введите их в формате:\n' +
      'яйцо 2 шт, творог 100 г, банан 1 шт'
    );
  }
  
  // Рассчитываем пищевую ценность
  const nutrition = calculateNutrition(items);
  
  // Формируем сообщение с результатом
  let message = `📊 *Пищевая ценность*:\n\n`;
  message += formatMealItems(items);
  message += '\n\n';
  message += `Калории: ${Math.round(nutrition.calories)} ккал\n`;
  message += `Белки: ${Math.round(nutrition.protein)}г\n`;
  message += `Жиры: ${Math.round(nutrition.fat)}г\n`;
  message += `Углеводы: ${Math.round(nutrition.carbs)}г\n`;
  
  // Если у пользователя есть цель, добавляем рекомендацию
  if (nutritionSessions[userId] && nutritionSessions[userId].userInfo && nutritionSessions[userId].userInfo.goal) {
    const goal = nutritionSessions[userId].userInfo.goal;
    const weight = nutritionSessions[userId].userInfo.weight || 70; // Значение по умолчанию
    const gender = nutritionSessions[userId].userInfo.gender || 'male'; // Значение по умолчанию
    
    const goalInfo = nutritionGoals[goal];
    
    if (goalInfo) {
      const recommendedCalories = goalInfo.dailyCalories[gender](weight);
      const mealPercentage = 0.3; // Примерно 30% от дневной нормы для одного приема пищи
      
      message += '\n💡 *Рекомендация*:\n';
      
      if (nutrition.calories < recommendedCalories * mealPercentage * 0.7) {
        message += `Этот прием пищи содержит меньше калорий, чем рекомендуется для вашей цели "${goal}".\n`;
      } else if (nutrition.calories > recommendedCalories * mealPercentage * 1.3) {
        message += `Этот прием пищи содержит больше калорий, чем рекомендуется для вашей цели "${goal}".\n`;
      } else {
        message += `Этот прием пищи хорошо соответствует вашей цели "${goal}".\n`;
      }
      
      // Добавляем случайный совет из списка
      const randomTip = goalInfo.tips[Math.floor(Math.random() * goalInfo.tips.length)];
      message += `Совет: ${randomTip}`;
    }
  }
  
  await ctx.replyWithMarkdown(
    message,
    Markup.keyboard([
      ['Рассчитать КБЖУ', 'Спланировать питание'],
      ['Вернуться в главное меню']
    ]).resize()
  );
}

/**
 * Обработка информации о пользователе
 */
async function handleUserInfoInput(ctx) {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  
  if (!nutritionSessions[userId]) return;
  
  const step = nutritionSessions[userId].step;
  
  // Обработка пропуска ввода данных
  if (text === 'Пропустить') {
    nutritionSessions[userId].step = 'completed';
    return await showMainMenu(ctx);
  }
  
  switch (step) {
    case 'ask_gender':
      if (text === 'Мужской' || text === 'Женский') {
        nutritionSessions[userId].userInfo.gender = text === 'Мужской' ? 'male' : 'female';
        nutritionSessions[userId].step = 'ask_age';
        
        await ctx.reply(
          'Укажите ваш возраст:',
          Markup.keyboard([['Пропустить']]).resize()
        );
      } else {
        await ctx.reply('Пожалуйста, выберите один из предложенных вариантов.');
      }
      break;
      
    case 'ask_age':
      const age = parseInt(text);
      if (!isNaN(age) && age > 0 && age < 120) {
        nutritionSessions[userId].userInfo.age = age;
        nutritionSessions[userId].step = 'ask_weight';
        
        await ctx.reply(
          'Укажите ваш вес (в кг):',
          Markup.keyboard([['Пропустить']]).resize()
        );
      } else {
        await ctx.reply('Пожалуйста, введите корректный возраст (число от 1 до 120).');
      }
      break;
      
    case 'ask_weight':
      const weight = parseFloat(text.replace(',', '.'));
      if (!isNaN(weight) && weight > 30 && weight < 250) {
        nutritionSessions[userId].userInfo.weight = weight;
        nutritionSessions[userId].step = 'ask_height';
        
        await ctx.reply(
          'Укажите ваш рост (в см):',
          Markup.keyboard([['Пропустить']]).resize()
        );
      } else {
        await ctx.reply('Пожалуйста, введите корректный вес (число от 30 до 250).');
      }
      break;
      
    case 'ask_height':
      const height = parseInt(text);
      if (!isNaN(height) && height > 100 && height < 250) {
        nutritionSessions[userId].userInfo.height = height;
        nutritionSessions[userId].step = 'ask_goal';
        
        await ctx.reply(
          'Выберите вашу цель:',
          Markup.keyboard([
            ['Похудеть', 'Держать форму', 'Набрать массу'],
            ['Пропустить']
          ]).resize()
        );
      } else {
        await ctx.reply('Пожалуйста, введите корректный рост (число от 100 до 250).');
      }
      break;
      
    case 'ask_goal':
      if (['Похудеть', 'Держать форму', 'Набрать массу'].includes(text)) {
        nutritionSessions[userId].userInfo.goal = text.toLowerCase();
        nutritionSessions[userId].step = 'completed';
        
        // Сохраняем информацию о пользователе
        // В реальном приложении здесь будет сохранение в БД
        
        await ctx.reply(
          'Спасибо! Информация сохранена. Теперь я смогу давать более точные рекомендации.',
          Markup.removeKeyboard()
        );
        
        await showMainMenu(ctx);
      } else {
        await ctx.reply('Пожалуйста, выберите один из предложенных вариантов.');
      }
      break;
  }
}

/**
 * Показать главное меню
 */
async function showMainMenu(ctx) {
  await ctx.reply(
    'Что вы хотите сделать?',
    Markup.keyboard([
      ['Рассчитать КБЖУ', 'Спланировать питание'],
      ['Мой профиль', 'Помощь']
    ]).resize()
  );
}

/**
 * Парсинг текста с описанием продуктов
 */
function parseProductsText(text) {
  const items = [];
  
  // Разделяем текст на отдельные продукты (по запятой)
  const productStrings = text.split(',').map(s => s.trim());
  
  productStrings.forEach(productString => {
    // Ищем совпадения с продуктами из базы
    for (const productName in products) {
      if (productString.includes(productName)) {
        // Ищем количество
        const regex = new RegExp(`(\\d+(?:[.,]\\d+)?)(?: *)(${products[productName].unit}|шт)?`, 'i');
        const match = productString.match(regex);
        
        if (match) {
          const amount = parseFloat(match[1].replace(',', '.'));
          items.push({
            name: productName,
            amount: amount
          });
          break;
        } else {
          // Если количество не указано, предполагаем 100г/мл или 1 шт
          const defaultAmount = products[productName].unit === 'шт' ? 1 : 100;
          items.push({
            name: productName,
            amount: defaultAmount
          });
          break;
        }
      }
    }
  });
  
  return items;
}

/**
 * Расчет пищевой ценности для списка продуктов
 */
function calculateNutrition(items) {
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  
  items.forEach(item => {
    const product = products[item.name];
    
    if (product) {
      // Для продуктов, измеряемых в штуках, учитываем вес одной штуки
      let multiplier = 1;
      
      if (product.unit === 'шт' && product.weight) {
        multiplier = product.weight / 100; // Пересчитываем на 100г
      }
      
      calories += (product.calories * item.amount * multiplier) / (product.unit === 'шт' ? 1 : 100);
      protein += (product.protein * item.amount * multiplier) / (product.unit === 'шт' ? 1 : 100);
      fat += (product.fat * item.amount * multiplier) / (product.unit === 'шт' ? 1 : 100);
      carbs += (product.carbs * item.amount * multiplier) / (product.unit === 'шт' ? 1 : 100);
    }
  });
  
  return { calories, protein, fat, carbs };
}

/**
 * Расчет общей пищевой ценности для всех приемов пищи
 */
function calculateTotalNutrition(meals) {
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  
  Object.values(meals).forEach(meal => {
    const nutrition = calculateNutrition(meal.items);
    calories += nutrition.calories;
    protein += nutrition.protein;
    fat += nutrition.fat;
    carbs += nutrition.carbs;
  });
  
  return { calories, protein, fat, carbs };
}

module.exports = {
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
};
