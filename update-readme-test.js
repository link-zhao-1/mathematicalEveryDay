import { updateReadme } from './src/utils/readmeUpdater.js';

console.log('📝 Updating README...');

try {
  await updateReadme();
  console.log('✅ README updated successfully');
} catch (error) {
  console.error('❌ Error:', error.message);
}
