import fs from 'fs-extra';
import path from 'path';
import moment from 'moment';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

/**
 * Create a problem file with markdown content
 * @param {Object} problemData - The problem data object
 * @returns {Promise<string>} The file path of the created problem
 */
export async function createProblemFile(problemData) {
  const date = moment().format('YYYY-MM-DD');
  const categoryFolder = problemData.categoryFolder;
  
  // Create directory structure
  const problemDir = path.join(PROJECT_ROOT, 'questions', categoryFolder);
  await fs.ensureDir(problemDir);
  
  // Generate filename
  const fileName = `${date}-problem.md`;
  const filePath = path.join(problemDir, fileName);
  
  // Generate markdown content
  const markdownContent = generateProblemMarkdown(problemData, date);
  
  // Write file
  await fs.writeFile(filePath, markdownContent, 'utf8');
  
  return filePath;
}

/**
 * Generate markdown content for a problem
 * @param {Object} problemData - The problem data object
 * @param {string} date - The date string
 * @returns {string} The markdown content
 */
function generateProblemMarkdown(problemData, date) {
  const { title, description, category, difficulty, tags, hints } = problemData;
  
  let markdown = `# ${title}\n\n`;
  
  // Metadata section
  markdown += `## 📊 题目信息\n\n`;
  markdown += `- **日期**: ${date}\n`;
  markdown += `- **分类**: ${category}\n`;
  markdown += `- **难度**: ${difficulty}\n`;
  
  if (tags && tags.length > 0) {
    markdown += `- **标签**: ${tags.map(tag => `\`${tag}\``).join(', ')}\n`;
  }
  
  markdown += `\n---\n\n`;
  
  // Problem description
  markdown += `## 📝 题目描述\n\n`;
  markdown += `${description}\n\n`;
  
  // Hints section
  if (hints && hints.length > 0) {
    markdown += `## 💡 解题提示\n\n`;
    hints.forEach((hint, index) => {
      markdown += `${index + 1}. ${hint}\n`;
    });
    markdown += `\n`;
  }
  
  // Solution placeholder
  markdown += `## 📚 解答\n\n`;
  markdown += `> 解答将在明天自动生成\n\n`;
  
  // Footer
  markdown += `---\n\n`;
  markdown += `*本题目由AI自动生成，如有错误请提issue*\n`;
  
  return markdown;
}

/**
 * Read problem data from a markdown file
 * @param {string} filePath - Path to the problem file
 * @returns {Promise<Object>} The problem data object
 */
export async function readProblemFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Parse the markdown content to extract problem data
    const problemData = parseProblemMarkdown(content);
    problemData.filePath = filePath;
    
    return problemData;
  } catch (error) {
    throw new Error(`Failed to read problem file ${filePath}: ${error.message}`);
  }
}

/**
 * Parse markdown content to extract problem data
 * @param {string} content - The markdown content
 * @returns {Object} The parsed problem data
 */
function parseProblemMarkdown(content) {
  const lines = content.split('\n');
  const problemData = {};
  
  // Extract title (first # header)
  const titleMatch = content.match(/^# (.+)/m);
  problemData.title = titleMatch ? titleMatch[1] : 'Unknown Title';
  
  // Extract metadata
  const dateMatch = content.match(/\*\*日期\*\*: (.+)/);
  const categoryMatch = content.match(/\*\*分类\*\*: (.+)/);
  const difficultyMatch = content.match(/\*\*难度\*\*: (.+)/);
  const tagsMatch = content.match(/\*\*标签\*\*: (.+)/);
  
  problemData.date = dateMatch ? dateMatch[1] : null;
  problemData.category = categoryMatch ? categoryMatch[1] : null;
  problemData.difficulty = difficultyMatch ? difficultyMatch[1] : null;
  problemData.tags = tagsMatch ? tagsMatch[1].split(', ').map(tag => tag.replace(/`/g, '')) : [];
  
  // Extract description
  const descMatch = content.match(/## 📝 题目描述\n\n([\s\S]*?)\n\n## /);
  problemData.description = descMatch ? descMatch[1].trim() : '';
  
  // Check if solution exists
  const solutionMatch = content.match(/## 📚 解答\n\n([\s\S]*?)(?=\n---|\n$|$)/);
  if (solutionMatch && !solutionMatch[1].includes('解答将在明天自动生成')) {
    problemData.solution = solutionMatch[1].trim();
  }
  
  return problemData;
}

/**
 * Update a problem file with solution
 * @param {string} filePath - Path to the problem file
 * @param {Object} solutionData - The solution data object
 * @returns {Promise<void>}
 */
export async function updateProblemWithSolution(filePath, solutionData) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Generate solution markdown
    const solutionMarkdown = generateSolutionMarkdown(solutionData);
    
    // Replace the solution placeholder
    const updatedContent = content.replace(
      /## 📚 解答\n\n> 解答将在明天自动生成/,
      `## 📚 解答\n\n${solutionMarkdown}`
    );
    
    // Write the updated content
    await fs.writeFile(filePath, updatedContent, 'utf8');
  } catch (error) {
    throw new Error(`Failed to update problem file with solution: ${error.message}`);
  }
}

/**
 * Generate markdown content for solution
 * @param {Object} solutionData - The solution data object
 * @returns {string} The solution markdown content
 */
function generateSolutionMarkdown(solutionData) {
  const { solution_steps, final_answer, alternative_methods, key_concepts, common_mistakes } = solutionData;
  
  let markdown = '';
  
  // Solution steps
  if (solution_steps && solution_steps.length > 0) {
    markdown += `### 解题步骤\n\n`;
    solution_steps.forEach((step) => {
      markdown += `**${step.step}. ${step.title}**\n\n`;
      markdown += `${step.content}\n\n`;
      if (step.formula) {
        markdown += `公式：`${step.formula}`\n\n`;
      }
    });
  }
  
  // Final answer
  if (final_answer) {
    markdown += `### 最终答案\n\n`;
    markdown += `**答案**: ${final_answer}\n\n`;
  }
  
  // Alternative methods
  if (alternative_methods && alternative_methods.length > 0) {
    markdown += `### 其他解法\n\n`;
    alternative_methods.forEach((method, index) => {
      markdown += `${index + 1}. ${method}\n`;
    });
    markdown += `\n`;
  }
  
  // Key concepts
  if (key_concepts && key_concepts.length > 0) {
    markdown += `### 关键概念\n\n`;
    key_concepts.forEach((concept) => {
      markdown += `- ${concept}\n`;
    });
    markdown += `\n`;
  }
  
  // Common mistakes
  if (common_mistakes && common_mistakes.length > 0) {
    markdown += `### 常见错误\n\n`;
    common_mistakes.forEach((mistake) => {
      markdown += `⚠️ ${mistake}\n\n`;
    });
  }
  
  return markdown.trim();
}

/**
 * Get all problem files
 * @returns {Promise<Array>} Array of problem file paths
 */
export async function getAllProblemFiles() {
  const problemsDir = path.join(PROJECT_ROOT, 'questions');
  
  if (!await fs.pathExists(problemsDir)) {
    return [];
  }
  
  const problemFiles = [];
  const categories = await fs.readdir(problemsDir);
  
  for (const category of categories) {
    const categoryPath = path.join(problemsDir, category);
    const stat = await fs.stat(categoryPath);
    
    if (stat.isDirectory()) {
      const files = await fs.readdir(categoryPath);
      for (const file of files) {
        if (file.endsWith('.md')) {
          problemFiles.push(path.join(categoryPath, file));
        }
      }
    }
  }
  
  return problemFiles;
}
