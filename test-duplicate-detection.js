import { calculateProblemSimilarity } from './src/utils/duplicateChecker.js';

// 测试题目重复检测算法
async function testDuplicateDetection() {
  console.log('🔍 题目重复检测算法测试\n');

  // 测试用例1：几乎完全相同的题目
  const problem1 = {
    title: "求函数 f(x) = x^2 + 2x + 1 的极值点",
    description: "已知函数 f(x) = x^2 + 2x + 1，求该函数的极值点和极值。使用一阶导数和二阶导数方法。",
    category: "微分学"
  };

  const problem2 = {
    title: "计算函数 g(x) = x^2 + 2x + 1 的极值",
    description: "给定函数 g(x) = x^2 + 2x + 1，求出函数的极值点及对应的极值。利用导数方法求解。",
    category: "微分学"
  };

  // 测试用例2：完全不同的题目
  const problem3 = {
    title: "计算二重积分 ∫∫D xy dxdy",
    description: "计算区域 D: {(x,y) | 0≤x≤1, 0≤y≤1} 上的二重积分 ∫∫D xy dxdy。使用累次积分方法。",
    category: "多重积分"
  };

  // 测试用例3：中等相似的题目
  const problem4 = {
    title: "求函数 h(x) = x^3 - 3x + 2 的极值点",
    description: "已知函数 h(x) = x^3 - 3x + 2，求该函数的极值点、极值和拐点。",
    category: "微分学"
  };

  console.log('📊 测试结果：\n');

  // 测试1: 高度相似题目
  console.log('【测试1】高度相似题目比较');
  console.log(`题目1: ${problem1.title}`);
  console.log(`题目2: ${problem2.title}`);
  
  const similarity1 = calculateProblemSimilarity(problem1, problem2);
  console.log(`相似度分析:`);
  console.log(`  标题相似度: ${(similarity1.title * 100).toFixed(1)}%`);
  console.log(`  内容相似度: ${(similarity1.description * 100).toFixed(1)}%`);
  console.log(`  概念相似度: ${(similarity1.concept * 100).toFixed(1)}%`);
  console.log(`  总体相似度: ${(similarity1.overall * 100).toFixed(1)}%`);
  console.log(`  判定结果: ${similarity1.isDuplicate ? '❌ 重复' : '✅ 不重复'}`);
  console.log('');

  // 测试2: 完全不同题目  
  console.log('【测试2】完全不同题目比较');
  console.log(`题目1: ${problem1.title}`);
  console.log(`题目3: ${problem3.title}`);
  
  const similarity2 = calculateProblemSimilarity(problem1, problem3);
  console.log(`相似度分析:`);
  console.log(`  标题相似度: ${(similarity2.title * 100).toFixed(1)}%`);
  console.log(`  内容相似度: ${(similarity2.description * 100).toFixed(1)}%`);
  console.log(`  概念相似度: ${(similarity2.concept * 100).toFixed(1)}%`);
  console.log(`  总体相似度: ${(similarity2.overall * 100).toFixed(1)}%`);
  console.log(`  判定结果: ${similarity2.isDuplicate ? '❌ 重复' : '✅ 不重复'}`);
  console.log('');

  // 测试3: 中等相似题目
  console.log('【测试3】中等相似题目比较');
  console.log(`题目1: ${problem1.title}`);
  console.log(`题目4: ${problem4.title}`);
  
  const similarity3 = calculateProblemSimilarity(problem1, problem4);
  console.log(`相似度分析:`);
  console.log(`  标题相似度: ${(similarity3.title * 100).toFixed(1)}%`);
  console.log(`  内容相似度: ${(similarity3.description * 100).toFixed(1)}%`);
  console.log(`  概念相似度: ${(similarity3.concept * 100).toFixed(1)}%`);
  console.log(`  总体相似度: ${(similarity3.overall * 100).toFixed(1)}%`);
  console.log(`  判定结果: ${similarity3.isDuplicate ? '❌ 重复' : '✅ 不重复'}`);
  console.log(`  高相似度: ${similarity3.isHighlySimilar ? '⚠️ 是' : '✅ 否'}`);
  console.log('');

  console.log('🔧 算法说明：');
  console.log('- 总相似度 = 标题相似度×40% + 内容相似度×40% + 概念相似度×20%');
  console.log('- 重复阈值: ≥70%');
  console.log('- 高相似阈值: ≥50%');
  console.log('- 数学概念包括: 导数、积分、极值、矩阵、概率等关键词');
}

// 运行测试
testDuplicateDetection().catch(console.error);
