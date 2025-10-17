/**
 * База данных продуктов с информацией о КБЖУ (на 100г продукта)
 */

const products = {
  // Мясо и рыба
  "курица": { calories: 165, protein: 31, fat: 3.6, carbs: 0, unit: "г" },
  "говядина": { calories: 250, protein: 26, fat: 17, carbs: 0, unit: "г" },
  "свинина": { calories: 242, protein: 21, fat: 16, carbs: 0, unit: "г" },
  "индейка": { calories: 135, protein: 29, fat: 2, carbs: 0, unit: "г" },
  "лосось": { calories: 208, protein: 20, fat: 13, carbs: 0, unit: "г" },
  "тунец": { calories: 130, protein: 29, fat: 1, carbs: 0, unit: "г" },
  "треска": { calories: 82, protein: 17.5, fat: 0.7, carbs: 0, unit: "г" },

  // Молочные продукты
  "молоко": { calories: 42, protein: 3.4, fat: 1, carbs: 4.8, unit: "мл" },
  "творог": { calories: 103, protein: 18, fat: 2, carbs: 3, unit: "г" },
  "сыр": { calories: 402, protein: 25, fat: 33, carbs: 0, unit: "г" },
  "йогурт": { calories: 59, protein: 3.8, fat: 2, carbs: 4.7, unit: "г" },
  "кефир": { calories: 40, protein: 3, fat: 1, carbs: 4, unit: "мл" },

  // Яйца
  "яйцо": { calories: 157, protein: 13, fat: 11, carbs: 1, unit: "шт", weight: 60 },
  "белок яйца": { calories: 52, protein: 11, fat: 0.2, carbs: 0.7, unit: "шт", weight: 33 },
  "желток": { calories: 322, protein: 16, fat: 27, carbs: 3.6, unit: "шт", weight: 17 },

  // Крупы и злаки
  "рис": { calories: 130, protein: 2.7, fat: 0.3, carbs: 28, unit: "г" },
  "гречка": { calories: 343, protein: 12.6, fat: 3.3, carbs: 62, unit: "г" },
  "овсянка": { calories: 379, protein: 13, fat: 6.8, carbs: 68, unit: "г" },
  "киноа": { calories: 120, protein: 4.4, fat: 1.9, carbs: 21.3, unit: "г" },
  "булгур": { calories: 342, protein: 12.3, fat: 1.3, carbs: 75.9, unit: "г" },

  // Хлеб и выпечка
  "хлеб белый": { calories: 265, protein: 8, fat: 3.2, carbs: 49, unit: "г" },
  "хлеб ржаной": { calories: 259, protein: 9, fat: 1.1, carbs: 48, unit: "г" },
  "батон": { calories: 277, protein: 7.5, fat: 2.9, carbs: 53, unit: "г" },

  // Овощи
  "картофель": { calories: 77, protein: 2, fat: 0.1, carbs: 17, unit: "г" },
  "морковь": { calories: 41, protein: 0.9, fat: 0.2, carbs: 9.6, unit: "г" },
  "огурец": { calories: 15, protein: 0.8, fat: 0.1, carbs: 3.6, unit: "г" },
  "помидор": { calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, unit: "г" },
  "капуста": { calories: 25, protein: 1.3, fat: 0.2, carbs: 5.4, unit: "г" },
  "лук": { calories: 40, protein: 1.1, fat: 0.1, carbs: 9.3, unit: "г" },
  "чеснок": { calories: 149, protein: 6.4, fat: 0.5, carbs: 33, unit: "г" },
  "брокколи": { calories: 34, protein: 2.8, fat: 0.4, carbs: 7, unit: "г" },
  "цветная капуста": { calories: 25, protein: 1.9, fat: 0.3, carbs: 5, unit: "г" },
  "шпинат": { calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, unit: "г" },

  // Фрукты и ягоды
  "яблоко": { calories: 52, protein: 0.3, fat: 0.4, carbs: 14, unit: "шт", weight: 180 },
  "банан": { calories: 89, protein: 1.1, fat: 0.3, carbs: 22.8, unit: "шт", weight: 120 },
  "апельсин": { calories: 47, protein: 0.9, fat: 0.1, carbs: 11.8, unit: "шт", weight: 150 },
  "груша": { calories: 57, protein: 0.4, fat: 0.1, carbs: 15.2, unit: "шт", weight: 170 },
  "клубника": { calories: 32, protein: 0.7, fat: 0.3, carbs: 7.7, unit: "г" },
  "черника": { calories: 57, protein: 0.7, fat: 0.3, carbs: 14.5, unit: "г" },
  "малина": { calories: 52, protein: 1.2, fat: 0.7, carbs: 11.9, unit: "г" },

  // Орехи и семена
  "грецкий орех": { calories: 654, protein: 15.2, fat: 65.2, carbs: 13.7, unit: "г" },
  "миндаль": { calories: 579, protein: 21.2, fat: 49.9, carbs: 21.7, unit: "г" },
  "фундук": { calories: 628, protein: 15, fat: 60.8, carbs: 16.7, unit: "г" },
  "кешью": { calories: 553, protein: 18.2, fat: 43.8, carbs: 30.2, unit: "г" },
  "семена чиа": { calories: 486, protein: 16.5, fat: 30.7, carbs: 42.1, unit: "г" },
  "семена льна": { calories: 534, protein: 18.3, fat: 42.2, carbs: 28.9, unit: "г" },

  // Бобовые
  "чечевица": { calories: 116, protein: 9, fat: 0.4, carbs: 20, unit: "г" },
  "нут": { calories: 364, protein: 19, fat: 6, carbs: 61, unit: "г" },
  "фасоль": { calories: 333, protein: 21.6, fat: 2, carbs: 54.5, unit: "г" },
  "горох": { calories: 298, protein: 23.3, fat: 1.2, carbs: 53.5, unit: "г" },

  // Масла и жиры
  "масло оливковое": { calories: 898, protein: 0, fat: 99.8, carbs: 0, unit: "мл" },
  "масло подсолнечное": { calories: 899, protein: 0, fat: 99.9, carbs: 0, unit: "мл" },
  "масло сливочное": { calories: 717, protein: 0.6, fat: 81.1, carbs: 0.9, unit: "г" },
  "авокадо": { calories: 160, protein: 2, fat: 14.7, carbs: 8.5, unit: "шт", weight: 200 },

  // Сладости
  "шоколад темный": { calories: 539, protein: 5.4, fat: 30.3, carbs: 61.8, unit: "г" },
  "шоколад молочный": { calories: 546, protein: 7.7, fat: 30.7, carbs: 59.4, unit: "г" },
  "мед": { calories: 304, protein: 0.3, fat: 0, carbs: 82.4, unit: "г" },
  "сахар": { calories: 387, protein: 0, fat: 0, carbs: 99.7, unit: "г" },

  // Напитки
  "кофе": { calories: 2, protein: 0.1, fat: 0, carbs: 0.3, unit: "мл" },
  "чай": { calories: 1, protein: 0, fat: 0, carbs: 0.3, unit: "мл" },
  "сок апельсиновый": { calories: 45, protein: 0.7, fat: 0.2, carbs: 10.4, unit: "мл" },
  "сок яблочный": { calories: 46, protein: 0.1, fat: 0.1, carbs: 11.3, unit: "мл" },

  // Готовые блюда (примерные значения)
  "борщ": { calories: 49, protein: 2.8, fat: 2.3, carbs: 5.6, unit: "г" },
  "плов": { calories: 183, protein: 5.6, fat: 7.6, carbs: 24.2, unit: "г" },
  "пицца": { calories: 266, protein: 11, fat: 10, carbs: 33, unit: "г" },
  "гамбургер": { calories: 254, protein: 12, fat: 11, carbs: 27, unit: "шт", weight: 100 },
  "салат оливье": { calories: 153, protein: 5.1, fat: 12, carbs: 5.2, unit: "г" },
  "суши": { calories: 145, protein: 5.8, fat: 0.3, carbs: 30, unit: "шт", weight: 30 }
};

// Готовые шаблоны приемов пищи
const mealTemplates = {
  breakfast: [
    {
      name: "Белковый завтрак",
      items: [
        { name: "яйцо", amount: 2 },
        { name: "творог", amount: 100 },
        { name: "банан", amount: 1 }
      ]
    },
    {
      name: "Овсянка с фруктами",
      items: [
        { name: "овсянка", amount: 50 },
        { name: "молоко", amount: 200 },
        { name: "яблоко", amount: 1 },
        { name: "мед", amount: 10 }
      ]
    },
    {
      name: "Бутерброды с авокадо",
      items: [
        { name: "хлеб ржаной", amount: 50 },
        { name: "авокадо", amount: 0.5 },
        { name: "яйцо", amount: 1 }
      ]
    }
  ],
  lunch: [
    {
      name: "Куриная грудка с овощами",
      items: [
        { name: "курица", amount: 150 },
        { name: "рис", amount: 100 },
        { name: "брокколи", amount: 100 }
      ]
    },
    {
      name: "Борщ и хлеб",
      items: [
        { name: "борщ", amount: 300 },
        { name: "хлеб ржаной", amount: 30 }
      ]
    },
    {
      name: "Салат с тунцом",
      items: [
        { name: "тунец", amount: 100 },
        { name: "огурец", amount: 100 },
        { name: "помидор", amount: 100 },
        { name: "масло оливковое", amount: 10 }
      ]
    }
  ],
  dinner: [
    {
      name: "Рыба с овощами",
      items: [
        { name: "лосось", amount: 150 },
        { name: "картофель", amount: 150 },
        { name: "шпинат", amount: 50 }
      ]
    },
    {
      name: "Творог с ягодами",
      items: [
        { name: "творог", amount: 150 },
        { name: "клубника", amount: 100 },
        { name: "мед", amount: 10 }
      ]
    },
    {
      name: "Гречка с курицей",
      items: [
        { name: "гречка", amount: 100 },
        { name: "курица", amount: 100 }
      ]
    }
  ],
  snack: [
    {
      name: "Йогурт с орехами",
      items: [
        { name: "йогурт", amount: 150 },
        { name: "грецкий орех", amount: 20 }
      ]
    },
    {
      name: "Фруктовая тарелка",
      items: [
        { name: "яблоко", amount: 1 },
        { name: "банан", amount: 1 }
      ]
    },
    {
      name: "Творожная запеканка",
      items: [
        { name: "творог", amount: 100 },
        { name: "яйцо", amount: 1 },
        { name: "мед", amount: 10 }
      ]
    }
  ]
};

// Рекомендации по питанию в зависимости от целей
const nutritionGoals = {
  "похудеть": {
    dailyCalories: { 
      male: weight => Math.round(weight * 26 * 0.8),
      female: weight => Math.round(weight * 24 * 0.8)
    },
    macroRatio: {
      protein: 0.3, // 30% от общих калорий
      fat: 0.3,     // 30% от общих калорий
      carbs: 0.4    // 40% от общих калорий
    },
    tips: [
      "Старайтесь есть больше белка для сохранения мышечной массы",
      "Ограничьте потребление простых углеводов",
      "Пейте больше воды перед приемами пищи",
      "Увеличьте потребление клетчатки для лучшего насыщения",
      "Следите за размером порций",
      "Избегайте жареных продуктов и фастфуда"
    ]
  },
  "держать форму": {
    dailyCalories: {
      male: weight => Math.round(weight * 30),
      female: weight => Math.round(weight * 28)
    },
    macroRatio: {
      protein: 0.25, // 25% от общих калорий
      fat: 0.3,      // 30% от общих калорий
      carbs: 0.45    // 45% от общих калорий
    },
    tips: [
      "Поддерживайте баланс между потребляемыми и расходуемыми калориями",
      "Разнообразьте рацион для получения всех необходимых микроэлементов",
      "Регулярно питайтесь 4-5 раз в день",
      "Следите за качеством продуктов, а не только за калорийностью",
      "Не забывайте про здоровые жиры"
    ]
  },
  "набрать массу": {
    dailyCalories: {
      male: weight => Math.round(weight * 33 * 1.1),
      female: weight => Math.round(weight * 30 * 1.1)
    },
    macroRatio: {
      protein: 0.25, // 25% от общих калорий
      fat: 0.25,     // 25% от общих калорий
      carbs: 0.5     // 50% от общих калорий
    },
    tips: [
      "Увеличьте общую калорийность рациона на 300-500 ккал",
      "Ешьте больше сложных углеводов для энергии",
      "Обеспечьте достаточное потребление белка (1.6-2г на кг веса)",
      "Не пропускайте приемы пищи",
      "Добавьте перекусы между основными приемами пищи",
      "Употребляйте качественные источники белка после тренировок"
    ]
  }
};

module.exports = {
  products,
  mealTemplates,
  nutritionGoals
};
