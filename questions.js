/**
 * Вопросы для пользователей бота
 */

const morningQuestions = [
  {
    id: 'sleep_quality',
    text: 'Как ты оцениваешь качество своего сна прошлой ночью? (1-10)',
    type: 'rating',
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'sleep_duration',
    text: 'Сколько часов ты спал(а)?',
    type: 'number',
    min: 0,
    max: 24
  },
  {
    id: 'morning_mood',
    text: 'Какое у тебя настроение с утра?',
    type: 'select',
    options: ['Отличное', 'Хорошее', 'Нормальное', 'Так себе', 'Плохое']
  },
  {
    id: 'breakfast',
    text: 'Что планируешь на завтрак?',
    type: 'select',
    options: ['Белковый завтрак', 'Углеводный завтрак', 'Смешанный', 'Пропущу завтрак']
  },
  {
    id: 'morning_activity',
    text: 'Планируешь ли утреннюю активность?',
    type: 'select',
    options: ['Тренировка', 'Зарядка', 'Прогулка', 'Без активности']
  }
];

const eveningQuestions = [
  {
    id: 'day_energy',
    text: 'Как ты оцениваешь свой уровень энергии за день? (1-10)',
    type: 'rating',
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'productivity',
    text: 'Насколько продуктивным был день? (1-10)',
    type: 'rating',
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'meals_count',
    text: 'Сколько приемов пищи у тебя было сегодня?',
    type: 'number',
    min: 0,
    max: 10
  },
  {
    id: 'water',
    text: 'Сколько стаканов воды ты выпил(а)?',
    type: 'number',
    min: 0,
    max: 20
  },
  {
    id: 'physical_activity',
    text: 'Была ли у тебя физическая активность сегодня?',
    type: 'select',
    options: ['Интенсивная тренировка', 'Легкая активность', 'Только ходьба', 'Без активности']
  }
];

const weeklyQuestions = [
  {
    id: 'week_energy',
    text: 'Как ты оцениваешь свой уровень энергии за неделю? (1-10)',
    type: 'rating',
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'week_productivity',
    text: 'Насколько продуктивной была неделя? (1-10)',
    type: 'rating',
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'week_sleep',
    text: 'Как ты оцениваешь качество сна за неделю? (1-10)',
    type: 'rating',
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'week_nutrition',
    text: 'Как ты оцениваешь свое питание за неделю? (1-10)',
    type: 'rating',
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'week_activity',
    text: 'Сколько дней на этой неделе у тебя была физическая активность?',
    type: 'number',
    min: 0,
    max: 7
  }
];

module.exports = {
  morningQuestions,
  eveningQuestions,
  weeklyQuestions
};
