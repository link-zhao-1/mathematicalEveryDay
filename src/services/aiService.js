import axios from 'axios';
import { getConfig } from '../config/index.js';

/**
 * AI Service for generating mathematical problems and solutions
 */
class AIService {
  constructor() {
    this.config = getConfig();
  }

  /**
   * Get the current AI model configuration
   * @returns {Object} The AI model configuration
   */
  getCurrentModelConfig() {
    const modelName = this.config.ai.model;
    return this.config.ai[modelName];
  }

  /**
   * Make a request to the AI API
   * @param {string} prompt - The prompt to send to the AI
   * @param {number} maxTokens - Maximum tokens for the response
   * @returns {Promise<string>} The AI response
   */
  async makeRequest(prompt, maxTokens = 2000) {
    const modelConfig = this.getCurrentModelConfig();
    
    if (!modelConfig.apiKey) {
      throw new Error(`API key not configured for ${this.config.ai.model}`);
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${modelConfig.apiKey}`
    };

    const data = {
      model: modelConfig.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    };

    try {
      const response = await axios.post(
        `${modelConfig.baseURL}/chat/completions`,
        data,
        { headers }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI API request failed:', error.response?.data || error.message);
      throw new Error(`AI API request failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate a mathematical problem for a specific category
   * @param {Object} category - The category object
   * @returns {Promise<Object>} Object containing problem details
   */
  async generateProblem(category) {
    const prompt = `请生成一道${category.name}(${category.englishName})的高等数学题目。

要求：
1. 题目应该具有一定的挑战性，适合大学数学水平
2. 题目应该参考历年考研数学真题的风格和难度
3. 请提供题目的完整描述，包含所有必要的条件
4. 题目应该有明确的解答方向
5. 如果涉及图形，请用文字详细描述

请按以下JSON格式返回：
{
  "title": "题目标题",
  "description": "题目详细描述",
  "category": "${category.name}",
  "difficulty": "difficulty level (简单/中等/困难)",
  "tags": ["相关标签"],
  "hints": ["解题提示1", "解题提示2"]
}

注意：请确保返回的是有效的JSON格式。`;

    try {
      const response = await this.makeRequest(prompt);
      
      // Try to extract JSON from the response
      let jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
      let jsonString = jsonMatch ? jsonMatch[1] : response;
      
      // Clean up the JSON string
      jsonString = jsonString.trim();
      if (!jsonString.startsWith('{')) {
        // If it doesn't start with {, try to find the JSON part
        const startIndex = jsonString.indexOf('{');
        const endIndex = jsonString.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
          jsonString = jsonString.substring(startIndex, endIndex + 1);
        }
      }

      const problemData = JSON.parse(jsonString);
      
      return {
        ...problemData,
        categoryId: category.id,
        categoryFolder: category.folder,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Raw response:', response);
      throw new Error('Failed to generate or parse problem from AI response');
    }
  }

  /**
   * Generate a solution for a mathematical problem
   * @param {Object} problemData - The problem data object
   * @returns {Promise<Object>} Object containing solution details
   */
  async generateSolution(problemData) {
    const prompt = `请为以下数学题目提供详细的解答：

题目：${problemData.title}
描述：${problemData.description}
分类：${problemData.category}
难度：${problemData.difficulty}

要求：
1. 提供完整的解题步骤，每一步都要有详细说明
2. 解题过程要有逻辑性，便于理解
3. 如果有多种解法，可以提供主要的解法
4. 最终答案要明确标出
5. 如果涉及数学公式，请使用LaTeX格式

请按以下JSON格式返回：
{
  "solution_steps": [
    {
      "step": 1,
      "title": "步骤标题",
      "content": "步骤详细内容",
      "formula": "相关公式(LaTeX格式，可选)"
    }
  ],
  "final_answer": "最终答案",
  "alternative_methods": ["其他解法简述"],
  "key_concepts": ["涉及的关键概念"],
  "common_mistakes": ["常见错误提醒"]
}

注意：请确保返回的是有效的JSON格式。`;

    try {
      const response = await this.makeRequest(prompt, 3000);
      
      // Try to extract JSON from the response
      let jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
      let jsonString = jsonMatch ? jsonMatch[1] : response;
      
      // Clean up the JSON string
      jsonString = jsonString.trim();
      if (!jsonString.startsWith('{')) {
        const startIndex = jsonString.indexOf('{');
        const endIndex = jsonString.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
          jsonString = jsonString.substring(startIndex, endIndex + 1);
        }
      }

      const solutionData = JSON.parse(jsonString);
      
      return {
        ...solutionData,
        generatedAt: new Date().toISOString(),
        problemId: problemData.title
      };
    } catch (error) {
      console.error('Failed to parse AI solution response:', error);
      throw new Error('Failed to generate or parse solution from AI response');
    }
  }
}

export default AIService;
