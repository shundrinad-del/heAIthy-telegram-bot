/**
 * Вспомогательные функции
 */

/**
 * Получить случайную рекомендацию из списка
 * @param {Array} recommendations Массив рекомендаций
 * @returns {string} Случайная рекомендация
 */
const getRandomRecommendation = (recommendations) => {
  const randomIndex = Math.floor(Math.random() * recommendations.length);
  return recommendations[randomIndex];
};

/**
 * Форматировать дату в читаемый вид
 * @param {string} dateString Дата в формате ISO
 * @returns {string} Отформатированная дата
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Проверить, является ли время между указанными часами
 * @param {number} startHour Начальный час (0-23)
 * @param {number} endHour Конечный час (0-23)
 * @returns {boolean} true, если текущее время между startHour и endHour
 */
const isTimeBetween = (startHour, endHour) => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= startHour && hour < endHour;
};

/**
 * Получить приветствие в зависимости от времени суток
 * @returns {string} Приветствие
 */
const getGreeting = () => {
  if (isTimeBetween(5, 12)) {
    return 'Доброе утро';
  } else if (isTimeBetween(12, 18)) {
    return 'Добрый день';
  } else if (isTimeBetween(18, 23)) {
    return 'Добрый вечер';
  } else {
    return 'Доброй ночи';
  }
};

/**
 * Вычислить среднее значение массива чисел
 * @param {Array<number>} numbers Массив чисел
 * @returns {number} Среднее значение
 */
const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) {
    return 0;
  }
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / numbers.length) * 10) / 10;
};

module.exports = {
  getRandomRecommendation,
  formatDate,
  isTimeBetween,
  getGreeting,
  calculateAverage
};
