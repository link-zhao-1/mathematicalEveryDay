import cron from 'node-cron';
import { getConfig } from './config/index.js';
import ProblemGenerator from './services/problemGenerator.js';
import SolutionGenerator from './services/solutionGenerator.js';
import GitService from './services/gitService.js';
import { problemExistsForToday } from './utils/problemTracker.js';
import { updateReadme } from './utils/readmeUpdater.js';

/**
 * Scheduler class for managing automated tasks
 */
class Scheduler {
  constructor() {
    this.config = getConfig();
    this.problemGenerator = new ProblemGenerator();
    this.solutionGenerator = new SolutionGenerator();
    this.gitService = new GitService();
    this.tasks = [];
  }

  /**
   * Start the scheduler with all configured tasks
   * @returns {Promise<void>}
   */
  async start() {
    try {
      console.log('🚀 Starting Mathematical Everyday Scheduler...');
      
      // Initialize git repository
      await this.gitService.createInitialStructure();
      
      // Schedule daily problem generation
      this.scheduleProblemGeneration();
      
      // Schedule daily solution generation
      this.scheduleSolutionGeneration();
      
      // Schedule a task to check for missed solutions
      this.scheduleMissedSolutionCheck();
      
      console.log('✅ Scheduler started successfully');
      console.log(`📅 Problem generation scheduled at: ${this.config.schedule.problemTime}`);
      console.log(`📝 Solution generation scheduled at: ${this.config.schedule.answerTime}`);
      console.log(`🌍 Timezone: ${this.config.schedule.timezone}`);
      
      // Keep the process running
      this.keepAlive();
      
    } catch (error) {
      console.error('❌ Failed to start scheduler:', error);
      process.exit(1);
    }
  }

  /**
   * Schedule daily problem generation
   */
  scheduleProblemGeneration() {
    const [hour, minute] = this.config.schedule.problemTime.split(':');
    const cronExpression = `${minute} ${hour} * * *`;
    
    const task = cron.schedule(cronExpression, async () => {
      console.log('🎯 Running daily problem generation...');
      await this.generateDailyProblem();
    }, {
      scheduled: false,
      timezone: this.config.schedule.timezone
    });
    
    task.start();
    this.tasks.push({ name: 'Daily Problem Generation', task, cron: cronExpression });
    
    console.log(`📚 Problem generation scheduled: ${cronExpression} (${this.config.schedule.timezone})`);
  }

  /**
   * Schedule daily solution generation
   */
  scheduleSolutionGeneration() {
    const [hour, minute] = this.config.schedule.answerTime.split(':');
    const cronExpression = `${minute} ${hour} * * *`;
    
    const task = cron.schedule(cronExpression, async () => {
      console.log('📝 Running daily solution generation...');
      await this.generateYesterdaysSolutions();
    }, {
      scheduled: false,
      timezone: this.config.schedule.timezone
    });
    
    task.start();
    this.tasks.push({ name: 'Daily Solution Generation', task, cron: cronExpression });
    
    console.log(`✅ Solution generation scheduled: ${cronExpression} (${this.config.schedule.timezone})`);
  }

  /**
   * Schedule a check for missed solutions (runs every 6 hours)
   */
  scheduleMissedSolutionCheck() {
    const cronExpression = '0 */6 * * *'; // Every 6 hours
    
    const task = cron.schedule(cronExpression, async () => {
      console.log('🔍 Checking for missed solutions...');
      await this.checkMissedSolutions();
    }, {
      scheduled: false,
      timezone: this.config.schedule.timezone
    });
    
    task.start();
    this.tasks.push({ name: 'Missed Solutions Check', task, cron: cronExpression });
    
    console.log(`🔍 Missed solutions check scheduled: ${cronExpression} (${this.config.schedule.timezone})`);
  }

  /**
   * Generate daily problem
   * @returns {Promise<void>}
   */
  async generateDailyProblem() {
    try {
      // Check if problem already exists for today
      const existsToday = await problemExistsForToday();
      if (existsToday) {
        console.log('📚 Problem already exists for today, skipping generation');
        return;
      }

      console.log('🎲 Generating new daily problem...');
      const problemData = await this.problemGenerator.generateDailyProblem();
      
      console.log(`✅ Generated problem: ${problemData.title}`);
      console.log(`📂 Category: ${problemData.category}`);
      console.log(`📊 Difficulty: ${problemData.difficulty}`);
      
      // Update README
      try {
        await updateReadme();
        console.log('📝 README updated with new problem');
      } catch (error) {
        console.error('⚠️ Failed to update README:', error.message);
      }
      
      // Commit to git (including README changes)
      const gitResult = await this.gitService.commitNewProblem(problemData, problemData.filePath);
      
      if (gitResult.committed) {
        console.log(`✅ Problem committed to git: ${gitResult.hash}`);
        
        if (gitResult.pushed) {
          console.log('🚀 Problem pushed to GitHub successfully');
        } else {
          console.log('⚠️ Problem committed but not pushed to GitHub');
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to generate daily problem:', error);
      
      // Send notification or log to monitoring system
      this.handleError('Daily Problem Generation', error);
    }
  }

  /**
   * Generate solutions for yesterday's problems
   * @returns {Promise<void>}
   */
  async generateYesterdaysSolutions() {
    try {
      console.log('📝 Generating solutions for yesterday\'s problems...');
      const results = await this.solutionGenerator.generateYesterdaysSolutions();
      
      if (results.length === 0) {
        console.log('ℹ️ No problems from yesterday found without solutions');
        return;
      }

      console.log(`✅ Generated solutions for ${results.length} problems`);
      
      // Commit each solution to git
      for (const result of results) {
        if (result.success) {
          try {
            const problemData = await import('./utils/fileManager.js').then(m => m.readProblemFile(result.problemFile));
            const gitResult = await this.gitService.commitSolution(problemData, result.problemFile);
            
            if (gitResult.committed) {
              console.log(`✅ Solution committed: ${gitResult.hash}`);
              
              if (gitResult.pushed) {
                console.log('🚀 Solution pushed to GitHub successfully');
              }
            }
            
            // Update README to reflect answer status
            try {
              await updateReadme();
              console.log('📝 README updated with solution status');
            } catch (error) {
              console.error('⚠️ Failed to update README:', error.message);
            }
          } catch (error) {
            console.error(`❌ Failed to commit solution for ${result.problemFile}:`, error);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to generate yesterday\'s solutions:', error);
      this.handleError('Yesterday Solutions Generation', error);
    }
  }

  /**
   * Check for missed solutions and generate them
   * @returns {Promise<void>}
   */
  async checkMissedSolutions() {
    try {
      console.log('🔍 Checking for problems without solutions...');
      const results = await this.solutionGenerator.generatePendingSolutions();
      
      if (results.length === 0) {
        console.log('✅ All problems have solutions');
        return;
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`📝 Generated ${successCount} missed solutions out of ${results.length} problems`);
      
      // Commit successful solutions
      for (const result of results.filter(r => r.success)) {
        try {
          const problemData = await import('./utils/fileManager.js').then(m => m.readProblemFile(result.problemFile));
          const gitResult = await this.gitService.commitSolution(problemData, result.problemFile);
          
          if (gitResult.committed && gitResult.pushed) {
            console.log(`✅ Missed solution committed and pushed: ${problemData.title}`);
          }
        } catch (error) {
          console.error(`❌ Failed to commit missed solution for ${result.problemFile}:`, error);
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to check missed solutions:', error);
      this.handleError('Missed Solutions Check', error);
    }
  }

  /**
   * Handle errors by logging and potentially sending notifications
   * @param {string} taskName - Name of the task that failed
   * @param {Error} error - The error object
   */
  handleError(taskName, error) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      task: taskName,
      error: error.message,
      stack: error.stack
    };
    
    console.error('📋 Error Details:', JSON.stringify(errorLog, null, 2));
    
    // Here you could add notification services like:
    // - Send email
    // - Post to Slack/Discord
    // - Send to monitoring service
    // - Write to error log file
  }

  /**
   * Stop all scheduled tasks
   */
  stop() {
    console.log('🛑 Stopping scheduler...');
    
    this.tasks.forEach(({ name, task }) => {
      task.destroy();
      console.log(`✅ Stopped task: ${name}`);
    });
    
    this.tasks = [];
    console.log('✅ Scheduler stopped');
  }

  /**
   * Get status of all scheduled tasks
   * @returns {Array} Array of task status objects
   */
  getTaskStatus() {
    return this.tasks.map(({ name, cron, task }) => ({
      name,
      cron,
      running: task.getStatus() === 'scheduled'
    }));
  }

  /**
   * Keep the process alive
   */
  keepAlive() {
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT, stopping scheduler...');
      this.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM, stopping scheduler...');
      this.stop();
      process.exit(0);
    });

    // Keep process alive
    setInterval(() => {
      const now = new Date();
      console.log(`💓 Scheduler heartbeat: ${now.toISOString()}`);
    }, 60000 * 60); // Every hour
  }

  /**
   * Run a one-time problem generation for testing
   * @returns {Promise<void>}
   */
  async runTestProblemGeneration() {
    console.log('🧪 Running test problem generation...');
    await this.generateDailyProblem();
  }

  /**
   * Run a one-time solution generation for testing
   * @returns {Promise<void>}
   */
  async runTestSolutionGeneration() {
    console.log('🧪 Running test solution generation...');
    await this.generateYesterdaysSolutions();
  }
}

// If this file is run directly, start the scheduler
if (import.meta.url === `file://${process.argv[1]}`) {
  const scheduler = new Scheduler();
  scheduler.start().catch(error => {
    console.error('Failed to start scheduler:', error);
    process.exit(1);
  });
}

export default Scheduler;
