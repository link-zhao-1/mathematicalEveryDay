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
   * @param {string} additionalContext - Additional context to avoid duplicates
   * @returns {Promise<Object>} Object containing problem details
   */
  async generateProblem(category, additionalContext = '') {
    const prompt = `请生成一道${category.name}(${category.englishName})的高等数学题目。

要求：
1. 题目应该具有一定的挑战性，适合大学数学水平
2. 题目应该参考历年考研数学真题的风格和难度
3. 请提供题目的完整描述，包含所有必要的条件
4. 题目应该有明确的解答方向
5. 如果涉及图形，请用文字详细描述
6. 【重要】所有数学公式必须使用标准LaTeX格式：
   - 行内公式：用$包围，如 $f(x) = x^2$
   - 块级公式：用$$包围，如 $$\\int_{0}^{1} x^2 dx$$
   - 禁止使用文本描述数学式，如：x^2 + y^2, ∫∫∫等
   - 所有积分、求和、分数、根号等必须用LaTeX

请严格按照以下JSON格式返回，不要添加任何其他文字：

{
  "title": "题目标题（可包含简单的LaTeX公式）",
  "description": "题目详细描述（可包含LaTeX公式，如：$f(x) = x^2$）",
  "category": "${category.name}",
  "difficulty": "简单",
  "tags": ["标签1", "标签2"],
  "hints": ["提示1", "提示2"]
}

${additionalContext}

重要说明：
1. 只返回JSON对象，不要包含任何markdown代码块或其他文字
2. 所有字符串值用英文双引号包围
3. difficulty只能是：简单、中等、困难 之一
4. 【强制要求】所有数学表达式必须使用LaTeX格式：
   - 正确：用$包围，如 $f(x) = x^2 + 2x + 1$
   - 错误：直接写 f(x) = x^2 + 2x + 1
   - 正确：用$$包围，如 $$\\int_{0}^{1} x^2 dx$$
   - 错误：用文本 ∫[0,1] x^2 dx
5. 确保JSON语法完全正确，LaTeX中的反斜杠需要转义为双反斜杠
6. 示例正确格式："计算三重积分 $$\\iiint_{\\Omega} (x^2 + y^2) dV$$"`;

    try {
      const response = await this.makeRequest(prompt);
      
      console.log('AI Raw Response:', response); // Debug log
      
      // Try to extract JSON from the response
      let jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
      let jsonString = jsonMatch ? jsonMatch[1] : response;
      
      // Clean up the JSON string
      jsonString = jsonString.trim();
      
      // Find JSON boundaries more carefully
      const startIndex = jsonString.indexOf('{');
      const endIndex = jsonString.lastIndexOf('}');
      
      if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
        throw new Error('No valid JSON object found in AI response');
      }
      
      jsonString = jsonString.substring(startIndex, endIndex + 1);
      
      // Additional cleanup for common issues
      jsonString = jsonString
        .replace(/，/g, ',')  // Replace Chinese comma
        .replace(/：/g, ':')  // Replace Chinese colon
        .replace(/"/g, '"')   // Replace Chinese quotes
        .replace(/"/g, '"')   // Replace Chinese quotes
        .replace(/\n/g, ' ')  // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      console.log('Cleaned JSON string:', jsonString); // Debug log

      const problemData = JSON.parse(jsonString);
      
      // Validate required fields
      if (!problemData.title || !problemData.description) {
        throw new Error('Missing required fields in AI response');
      }
      
      return {
        ...problemData,
        categoryId: category.id,
        categoryFolder: category.folder,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Raw response:', response);
      
      // Fallback: Create a basic problem structure
      if (error.message.includes('JSON')) {
        console.log('Attempting to create fallback problem...');
        return {
          title: `${category.name}基础练习题`,
          description: `这是一道${category.name}的基础练习题。请根据题目要求进行计算和分析。`,
          category: category.name,
          difficulty: "中等",
          tags: [category.name],
          hints: ["仔细阅读题目要求", "运用相关数学知识"],
          categoryId: category.id,
          categoryFolder: category.folder,
          generatedAt: new Date().toISOString(),
          isFallback: true
        };
      }
      
      throw new Error(`Failed to generate problem: ${error.message}`);
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
5. 【强制要求】所有数学公式必须使用标准LaTeX格式：
   - 行内公式：用$包围，如 $f'(x) = 2x$
   - 块级公式：用$$包围，如 $$\\int_{0}^{1} x^2 dx = \\frac{1}{3}$$
   - 禁止使用文本描述：如 x^2, ∫[0,1], f'(x)等
   - 所有计算过程、公式推导都必须用LaTeX

请严格按照以下JSON格式返回，不要添加任何其他文字：

{
  "solution_steps": [
    {
      "step": 1,
      "title": "步骤标题",
      "content": "步骤详细内容（必须使用LaTeX格式表示所有数学表达式）",
      "formula": "相关公式（可选，使用LaTeX格式，如：\\int_{0}^{1} x^2 dx = \\frac{1}{3}）"
    }
  ],
  "final_answer": "最终答案",
  "alternative_methods": ["其他解法1", "其他解法2"],
  "key_concepts": ["概念1", "概念2"],
  "common_mistakes": ["错误1", "错误2"]
}

重要说明：
1. 只返回JSON对象，不要包含markdown代码块
2. 所有字符串值用英文双引号包围
3. 【严格要求】所有数学表达式必须使用LaTeX格式：
   - 正确：用$包围，如 $f'(x) = 2x + 2$
   - 错误：直接写 f'(x) = 2x + 2
   - 正确：用$$包围，如 $$\\int_{0}^{1} x^2 dx = \\frac{1}{3}$$
   - 错误：用文本 ∫[0,1] x^2 dx = 1/3
4. 确保JSON语法完全正确，LaTeX中的反斜杠需要转义为双反斜杠
5. 数组中每个元素都要用双引号包围
6. 示例："先求导数 $f'(x) = 3x^2 - 6x + 2$，然后令其等于零。"`;

    try {
      const response = await this.makeRequest(prompt, 3000);
      
      console.log('AI Solution Raw Response:', response); // Debug log
      
      // Try to extract JSON from the response
      let jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
      let jsonString = jsonMatch ? jsonMatch[1] : response;
      
      // Clean up the JSON string
      jsonString = jsonString.trim();
      
      // Find JSON boundaries more carefully
      const startIndex = jsonString.indexOf('{');
      const endIndex = jsonString.lastIndexOf('}');
      
      if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
        throw new Error('No valid JSON object found in AI solution response');
      }
      
      jsonString = jsonString.substring(startIndex, endIndex + 1);
      
      // Additional cleanup for common issues
      jsonString = jsonString
        .replace(/，/g, ',')  // Replace Chinese comma
        .replace(/：/g, ':')  // Replace Chinese colon
        .replace(/"/g, '"')   // Replace Chinese quotes
        .replace(/"/g, '"')   // Replace Chinese quotes
        .replace(/\n/g, ' ')  // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      console.log('Cleaned Solution JSON string:', jsonString); // Debug log

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