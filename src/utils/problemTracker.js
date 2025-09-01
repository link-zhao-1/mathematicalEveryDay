import fs from 'fs-extra';
import path from 'path';
import moment from 'moment';
import { getAllProblemFiles, readProblemFile } from './fileManager.js';

/**
 * Find problems without solutions
 * @param {Date} targetDate - Optional target date to filter problems
 * @returns {Promise<Array>} Array of problem file paths without solutions
 */
export async function findProblemsWithoutSolutions(targetDate = null) {
  try {
    const allProblemFiles = await getAllProblemFiles();
    const problemsWithoutSolutions = [];
    
    for (const filePath of allProblemFiles) {
      try {
        const problemData = await readProblemFile(filePath);
        
        // Check if solution exists
        if (!problemData.solution || problemData.solution.includes('解答将在明天自动生成')) {
          // If target date is specified, filter by date
          if (targetDate) {
            const problemDate = moment(problemData.date, 'YYYY-MM-DD');
            const target = moment(targetDate).format('YYYY-MM-DD');
            
            if (problemDate.format('YYYY-MM-DD') === target) {
              problemsWithoutSolutions.push(filePath);
            }
          } else {
            problemsWithoutSolutions.push(filePath);
          }
        }
      } catch (error) {
        console.error(`Error reading problem file ${filePath}:`, error.message);
        continue;
      }
    }
    
    return problemsWithoutSolutions;
  } catch (error) {
    console.error('Error finding problems without solutions:', error);
    throw error;
  }
}

/**
 * Find problems by date
 * @param {Date} date - The target date
 * @returns {Promise<Array>} Array of problem file paths for the date
 */
export async function findProblemsByDate(date) {
  try {
    const allProblemFiles = await getAllProblemFiles();
    const problemsForDate = [];
    const targetDateStr = moment(date).format('YYYY-MM-DD');
    
    for (const filePath of allProblemFiles) {
      try {
        const problemData = await readProblemFile(filePath);
        
        if (problemData.date === targetDateStr) {
          problemsForDate.push(filePath);
        }
      } catch (error) {
        console.error(`Error reading problem file ${filePath}:`, error.message);
        continue;
      }
    }
    
    return problemsForDate;
  } catch (error) {
    console.error('Error finding problems by date:', error);
    throw error;
  }
}

/**
 * Find problems by category
 * @param {string} categoryId - The category ID
 * @returns {Promise<Array>} Array of problem file paths for the category
 */
export async function findProblemsByCategory(categoryId) {
  try {
    const allProblemFiles = await getAllProblemFiles();
    const problemsForCategory = [];
    
    for (const filePath of allProblemFiles) {
      // Check if the file path contains the category folder
      if (filePath.includes(categoryId) || filePath.includes(categoryId.replace('_', '-'))) {
        problemsForCategory.push(filePath);
      }
    }
    
    return problemsForCategory;
  } catch (error) {
    console.error('Error finding problems by category:', error);
    throw error;
  }
}

/**
 * Get problem statistics
 * @returns {Promise<Object>} Statistics object
 */
export async function getProblemStatistics() {
  try {
    const allProblemFiles = await getAllProblemFiles();
    const stats = {
      total: 0,
      withSolutions: 0,
      withoutSolutions: 0,
      byCategory: {},
      byDifficulty: {
        '简单': 0,
        '中等': 0,
        '困难': 0
      }
    };
    
    for (const filePath of allProblemFiles) {
      try {
        const problemData = await readProblemFile(filePath);
        stats.total++;
        
        // Check if has solution
        if (problemData.solution && !problemData.solution.includes('解答将在明天自动生成')) {
          stats.withSolutions++;
        } else {
          stats.withoutSolutions++;
        }
        
        // Count by category
        if (problemData.category) {
          stats.byCategory[problemData.category] = (stats.byCategory[problemData.category] || 0) + 1;
        }
        
        // Count by difficulty
        if (problemData.difficulty && stats.byDifficulty[problemData.difficulty] !== undefined) {
          stats.byDifficulty[problemData.difficulty]++;
        }
      } catch (error) {
        console.error(`Error reading problem file ${filePath}:`, error.message);
        continue;
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting problem statistics:', error);
    throw error;
  }
}

/**
 * Check if a problem already exists for today
 * @returns {Promise<boolean>} True if a problem exists for today
 */
export async function problemExistsForToday() {
  const today = new Date();
  const problemsToday = await findProblemsByDate(today);
  return problemsToday.length > 0;
}

/**
 * Get the most recent problem
 * @returns {Promise<Object|null>} The most recent problem data or null
 */
export async function getMostRecentProblem() {
  try {
    const allProblemFiles = await getAllProblemFiles();
    
    if (allProblemFiles.length === 0) {
      return null;
    }
    
    let mostRecentProblem = null;
    let mostRecentDate = null;
    
    for (const filePath of allProblemFiles) {
      try {
        const problemData = await readProblemFile(filePath);
        const problemDate = moment(problemData.date, 'YYYY-MM-DD');
        
        if (!mostRecentDate || problemDate.isAfter(mostRecentDate)) {
          mostRecentDate = problemDate;
          mostRecentProblem = problemData;
        }
      } catch (error) {
        console.error(`Error reading problem file ${filePath}:`, error.message);
        continue;
      }
    }
    
    return mostRecentProblem;
  } catch (error) {
    console.error('Error getting most recent problem:', error);
    throw error;
  }
}
