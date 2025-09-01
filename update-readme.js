import { updateReadme } from './src/utils/readmeUpdater.js';

console.log('📝 Starting README update...');

try {
  await updateReadme();
  console.log('✅ README updated successfully');
} catch (error) {
  console.error('❌ Error updating README:', error.message);
  console.error(error.stack);
}
