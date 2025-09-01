import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const HISTORY_FILE = path.join(PROJECT_ROOT, 'data', 'problem-history.json');

/**
 * Problem history record structure
 * @typedef {Object} ProblemRecord
 * @property {string} id - Unique identifier
 * @property {string} title - Problem title
 * @property {string} category - Problem category
 * @property {string} difficulty - Problem difficulty
 * @property {Array<string>} keywords - Extracted keywords
 * @property {string} createdAt - Creation timestamp
 * @property {string} filePath - File path
 * @property {number} titleHash - Hash of title for quick comparison
 * @property {number} contentHash - Hash of content for similarity check
 */

/**
 * Load problem history from file
 * @returns {Promise<Array<ProblemRecord>>} Array of problem records
 */
export async function loadProblemHistory() {
  try {
    await fs.ensureDir(path.dirname(HISTORY_FILE));
    
    if (await fs.pathExists(HISTORY_FILE)) {
      const content = await fs.readFile(HISTORY_FILE, 'utf8');
      return JSON.parse(content);
    }
    
    return [];
  } catch (error) {
    console.warn('Failed to load problem history:', error.message);
    return [];
  }
}

/**
 * Save problem history to file
 * @param {Array<ProblemRecord>} history - Problem history array
 * @returns {Promise<void>}
 */
export async function saveProblemHistory(history) {
  try {
    await fs.ensureDir(path.dirname(HISTORY_FILE));
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save problem history:', error);
    throw error;
  }
}

/**
 * Generate a simple hash for string comparison
 * @param {string} text - Text to hash
 * @returns {number} Hash value
 */
function simpleHash(text) {
  if (!text) return 0;
  
  let hash = 0;
  const normalizedText = text.toLowerCase().replace(/[^\w]/g, '');
  
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash);
}

/**
 * Extract keywords from problem content
 * @param {string} title - Problem title
 * @param {string} description - Problem description
 * @returns {Array<string>} Extracted keywords
 */
function extractKeywords(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  
  // Common mathematical keywords
  const mathKeywords = [
    '函数', '导数', '积分', '极限', '连续', '微分', '偏导', '全微分',
    '矩阵', '行列式', '向量', '特征值', '线性', '齐次', '方程',
    '级数', '收敛', '发散', '幂级数', '泰勒', '傅里叶',
    '概率', '随机', '分布', '期望', '方差', '正态', '均匀',
    '极值', '最值', '单调', '凹凸', '拐点', '渐近',
    'sin', 'cos', 'tan', 'ln', 'log', 'exp'
  ];
  
  const foundKeywords = [];
  
  for (const keyword of mathKeywords) {
    if (text.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }
  
  return foundKeywords;
}

/**
 * Add a new problem to history
 * @param {Object} problemData - Problem data object
 * @param {string} filePath - File path of the problem
 * @returns {Promise<string>} Problem ID
 */
export async function addProblemToHistory(problemData, filePath) {
  try {
    const history = await loadProblemHistory();
    
    const problemId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const keywords = extractKeywords(problemData.title, problemData.description);
    
    const record = {
      id: problemId,
      title: problemData.title,
      category: problemData.category,
      difficulty: problemData.difficulty,
      keywords,
      createdAt: new Date().toISOString(),
      filePath,
      titleHash: simpleHash(problemData.title),
      contentHash: simpleHash(problemData.title + problemData.description)
    };
    
    history.push(record);
    await saveProblemHistory(history);
    
    console.log(`📝 Added problem to history: ${problemId}`);
    return problemId;
    
  } catch (error) {
    console.error('Failed to add problem to history:', error);
    throw error;
  }
}

/**
 * Check if a problem is similar to existing ones in history
 * @param {Object} problemData - New problem data
 * @param {number} similarityThreshold - Similarity threshold (0-1)
 * @returns {Promise<Object>} Similarity check result
 */
export async function checkSimilarityInHistory(problemData, similarityThreshold = 0.8) {
  try {
    const history = await loadProblemHistory();
    
    const newTitleHash = simpleHash(problemData.title);
    const newContentHash = simpleHash(problemData.title + problemData.description);
    const newKeywords = extractKeywords(problemData.title, problemData.description);
    
    const similarProblems = [];
    
    for (const record of history) {
      let similarity = 0;
      
      // Title hash comparison (weight: 0.4)
      const titleSimilarity = record.titleHash === newTitleHash ? 1 : 0;
      
      // Content hash comparison (weight: 0.4)
      const contentSimilarity = record.contentHash === newContentHash ? 1 : 0;
      
      // Keyword similarity (weight: 0.2)
      const commonKeywords = record.keywords.filter(k => newKeywords.includes(k));
      const allKeywords = new Set([...record.keywords, ...newKeywords]);
      const keywordSimilarity = allKeywords.size > 0 ? commonKeywords.length / allKeywords.size : 0;
      
      similarity = titleSimilarity * 0.4 + contentSimilarity * 0.4 + keywordSimilarity * 0.2;
      
      if (similarity >= similarityThreshold) {
        similarProblems.push({
          record,
          similarity,
          commonKeywords
        });
      }
    }
    
    // Sort by similarity (highest first)
    similarProblems.sort((a, b) => b.similarity - a.similarity);
    
    return {
      hasSimilar: similarProblems.length > 0,
      similarProblems: similarProblems.slice(0, 5), // Top 5 most similar
      highestSimilarity: similarProblems.length > 0 ? similarProblems[0].similarity : 0
    };
    
  } catch (error) {
    console.error('Failed to check similarity in history:', error);
    throw error;
  }
}

/**
 * Get problem statistics from history
 * @returns {Promise<Object>} History statistics
 */
export async function getHistoryStatistics() {
  try {
    const history = await loadProblemHistory();
    
    const stats = {
      totalProblems: history.length,
      categoryDistribution: {},
      difficultyDistribution: {},
      keywordFrequency: {},
      creationTrend: {}
    };
    
    for (const record of history) {
      // Category distribution
      stats.categoryDistribution[record.category] = 
        (stats.categoryDistribution[record.category] || 0) + 1;
      
      // Difficulty distribution
      stats.difficultyDistribution[record.difficulty] = 
        (stats.difficultyDistribution[record.difficulty] || 0) + 1;
      
      // Keyword frequency
      for (const keyword of record.keywords) {
        stats.keywordFrequency[keyword] = 
          (stats.keywordFrequency[keyword] || 0) + 1;
      }
      
      // Creation trend (by month)
      const month = record.createdAt.substring(0, 7); // YYYY-MM
      stats.creationTrend[month] = 
        (stats.creationTrend[month] || 0) + 1;
    }
    
    return stats;
    
  } catch (error) {
    console.error('Failed to get history statistics:', error);
    throw error;
  }
}

/**
 * Clean up old history records (keep last N records)
 * @param {number} maxRecords - Maximum number of records to keep
 * @returns {Promise<number>} Number of records removed
 */
export async function cleanupHistory(maxRecords = 1000) {
  try {
    const history = await loadProblemHistory();
    
    if (history.length <= maxRecords) {
      return 0;
    }
    
    // Sort by creation date (newest first)
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Keep only the latest records
    const removedCount = history.length - maxRecords;
    const cleanHistory = history.slice(0, maxRecords);
    
    await saveProblemHistory(cleanHistory);
    
    console.log(`🧹 Cleaned up ${removedCount} old history records`);
    return removedCount;
    
  } catch (error) {
    console.error('Failed to cleanup history:', error);
    throw error;
  }
}

/**
 * Export history to JSON file
 * @param {string} exportPath - Export file path
 * @returns {Promise<void>}
 */
export async function exportHistory(exportPath) {
  try {
    const history = await loadProblemHistory();
    const stats = await getHistoryStatistics();
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      statistics: stats,
      problems: history
    };
    
    await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2), 'utf8');
    console.log(`📤 History exported to: ${exportPath}`);
    
  } catch (error) {
    console.error('Failed to export history:', error);
    throw error;
  }
}
