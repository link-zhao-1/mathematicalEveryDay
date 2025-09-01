import { getAllProblemFiles, readProblemFile } from './fileManager.js';

/**
 * Calculate text similarity using simple string comparison
 * @param {string} text1 - First text to compare
 * @param {string} text2 - Second text to compare
 * @returns {number} Similarity score between 0 and 1
 */
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  // Normalize texts
  const normalize = (text) => text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
  
  const normalizedText1 = normalize(text1);
  const normalizedText2 = normalize(text2);
  
  if (normalizedText1 === normalizedText2) return 1;
  
  // Simple word-based similarity
  const words1 = normalizedText1.split(' ');
  const words2 = normalizedText2.split(' ');
  
  const allWords = new Set([...words1, ...words2]);
  let commonWords = 0;
  
  for (const word of allWords) {
    if (words1.includes(word) && words2.includes(word)) {
      commonWords++;
    }
  }
  
  return commonWords / allWords.size;
}

/**
 * Calculate title similarity with higher weight
 * @param {string} title1 - First title
 * @param {string} title2 - Second title
 * @returns {number} Title similarity score
 */
function calculateTitleSimilarity(title1, title2) {
  return calculateTextSimilarity(title1, title2);
}

/**
 * Extract key mathematical concepts from text
 * @param {string} text - Text to analyze
 * @returns {Array<string>} Array of mathematical concepts
 */
function extractMathConcepts(text) {
  const mathKeywords = [
    // 微积分
    '导数', '微分', '积分', '极限', '连续', '切线', '极值', '单调', '凹凸',
    '偏导数', '全微分', '梯度', '方向导数', '重积分', '曲线积分', '曲面积分',
    
    // 代数
    '矩阵', '行列式', '向量', '特征值', '特征向量', '线性', '齐次', '非齐次',
    '方程组', '二次型', '正定', '负定',
    
    // 级数
    '级数', '收敛', '发散', '幂级数', '泰勒', '傅里叶', '比值', '根值',
    
    // 概率统计
    '概率', '随机变量', '分布', '期望', '方差', '协方差', '独立', '相关',
    '正态分布', '均匀分布', '泊松分布', '二项分布',
    
    // 微分方程
    '微分方程', '常微分', '偏微分', '齐次方程', '非齐次方程', '通解', '特解',
    
    // 数学函数
    'sin', 'cos', 'tan', 'ln', 'log', 'exp', 'sqrt'
  ];
  
  const concepts = [];
  const normalizedText = text.toLowerCase();
  
  for (const keyword of mathKeywords) {
    if (normalizedText.includes(keyword.toLowerCase())) {
      concepts.push(keyword);
    }
  }
  
  return concepts;
}

/**
 * Calculate concept similarity between two problems
 * @param {Array<string>} concepts1 - First problem concepts
 * @param {Array<string>} concepts2 - Second problem concepts
 * @returns {number} Concept similarity score
 */
function calculateConceptSimilarity(concepts1, concepts2) {
  if (concepts1.length === 0 && concepts2.length === 0) return 0;
  if (concepts1.length === 0 || concepts2.length === 0) return 0;
  
  const set1 = new Set(concepts1);
  const set2 = new Set(concepts2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Calculate overall similarity between two problems
 * @param {Object} problem1 - First problem data
 * @param {Object} problem2 - Second problem data
 * @returns {Object} Similarity analysis result
 */
export function calculateProblemSimilarity(problem1, problem2) {
  // Title similarity (weight: 0.4)
  const titleSimilarity = calculateTitleSimilarity(problem1.title, problem2.title);
  
  // Description similarity (weight: 0.4)
  const descriptionSimilarity = calculateTextSimilarity(problem1.description, problem2.description);
  
  // Concept similarity (weight: 0.2)
  const concepts1 = extractMathConcepts(problem1.title + ' ' + problem1.description);
  const concepts2 = extractMathConcepts(problem2.title + ' ' + problem2.description);
  const conceptSimilarity = calculateConceptSimilarity(concepts1, concepts2);
  
  // Category check
  const sameCategory = problem1.category === problem2.category;
  
  // Calculate weighted overall similarity
  const overallSimilarity = 
    titleSimilarity * 0.4 + 
    descriptionSimilarity * 0.4 + 
    conceptSimilarity * 0.2;
  
  return {
    overall: overallSimilarity,
    title: titleSimilarity,
    description: descriptionSimilarity,
    concept: conceptSimilarity,
    sameCategory,
    isDuplicate: overallSimilarity > 0.7, // Threshold for duplicate detection
    isHighlySimilar: overallSimilarity > 0.5
  };
}

/**
 * Check if a new problem is similar to existing problems
 * @param {Object} newProblem - New problem to check
 * @param {number} similarityThreshold - Threshold for similarity (default: 0.7)
 * @returns {Promise<Object>} Duplicate check result
 */
export async function checkForDuplicates(newProblem, similarityThreshold = 0.7) {
  try {
    const existingFiles = await getAllProblemFiles();
    const results = {
      isDuplicate: false,
      highestSimilarity: 0,
      duplicates: [],
      similarProblems: []
    };
    
    for (const filePath of existingFiles) {
      try {
        const existingProblem = await readProblemFile(filePath);
        const similarity = calculateProblemSimilarity(newProblem, existingProblem);
        
        if (similarity.overall > results.highestSimilarity) {
          results.highestSimilarity = similarity.overall;
        }
        
        if (similarity.isDuplicate || similarity.overall >= similarityThreshold) {
          results.isDuplicate = true;
          results.duplicates.push({
            filePath,
            problem: existingProblem,
            similarity
          });
        } else if (similarity.isHighlySimilar) {
          results.similarProblems.push({
            filePath,
            problem: existingProblem,
            similarity
          });
        }
      } catch (error) {
        console.warn(`Failed to read problem file ${filePath}:`, error.message);
      }
    }
    
    // Sort by similarity score
    results.duplicates.sort((a, b) => b.similarity.overall - a.similarity.overall);
    results.similarProblems.sort((a, b) => b.similarity.overall - a.similarity.overall);
    
    return results;
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    throw error;
  }
}

/**
 * Get similar problems in the same category
 * @param {string} categoryId - Category to search in
 * @param {number} limit - Maximum number of problems to return
 * @returns {Promise<Array>} Array of similar problems
 */
export async function getSimilarProblemsInCategory(categoryId, limit = 10) {
  try {
    const allFiles = await getAllProblemFiles();
    const categoryProblems = [];
    
    for (const filePath of allFiles) {
      try {
        const problem = await readProblemFile(filePath);
        if (problem.category && problem.category.includes(categoryId)) {
          categoryProblems.push({
            filePath,
            problem,
            concepts: extractMathConcepts(problem.title + ' ' + problem.description)
          });
        }
      } catch (error) {
        console.warn(`Failed to read problem file ${filePath}:`, error.message);
      }
    }
    
    return categoryProblems.slice(0, limit);
  } catch (error) {
    console.error('Error getting similar problems:', error);
    throw error;
  }
}

/**
 * Generate problem uniqueness report
 * @returns {Promise<Object>} Uniqueness analysis report
 */
export async function generateUniquenessReport() {
  try {
    const allFiles = await getAllProblemFiles();
    const problems = [];
    
    // Read all problems
    for (const filePath of allFiles) {
      try {
        const problem = await readProblemFile(filePath);
        problems.push({ filePath, problem });
      } catch (error) {
        console.warn(`Failed to read problem file ${filePath}:`, error.message);
      }
    }
    
    const report = {
      totalProblems: problems.length,
      duplicatePairs: [],
      highSimilarityPairs: [],
      categoryDistribution: {},
      uniquenessScore: 0
    };
    
    // Compare all pairs
    for (let i = 0; i < problems.length; i++) {
      for (let j = i + 1; j < problems.length; j++) {
        const similarity = calculateProblemSimilarity(problems[i].problem, problems[j].problem);
        
        if (similarity.isDuplicate) {
          report.duplicatePairs.push({
            problem1: problems[i],
            problem2: problems[j],
            similarity
          });
        } else if (similarity.isHighlySimilar) {
          report.highSimilarityPairs.push({
            problem1: problems[i],
            problem2: problems[j],
            similarity
          });
        }
      }
      
      // Count category distribution
      const category = problems[i].problem.category;
      if (category) {
        report.categoryDistribution[category] = (report.categoryDistribution[category] || 0) + 1;
      }
    }
    
    // Calculate uniqueness score
    const totalPairs = (problems.length * (problems.length - 1)) / 2;
    const duplicatePairs = report.duplicatePairs.length;
    report.uniquenessScore = totalPairs > 0 ? 1 - (duplicatePairs / totalPairs) : 1;
    
    return report;
  } catch (error) {
    console.error('Error generating uniqueness report:', error);
    throw error;
  }
}
