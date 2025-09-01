#!/usr/bin/env node

/**
 * Script to generate a new mathematical problem
 * Usage: npm run generate-problem [category-id]
 */

import ProblemGenerator from '../services/problemGenerator.js';
import GitService from '../services/gitService.js';
import { getCategoriesArray } from '../utils/categories.js';

async function main() {
  try {
    const args = process.argv.slice(2);
    const categoryId = args[0];
    
    // Validate category if provided
    if (categoryId) {
      const categories = getCategoriesArray();
      const validCategory = categories.find(cat => cat.id === categoryId);
      
      if (!validCategory) {
        console.error(`❌ Invalid category: ${categoryId}`);
        console.log('Available categories:');
        categories.forEach(cat => {
          console.log(`  - ${cat.id}: ${cat.name} (${cat.englishName})`);
        });
        process.exit(1);
      }
    }

    console.log('🎯 Generating mathematical problem...');
    
    const problemGenerator = new ProblemGenerator();
    const gitService = new GitService();
    
    // Generate problem
    const problemData = await problemGenerator.generateDailyProblem(categoryId);
    
    console.log('✅ Problem generated successfully!');
    console.log(`📚 Title: ${problemData.title}`);
    console.log(`📂 Category: ${problemData.category}`);
    console.log(`📊 Difficulty: ${problemData.difficulty}`);
    console.log(`📄 File: ${problemData.filePath}`);
    
    // Commit to git
    console.log('📝 Committing to git...');
    const gitResult = await gitService.commitNewProblem(problemData, problemData.filePath);
    
    if (gitResult.committed) {
      console.log(`✅ Committed to git: ${gitResult.hash}`);
      
      if (gitResult.pushed) {
        console.log('🚀 Pushed to GitHub successfully');
      } else {
        console.log('⚠️ Committed locally but not pushed to GitHub');
        console.log('  Make sure your GitHub configuration is correct in .env');
      }
    } else {
      console.log('ℹ️ No changes to commit');
    }
    
  } catch (error) {
    console.error('❌ Failed to generate problem:', error.message);
    process.exit(1);
  }
}

main();
