import fs from 'fs-extra';
import path from 'path';
import moment from 'moment';
import { fileURLToPath } from 'url';
import { getAllProblemFiles, readProblemFile } from './fileManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const README_PATH = path.join(PROJECT_ROOT, 'README.md');

/**
 * Update README.md with today's problem and history table
 * @returns {Promise<void>}
 */
export async function updateReadme() {
  try {
    console.log('📝 Updating README.md...');
    
    // Read current README content
    let readmeContent = await fs.readFile(README_PATH, 'utf8');
    
    // Update today's problem section
    readmeContent = await updateTodaysProblem(readmeContent);
    
    // Update history table
    readmeContent = await updateHistoryTable(readmeContent);
    
    // Write back to README
    await fs.writeFile(README_PATH, readmeContent, 'utf8');
    
    console.log('✅ README.md updated successfully');
    
  } catch (error) {
    console.error('❌ Failed to update README:', error);
    throw error;
  }
}

/**
 * Update the today's problem section in README
 * @param {string} readmeContent - Current README content
 * @returns {Promise<string>} Updated README content
 */
async function updateTodaysProblem(readmeContent) {
  const today = moment().format('YYYY-MM-DD');
  let todaysProblem = await findTodaysProblem(today);
  
  // If no problem for today, get the most recent problem
  if (!todaysProblem) {
    const allProblems = await getAllProblemsWithDetails();
    if (allProblems.length > 0) {
      // Sort by date and get the most recent
      allProblems.sort((a, b) => {
        const dateA = moment(a.date, 'YYYY-MM-DD');
        const dateB = moment(b.date, 'YYYY-MM-DD');
        return dateB.valueOf() - dateA.valueOf();
      });
      todaysProblem = allProblems[0];
    }
  }
  
  let todaysSection;
  
  if (todaysProblem) {
    const relativeLink = path.relative(PROJECT_ROOT, todaysProblem.filePath).replace(/\\/g, '/');
    const displayDate = todaysProblem.date || today;
    todaysSection = `📅 **${displayDate}** - [${todaysProblem.title}](${relativeLink})
- **分类**: ${todaysProblem.category}
- **难度**: ${todaysProblem.difficulty}`;
  } else {
    todaysSection = `暂无今日题目，请运行生成器创建新题目。`;
  }
  
  // Replace the placeholder section
  const todayRegex = /<!-- TODAY_PROBLEM_PLACEHOLDER -->([\s\S]*?)<!-- END_TODAY_PROBLEM_PLACEHOLDER -->/;
  return readmeContent.replace(todayRegex, `<!-- TODAY_PROBLEM_PLACEHOLDER -->\n${todaysSection}\n<!-- END_TODAY_PROBLEM_PLACEHOLDER -->`);
}

/**
 * Update the history table in README
 * @param {string} readmeContent - Current README content
 * @returns {Promise<string>} Updated README content
 */
async function updateHistoryTable(readmeContent) {
  console.log('📊 Scanning questions folder for all problems...');
  const allProblems = await getAllProblemsWithDetails();
  
  let tableContent;
  
  if (allProblems.length === 0) {
    tableContent = `| 日期 | 题目 | 分类 | 难度  | 链接 |
|------|------|------|------|------|
| 暂无历史题目 | - | - | - | - | - |`;
  } else {
    // Sort problems by date (newest first)
    allProblems.sort((a, b) => {
      const dateA = moment(a.date, 'YYYY-MM-DD');
      const dateB = moment(b.date, 'YYYY-MM-DD');
      return dateB.valueOf() - dateA.valueOf();
    });
    
    console.log(`📚 Found ${allProblems.length} problems total`);
    
    // Show all problems but limit display for very large numbers
    const maxDisplay = 50; // 显示最多50道题目
    const displayProblems = allProblems.slice(0, maxDisplay);
    
    tableContent = `| 日期 | 题目 | 分类 | 难度  | 链接 |
|------|------|------|------|------|`;
    
    for (const problem of displayProblems) {
      const relativeLink = path.relative(PROJECT_ROOT, problem.filePath).replace(/\\/g, '/');
      const statusIcon = problem.hasAnswer ? '✅ 已答' : '⏳ 待答';
      
      // Ensure valid date format
      const displayDate = problem.date || 'Unknown';
      const displayTitle = problem.title || 'Untitled';
      const displayCategory = problem.category || 'Unknown';
      const displayDifficulty = problem.difficulty || 'Unknown';
      
      tableContent += `\n| ${displayDate} | ${displayTitle} | ${displayCategory} | ${displayDifficulty} | [查看](${relativeLink}) |`;
    }
    
    if (allProblems.length > maxDisplay) {
      tableContent += `\n\n*显示最近${maxDisplay}道题目，共${allProblems.length}道题目*`;
    } else {
      tableContent += `\n\n*共${allProblems.length}道题目*`;
    }
  }
  
  // Replace the placeholder section
  const historyRegex = /<!-- HISTORY_TABLE_PLACEHOLDER -->([\s\S]*?)<!-- END_HISTORY_TABLE_PLACEHOLDER -->/;
  return readmeContent.replace(historyRegex, `<!-- HISTORY_TABLE_PLACEHOLDER -->\n${tableContent}\n<!-- END_HISTORY_TABLE_PLACEHOLDER -->`);
}

/**
 * Find today's problem
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object|null>} Today's problem or null
 */
async function findTodaysProblem(date) {
  try {
    const allFiles = await getAllProblemFiles();
    
    for (const filePath of allFiles) {
      try {
        const problem = await readProblemFile(filePath);
        if (problem.date === date) {
          return {
            ...problem,
            filePath
          };
        }
      } catch (error) {
        console.warn(`Failed to read problem file ${filePath}:`, error.message);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding today\'s problem:', error);
    return null;
  }
}

/**
 * Get all problems with their details
 * @returns {Promise<Array>} Array of problem details
 */
async function getAllProblemsWithDetails() {
  try {
    const allFiles = await getAllProblemFiles();
    const problems = [];
    
    for (const filePath of allFiles) {
      try {
        const problem = await readProblemFile(filePath);
        
        // Check if problem has answer
        const hasAnswer = problem.solution && !problem.solution.includes('解答将在明天自动生成');
        
        problems.push({
          date: problem.date || 'Unknown',
          title: problem.title || 'Untitled',
          category: problem.category || 'Unknown',
          difficulty: problem.difficulty || 'Unknown',
          filePath,
          hasAnswer
        });
      } catch (error) {
        console.warn(`Failed to read problem file ${filePath}:`, error.message);
      }
    }
    
    return problems;
  } catch (error) {
    console.error('Error getting all problems:', error);
    return [];
  }
}

/**
 * Generate statistics summary for README
 * @returns {Promise<string>} Statistics summary
 */
export async function generateStatsSummary() {
  try {
    const allProblems = await getAllProblemsWithDetails();
    const totalProblems = allProblems.length;
    const withAnswers = allProblems.filter(p => p.hasAnswer).length;
    const categories = [...new Set(allProblems.map(p => p.category))].length;
    
    return `📊 **统计**: 共${totalProblems}道题目，${withAnswers}道已有答案，涵盖${categories}个数学分类`;
  } catch (error) {
    console.error('Error generating stats summary:', error);
    return '';
  }
}

/**
 * Add today's problem link to README after generation
 * @param {Object} problemData - Generated problem data
 * @param {string} filePath - Problem file path
 * @returns {Promise<void>}
 */
export async function addTodaysProblemToReadme(problemData, filePath) {
  try {
    console.log('📝 Adding today\'s problem to README...');
    
    const readmeContent = await fs.readFile(README_PATH, 'utf8');
    const relativeLink = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');
    const today = moment().format('YYYY-MM-DD');
    
    const todaysSection = `📅 **${today}** - [${problemData.title}](${relativeLink})
- **分类**: ${problemData.category}
- **难度**: ${problemData.difficulty}`;
    
    // Update today's section
    const todayRegex = /<!-- TODAY_PROBLEM_PLACEHOLDER -->([\s\S]*?)<!-- END_TODAY_PROBLEM_PLACEHOLDER -->/;
    const updatedContent = readmeContent.replace(todayRegex, `<!-- TODAY_PROBLEM_PLACEHOLDER -->\n${todaysSection}\n<!-- END_TODAY_PROBLEM_PLACEHOLDER -->`);
    
    await fs.writeFile(README_PATH, updatedContent, 'utf8');
    
    console.log('✅ Today\'s problem added to README');
    
  } catch (error) {
    console.error('❌ Failed to add today\'s problem to README:', error);
  }
}
