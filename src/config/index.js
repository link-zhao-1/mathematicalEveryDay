import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Application configuration object
 * @typedef {Object} Config
 * @property {Object} ai - AI model configuration
 * @property {Object} github - GitHub configuration
 * @property {Object} schedule - Schedule configuration
 */

/**
 * Get the application configuration
 * @returns {Config} The configuration object
 */
export const getConfig = () => {
  const aiModel = process.env.AI_MODEL || 'deepseek';
  
  return {
    ai: {
      model: aiModel,
      deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
        model: 'deepseek-chat'
        // model: 'deepseek-reasoner'
      },
      doubao: {
        apiKey: process.env.DOUBAO_API_KEY,
        baseURL: process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
        model: 'doubao-pro-32k'
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://api.openai.com/v1',
        model: 'gpt-4'
      }
    },
    github: {
      token: process.env.USER_TOKEN,
      username: process.env.USER_USERNAME,
      repo: process.env.USER_REPO || 'mathematicalEveryDay'
    },
    schedule: {
      problemTime: process.env.GENERATE_PROBLEM_TIME || '09:00',
      answerTime: process.env.GENERATE_ANSWER_TIME || '09:00',
      timezone: process.env.TIMEZONE || 'Asia/Shanghai'
    }
  };
};

export default getConfig();
