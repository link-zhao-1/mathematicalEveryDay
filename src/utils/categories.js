/**
 * Mathematical problem categories with Chinese and English names
 */
export const MATH_CATEGORIES = {
  DIFFERENTIAL: {
    id: 'differential',
    name: '微分学',
    englishName: 'Differential Calculus',
    description: '导数、微分、切线、函数单调性、极值等',
    folder: 'differential'
  },
  INTEGRAL: {
    id: 'integral',
    name: '积分学',
    englishName: 'Integral Calculus',
    description: '不定积分、定积分、积分应用等',
    folder: 'integral'
  },
  DIFFERENTIAL_EQUATION: {
    id: 'differential_equation',
    name: '微分方程',
    englishName: 'Differential Equations',
    description: '常微分方程、偏微分方程等',
    folder: 'differential-equations'
  },
  MULTIVARIABLE_DIFFERENTIAL: {
    id: 'multivariable_differential',
    name: '多元微分',
    englishName: 'Multivariable Differential',
    description: '偏导数、全微分、梯度、方向导数等',
    folder: 'multivariable-differential'
  },
  MULTIPLE_INTEGRAL: {
    id: 'multiple_integral',
    name: '多重积分',
    englishName: 'Multiple Integrals',
    description: '二重积分、三重积分、曲线积分、曲面积分等',
    folder: 'multiple-integrals'
  },
  SERIES: {
    id: 'series',
    name: '级数',
    englishName: 'Series',
    description: '数项级数、幂级数、傅里叶级数等',
    folder: 'series'
  },
  LINEAR_ALGEBRA: {
    id: 'linear_algebra',
    name: '线性代数',
    englishName: 'Linear Algebra',
    description: '矩阵、行列式、向量空间、特征值等',
    folder: 'linear-algebra'
  },
  PROBABILITY: {
    id: 'probability',
    name: '概率统计',
    englishName: 'Probability and Statistics',
    description: '概率、随机变量、分布、统计推断等',
    folder: 'probability-statistics'
  }
};

/**
 * Get all categories as an array
 * @returns {Array} Array of category objects
 */
export const getCategoriesArray = () => {
  return Object.values(MATH_CATEGORIES);
};

/**
 * Get category by ID
 * @param {string} categoryId - The category ID
 * @returns {Object|null} The category object or null if not found
 */
export const getCategoryById = (categoryId) => {
  return Object.values(MATH_CATEGORIES).find(cat => cat.id === categoryId) || null;
};

/**
 * Get random category
 * @returns {Object} A random category object
 */
export const getRandomCategory = () => {
  const categories = getCategoriesArray();
  return categories[Math.floor(Math.random() * categories.length)];
};
