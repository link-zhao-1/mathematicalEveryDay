import AIService from './aiService.js';
import { getRandomCategory, getCategoriesArray } from '../utils/categories.js';
import { createProblemFile } from '../utils/fileManager.js';

/**
 * Problem Generator Service
 * Handles the generation of mathematical problems
 */
class ProblemGenerator {
  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Generate a daily mathematical problem
   * @param {string} categoryId - Optional specific category ID
   * @returns {Promise<Object>} Generated problem data
   */
  async generateDailyProblem(categoryId = null) {
    try {
      // Select category
      const category = categoryId 
        ? getCategoriesArray().find(cat => cat.id === categoryId)
        : getRandomCategory();

      if (!category) {
        throw new Error(`Category not found: ${categoryId}`);
      }

      console.log(`Generating problem for category: ${category.name}`);

      // Generate problem using AI
      const problemData = await this.aiService.generateProblem(category);
      
      // Create problem file
      const filePath = await createProblemFile(problemData);
      
      console.log(`Problem generated successfully: ${filePath}`);
      
      return {
        ...problemData,
        filePath
      };
    } catch (error) {
      console.error('Failed to generate daily problem:', error);
      throw error;
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
