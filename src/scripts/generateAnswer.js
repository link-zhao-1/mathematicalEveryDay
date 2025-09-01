#!/usr/bin/env node

/**
 * Script to generate solutions for problems
 * Usage: npm run generate-answer [problem-file-path]
 */

import SolutionGenerator from '../services/solutionGenerator.js';
import GitService from '../services/gitService.js';
import { readProblemFile } from '../utils/fileManager.js';

async function main() {
  try {
    const args = process.argv.slice(2);
    const problemFilePath = args[0];
    
    console.log('📝 Generating mathematical solutions...');
    
    const solutionGenerator = new SolutionGenerator();
    const gitService = new GitService();
    
    let results = [];
    
    if (problemFilePath) {
      // Generate solution for specific file
      console.log(`📄 Generating solution for: ${problemFilePath}`);
      
      const solution = await solutionGenerator.generateSolutionForFile(problemFilePath);
      const problemData = await readProblemFile(problemFilePath);
      
      results.push({
        problemFile: problemFilePath,
        solution,
        success: true,
        problemData
      });
      
      console.log(`✅ Solution generated for: ${problemData.title}`);
      
    } else {
      // Generate solutions for all pending problems
      console.log('🔍 Finding problems without solutions...');
      
      const pendingResults = await solutionGenerator.generatePendingSolutions();
      
      if (pendingResults.length === 0) {
        console.log('ℹ️ No problems found without solutions');
        return;
      }
      
      // Read problem data for successful results
      for (const result of pendingResults) {
        if (result.success) {
          try {
            const problemData = await readProblemFile(result.problemFile);
            result.problemData = problemData;
            console.log(`✅ Solution generated for: ${problemData.title}`);
          } catch (error) {
            console.error(`❌ Failed to read problem data for ${result.problemFile}:`, error.message);
            result.success = false;
            result.error = error.message;
          }
        }
      }
      
      results = pendingResults;
    }
    
    // Commit successful solutions to git
    const successfulResults = results.filter(r => r.success);
    
    if (successfulResults.length > 0) {
      console.log(`📝 Committing ${successfulResults.length} solutions to git...`);
      
      for (const result of successfulResults) {
        try {
          const gitResult = await gitService.commitSolution(result.problemData, result.problemFile);
          
          if (gitResult.committed) {
            console.log(`✅ Committed solution for: ${result.problemData.title} (${gitResult.hash})`);
            
            if (gitResult.pushed) {
              console.log('🚀 Pushed to GitHub successfully');
            } else {
              console.log('⚠️ Committed locally but not pushed to GitHub');
            }
          } else {
            console.log(`ℹ️ No changes to commit for: ${result.problemData.title}`);
          }
          
        } catch (error) {
          console.error(`❌ Failed to commit solution for ${result.problemFile}:`, error.message);
        }
      }
    }
    
    // Summary
    const totalProblems = results.length;
    const successfulSolutions = results.filter(r => r.success).length;
    const failedSolutions = totalProblems - successfulSolutions;
    
    console.log('\n📊 Summary:');
    console.log(`  Total problems processed: ${totalProblems}`);
    console.log(`  Successful solutions: ${successfulSolutions}`);
    console.log(`  Failed solutions: ${failedSolutions}`);
    
    if (failedSolutions > 0) {
      console.log('\n❌ Failed problems:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.problemFile}: ${result.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to generate solutions:', error.message);
    process.exit(1);
  }
}

main();
