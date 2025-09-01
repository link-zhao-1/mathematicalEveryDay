import AIService from './aiService.js';
import { getRandomCategory, getCategoriesArray } from '../utils/categories.js';
import { createProblemFile } from '../utils/fileManager.js';
import { checkForDuplicates, getSimilarProblemsInCategory } from '../utils/duplicateChecker.js';
import { addProblemToHistory, checkSimilarityInHistory } from '../utils/problemHistory.js';
import { updateReadme } from '../utils/readmeUpdater.js';

/**
 * Problem Generator Service
 * Handles the generation of mathematical problems
 */
class ProblemGenerator {
  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Generate a daily mathematical problem with duplicate checking
   * @param {string} categoryId - Optional specific category ID
   * @param {number} maxRetries - Maximum retry attempts if duplicates found
   * @returns {Promise<Object>} Generated problem data
   */
  async generateDailyProblem(categoryId = null, maxRetries = 3) {
    try {
      // Select category
      const category = categoryId 
        ? getCategoriesArray().find(cat => cat.id === categoryId)
        : getRandomCategory();

      if (!category) {
        throw new Error(`Category not found: ${categoryId}`);
      }

      console.log(`Generating problem for category: ${category.name}`);

      let attempts = 0;
      let problemData;
      let duplicateCheckResult;

      while (attempts < maxRetries) {
        attempts++;
        console.log(`Attempt ${attempts}/${maxRetries} for generating unique problem...`);

        // Generate problem using AI with context about existing problems
        problemData = await this.generateProblemWithContext(category, attempts);
        
        // Check for duplicates in existing files
        duplicateCheckResult = await checkForDuplicates(problemData);
        
        // Also check against historical data
        const historyCheck = await checkSimilarityInHistory(problemData, 0.8);
        
        if (!duplicateCheckResult.isDuplicate && !historyCheck.hasSimilar) {
          console.log(`✅ Unique problem generated on attempt ${attempts}`);
          break;
        } else {
          const fileSimilarity = duplicateCheckResult.highestSimilarity;
          const historySimilarity = historyCheck.highestSimilarity;
          const maxSimilarity = Math.max(fileSimilarity, historySimilarity);
          
          console.log(`⚠️ Duplicate detected on attempt ${attempts}. Similarity: ${maxSimilarity.toFixed(3)}`);
          if (duplicateCheckResult.duplicates.length > 0) {
            console.log(`Similar to file: ${duplicateCheckResult.duplicates[0]?.problem?.title}`);
          }
          if (historyCheck.similarProblems.length > 0) {
            console.log(`Similar to history: ${historyCheck.similarProblems[0]?.record?.title}`);
          }
          
          if (attempts === maxRetries) {
            throw new Error(`Failed to generate unique problem after ${maxRetries} attempts. Last similarity: ${maxSimilarity.toFixed(3)}`);
          }
        }
      }
      
      // Create problem file
      const filePath = await createProblemFile(problemData);
      
      // Add to history
      const problemId = await addProblemToHistory(problemData, filePath);
      
      // Update README with today's problem and full history table
      await updateReadme();
      
      console.log(`Problem generated successfully: ${filePath}`);
      console.log(`Problem ID: ${problemId}`);
      console.log(`Final uniqueness check - Highest similarity: ${duplicateCheckResult.highestSimilarity.toFixed(3)}`);
      
      return {
        ...problemData,
        filePath,
        uniquenessInfo: {
          attempts,
          highestSimilarity: duplicateCheckResult.highestSimilarity,
          similarProblemsCount: duplicateCheckResult.similarProblems.length
        }
      };
    } catch (error) {
      console.error('Failed to generate daily problem:', error);
      throw error;
    }
  }

  /**
   * Generate problem with context about existing problems to avoid duplicates
   * @param {Object} category - Problem category
   * @param {number} attemptNumber - Current attempt number
   * @returns {Promise<Object>} Generated problem data
   */
  async generateProblemWithContext(category, attemptNumber = 1) {
    try {
      // Get existing problems in the same category for context
      const existingProblems = await getSimilarProblemsInCategory(category.id, 5);
      
      let contextPrompt = '';
      if (existingProblems.length > 0 && attemptNumber > 1) {
        contextPrompt = `\n\n为了避免重复，请注意以下已存在的题目类型：\n`;
        existingProblems.slice(0, 3).forEach((item, index) => {
          contextPrompt += `${index + 1}. ${item.problem.title}\n`;
        });
        contextPrompt += '\n请生成不同类型或不同角度的题目，避免重复。';
        
        if (attemptNumber > 2) {
          contextPrompt += `\n这是第${attemptNumber}次尝试，请确保题目有明显的差异化。`;
        }
      }
      
      // Generate problem with additional context
      return await this.aiService.generateProblem(category, contextPrompt);
      
    } catch (error) {
      console.error('Failed to generate problem with context:', error);
      // Fallback to regular generation
      return await this.aiService.generateProblem(category);
    }
  }

  /**
   * Generate problems for specific categories
   * @param {Array<string>} categoryIds - Array of category IDs
   * @returns {Promise<Array>} Array of generated problems
   */
  async generateProblemsForCategories(categoryIds) {
    const results = [];
    
    for (const categoryId of categoryIds) {
      try {
        const problem = await this.generateDailyProblem(categoryId);
        results.push(problem);
      } catch (error) {
        console.error(`Failed to generate problem for category ${categoryId}:`, error);
        results.push({ categoryId, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Generate a problem for testing purposes
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Generated problem data
   */
  async generateTestProblem(categoryId) {
    return this.generateDailyProblem(categoryId);
  }
}

export default ProblemGenerator;
