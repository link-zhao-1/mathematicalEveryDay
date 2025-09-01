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
