#!/usr/bin/env node

/**
 * Mathematical Everyday - Main Entry Point
 * A daily mathematical problem generator with AI
 */

import { Command } from 'commander';
import Scheduler from './scheduler.js';
import ProblemGenerator from './services/problemGenerator.js';
import SolutionGenerator from './services/solutionGenerator.js';
import GitService from './services/gitService.js';
import { getCategoriesArray } from './utils/categories.js';
import { getProblemStatistics } from './utils/problemTracker.js';
import { generateUniquenessReport, checkForDuplicates } from './utils/duplicateChecker.js';
import { getHistoryStatistics, cleanupHistory, exportHistory } from './utils/problemHistory.js';

const program = new Command();

program
  .name('mathematical-everyday')
  .description('Daily mathematical problem generator with AI')
  .version('1.0.0');

/**
 * Start the scheduler
 */
program
  .command('start')
  .description('Start the daily problem and solution scheduler')
  .action(async () => {
    const scheduler = new Scheduler();
    await scheduler.start();
  });

/**
 * Generate a new problem
 */
program
  .command('generate-problem')
  .description('Generate a new mathematical problem')
  .option('-c, --category <category>', 'Problem category ID')
  .action(async (options) => {
    try {
      const problemGenerator = new ProblemGenerator();
      const gitService = new GitService();
      
      console.log('🎯 Generating mathematical problem...');
      
      const problemData = await problemGenerator.generateDailyProblem(options.category);
      
      console.log('✅ Problem generated successfully!');
      console.log(`📚 Title: ${problemData.title}`);
      console.log(`📂 Category: ${problemData.category}`);
      console.log(`📊 Difficulty: ${problemData.difficulty}`);
      console.log(`📄 File: ${problemData.filePath}`);
      
      // Commit to git
      const gitResult = await gitService.commitNewProblem(problemData, problemData.filePath);
      
      if (gitResult.committed) {
        console.log(`✅ Committed to git: ${gitResult.hash}`);
        if (gitResult.pushed) {
          console.log('🚀 Pushed to GitHub successfully');
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to generate problem:', error.message);
      process.exit(1);
    }
  });

/**
 * Generate solutions
 */
program
  .command('generate-solutions')
  .description('Generate solutions for problems without answers')
  .option('-f, --file <file>', 'Specific problem file path')
  .action(async (options) => {
    try {
      const solutionGenerator = new SolutionGenerator();
      const gitService = new GitService();
      
      console.log('📝 Generating solutions...');
      
      let results = [];
      
      if (options.file) {
        const solution = await solutionGenerator.generateSolutionForFile(options.file);
        results.push({ problemFile: options.file, solution, success: true });
      } else {
        results = await solutionGenerator.generatePendingSolutions();
      }
      
      console.log(`✅ Generated ${results.filter(r => r.success).length} solutions`);
      
      // Commit solutions
      for (const result of results.filter(r => r.success)) {
        const { readProblemFile } = await import('./utils/fileManager.js');
        const problemData = await readProblemFile(result.problemFile);
        const gitResult = await gitService.commitSolution(problemData, result.problemFile);
        
        if (gitResult.committed && gitResult.pushed) {
          console.log(`✅ Committed and pushed solution for: ${problemData.title}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to generate solutions:', error.message);
      process.exit(1);
    }
  });

/**
 * Show statistics
 */
program
  .command('stats')
  .description('Show problem statistics')
  .action(async () => {
    try {
      console.log('📊 Gathering statistics...');
      
      const stats = await getProblemStatistics();
      const gitService = new GitService();
      const repoStatus = await gitService.getStatus();
      
      console.log('\n📈 Problem Statistics:');
      console.log(`  Total problems: ${stats.total}`);
      console.log(`  With solutions: ${stats.withSolutions}`);
      console.log(`  Without solutions: ${stats.withoutSolutions}`);
      
      console.log('\n📚 By Category:');
      Object.entries(stats.byCategory).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
      
      console.log('\n📊 By Difficulty:');
      Object.entries(stats.byDifficulty).forEach(([difficulty, count]) => {
        console.log(`  ${difficulty}: ${count}`);
      });
      
      console.log('\n🔄 Repository Status:');
      console.log(`  Branch: ${repoStatus.branch}`);
      console.log(`  Modified files: ${repoStatus.modified}`);
      console.log(`  New files: ${repoStatus.created}`);
      
      if (repoStatus.recentCommits.length > 0) {
        console.log('\n📝 Recent Commits:');
        repoStatus.recentCommits.forEach(commit => {
          console.log(`  ${commit.hash}: ${commit.message}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to get statistics:', error.message);
      process.exit(1);
    }
  });

/**
 * List categories
 */
program
  .command('categories')
  .description('List all available problem categories')
  .action(() => {
    console.log('📚 Available Categories:\n');
    
    const categories = getCategoriesArray();
    categories.forEach(category => {
      console.log(`🏷️  ${category.id}`);
      console.log(`   Name: ${category.name} (${category.englishName})`);
      console.log(`   Description: ${category.description}`);
      console.log(`   Folder: ${category.folder}\n`);
    });
  });

/**
 * Check for duplicate problems
 */
program
  .command('check-duplicates')
  .description('Check for duplicate or similar problems')
  .option('-v, --verbose', 'Show detailed similarity information')
  .action(async (options) => {
    try {
      console.log('🔍 Analyzing problem uniqueness...');
      
      const report = await generateUniquenessReport();
      
      console.log('\n📊 Uniqueness Report:');
      console.log(`  Total problems: ${report.totalProblems}`);
      console.log(`  Uniqueness score: ${(report.uniquenessScore * 100).toFixed(1)}%`);
      console.log(`  Duplicate pairs: ${report.duplicatePairs.length}`);
      console.log(`  Similar pairs: ${report.highSimilarityPairs.length}`);
      
      if (report.duplicatePairs.length > 0) {
        console.log('\n❌ Duplicate Problems Found:');
        report.duplicatePairs.forEach((pair, index) => {
          console.log(`\n${index + 1}. Similarity: ${(pair.similarity.overall * 100).toFixed(1)}%`);
          console.log(`   Problem 1: ${pair.problem1.problem.title}`);
          console.log(`   Problem 2: ${pair.problem2.problem.title}`);
          
          if (options.verbose) {
            console.log(`   Title similarity: ${(pair.similarity.title * 100).toFixed(1)}%`);
            console.log(`   Description similarity: ${(pair.similarity.description * 100).toFixed(1)}%`);
            console.log(`   Concept similarity: ${(pair.similarity.concept * 100).toFixed(1)}%`);
          }
        });
      }
      
      if (report.highSimilarityPairs.length > 0 && options.verbose) {
        console.log('\n⚠️ Highly Similar Problems:');
        report.highSimilarityPairs.slice(0, 5).forEach((pair, index) => {
          console.log(`\n${index + 1}. Similarity: ${(pair.similarity.overall * 100).toFixed(1)}%`);
          console.log(`   Problem 1: ${pair.problem1.problem.title}`);
          console.log(`   Problem 2: ${pair.problem2.problem.title}`);
        });
      }
      
      console.log('\n📚 Category Distribution:');
      Object.entries(report.categoryDistribution).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
      
      if (report.duplicatePairs.length === 0) {
        console.log('\n✅ No duplicate problems found!');
      }
      
    } catch (error) {
      console.error('❌ Failed to check duplicates:', error.message);
      process.exit(1);
    }
  });

/**
 * History management commands
 */
const historyCommand = program
  .command('history')
  .description('Manage problem history');

historyCommand
  .command('stats')
  .description('Show problem history statistics')
  .action(async () => {
    try {
      console.log('📊 Loading history statistics...');
      
      const stats = await getHistoryStatistics();
      
      console.log('\n📈 History Statistics:');
      console.log(`  Total problems in history: ${stats.totalProblems}`);
      
      console.log('\n📚 Category Distribution:');
      Object.entries(stats.categoryDistribution)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
          console.log(`  ${category}: ${count}`);
        });
      
      console.log('\n📊 Difficulty Distribution:');
      Object.entries(stats.difficultyDistribution)
        .forEach(([difficulty, count]) => {
          console.log(`  ${difficulty}: ${count}`);
        });
      
      console.log('\n🔤 Top Keywords:');
      Object.entries(stats.keywordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([keyword, count]) => {
          console.log(`  ${keyword}: ${count}`);
        });
      
      console.log('\n📅 Creation Trend (by month):');
      Object.entries(stats.creationTrend)
        .sort()
        .forEach(([month, count]) => {
          console.log(`  ${month}: ${count}`);
        });
      
    } catch (error) {
      console.error('❌ Failed to get history statistics:', error.message);
      process.exit(1);
    }
  });

historyCommand
  .command('cleanup')
  .description('Clean up old history records')
  .option('-n, --max-records <number>', 'Maximum records to keep', '1000')
  .action(async (options) => {
    try {
      const maxRecords = parseInt(options.maxRecords);
      console.log(`🧹 Cleaning up history, keeping last ${maxRecords} records...`);
      
      const removedCount = await cleanupHistory(maxRecords);
      
      if (removedCount > 0) {
        console.log(`✅ Removed ${removedCount} old records`);
      } else {
        console.log('✅ No cleanup needed');
      }
      
    } catch (error) {
      console.error('❌ Failed to cleanup history:', error.message);
      process.exit(1);
    }
  });

historyCommand
  .command('export')
  .description('Export history to JSON file')
  .option('-o, --output <file>', 'Output file path', 'problem-history-export.json')
  .action(async (options) => {
    try {
      console.log(`📤 Exporting history to ${options.output}...`);
      
      await exportHistory(options.output);
      console.log('✅ History exported successfully');
      
    } catch (error) {
      console.error('❌ Failed to export history:', error.message);
      process.exit(1);
    }
  });

/**
 * Test commands
 */
const testCommand = program
  .command('test')
  .description('Test commands for development');

testCommand
  .command('problem')
  .description('Test problem generation')
  .option('-c, --category <category>', 'Problem category ID')
  .action(async (options) => {
    try {
      const scheduler = new Scheduler();
      await scheduler.runTestProblemGeneration();
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  });

testCommand
  .command('solution')
  .description('Test solution generation')
  .action(async () => {
    try {
      const scheduler = new Scheduler();
      await scheduler.runTestSolutionGeneration();
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
