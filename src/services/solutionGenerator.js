import AIService from './aiService.js';
import { readProblemFile, updateProblemWithSolution } from '../utils/fileManager.js';
import { findProblemsWithoutSolutions } from '../utils/problemTracker.js';

/**
 * Solution Generator Service
 * Handles the generation of solutions for mathematical problems
 */
class SolutionGenerator {
  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Generate solution for a specific problem file
   * @param {string} problemFilePath - Path to the problem file
   * @returns {Promise<Object>} Generated solution data
   */
  async generateSolutionForFile(problemFilePath) {
    try {
      // Read problem data from file
      const problemData = await readProblemFile(problemFilePath);
      
      if (problemData.solution) {
        console.log(`Solution already exists for: ${problemFilePath}`);
        return problemData.solution;
      }

      console.log(`Generating solution for: ${problemData.title}`);

      // Generate solution using AI
      const solutionData = await this.aiService.generateSolution(problemData);
      
      // Update the problem file with solution
      await updateProblemWithSolution(problemFilePath, solutionData);
      
      console.log(`Solution generated successfully for: ${problemData.title}`);
      
      return solutionData;
    } catch (error) {
      console.error(`Failed to generate solution for ${problemFilePath}:`, error);
      throw error;
    }
  }

  /**
   * Generate solutions for all problems without solutions
   * @returns {Promise<Array>} Array of generated solutions
   */
  async generatePendingSolutions() {
    try {
      const problemsWithoutSolutions = await findProblemsWithoutSolutions();
      
      if (problemsWithoutSolutions.length === 0) {
        console.log('No problems found without solutions');
        return [];
      }

      console.log(`Found ${problemsWithoutSolutions.length} problems without solutions`);
      
      const results = [];
      
      for (const problemFile of problemsWithoutSolutions) {
        try {
          const solution = await this.generateSolutionForFile(problemFile);
          results.push({
            problemFile,
            solution,
            success: true
          });
        } catch (error) {
          console.error(`Failed to generate solution for ${problemFile}:`, error);
          results.push({
            problemFile,
            error: error.message,
            success: false
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Failed to generate pending solutions:', error);
      throw error;
    }
  }

  /**
   * Generate solutions for problems from yesterday
   * @returns {Promise<Array>} Array of generated solutions
   */
  async generateYesterdaysSolutions() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayProblems = await findProblemsWithoutSolutions(yesterday);
      
      if (yesterdayProblems.length === 0) {
        console.log('No problems from yesterday found without solutions');
        return [];
      }

      console.log(`Generating solutions for ${yesterdayProblems.length} problems from yesterday`);
      
      const results = [];
      
      for (const problemFile of yesterdayProblems) {
        try {
          const solution = await this.generateSolutionForFile(problemFile);
          results.push({
            problemFile,
            solution,
            success: true
          });
        } catch (error) {
          console.error(`Failed to generate solution for ${problemFile}:`, error);
          results.push({
            problemFile,
            error: error.message,
            success: false
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Failed to generate yesterday\'s solutions:', error);
      throw error;
    }
  }

  /**
   * Regenerate solution for a specific problem
   * @param {string} problemFilePath - Path to the problem file
   * @returns {Promise<Object>} Generated solution data
   */
  async regenerateSolution(problemFilePath) {
    try {
      // Read problem data from file
      const problemData = await readProblemFile(problemFilePath);
      
      console.log(`Regenerating solution for: ${problemData.title}`);

      // Generate new solution using AI
      const solutionData = await this.aiService.generateSolution(problemData);
      
      // Update the problem file with new solution
      await updateProblemWithSolution(problemFilePath, solutionData);
      
      console.log(`Solution regenerated successfully for: ${problemData.title}`);
      
      return solutionData;
    } catch (error) {
      console.error(`Failed to regenerate solution for ${problemFilePath}:`, error);
      throw error;
    }
  }
}

export default SolutionGenerator;
