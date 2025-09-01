// 题目重复检测算法演示

console.log('🔍 题目重复检测算法详解\n');

// 1. 文本相似度计算函数
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  // 标准化文本：转小写，去标点，规范空格
  const normalize = (text) => text.toLowerCase()
    .replace(/[^\w\s]/g, '')  // 去除标点
    .replace(/\s+/g, ' ')     // 标准化空格
    .trim();
  
  const normalizedText1 = normalize(text1);
  const normalizedText2 = normalize(text2);
  
  if (normalizedText1 === normalizedText2) return 1;
  
  // 基于共同词汇计算相似度
  const words1 = normalizedText1.split(' ');
  const words2 = normalizedText2.split(' ');
  
  const allWords = new Set([...words1, ...words2]);
  let commonWords = 0;
  
  for (const word of allWords) {
    if (words1.includes(word) && words2.includes(word)) {
      commonWords++;
    }
  }
  
  return commonWords / allWords.size;
}

// 2. 数学概念提取
function extractMathConcepts(text) {
  const mathKeywords = [
    '函数', '导数', '微分', '积分', '极限', '连续', '极值', '单调',
    '矩阵', '行列式', '向量', '特征值', '线性',
    '级数', '收敛', '发散', '幂级数',
    '概率', '随机', '分布', '期望', '方差'
  ];
  
  const concepts = [];
  const normalizedText = text.toLowerCase();
  
  for (const keyword of mathKeywords) {
    if (normalizedText.includes(keyword)) {
      concepts.push(keyword);
    }
  }
  
  return concepts;
}

// 3. 概念相似度计算
function calculateConceptSimilarity(concepts1, concepts2) {
  if (concepts1.length === 0 && concepts2.length === 0) return 0;
  if (concepts1.length === 0 || concepts2.length === 0) return 0;
  
  const set1 = new Set(concepts1);
  const set2 = new Set(concepts2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// 测试题目
const problem1 = {
  title: "求函数 f(x) = x^2 + 2x + 1 的极值点",
  description: "已知函数 f(x) = x^2 + 2x + 1，求该函数的极值点和极值。使用导数方法求解。"
};

const problem2 = {
  title: "计算函数 g(x) = x^2 + 2x + 1 的极值",
  description: "给定函数 g(x) = x^2 + 2x + 1，求出函数的极值点及对应的极值。利用导数分析。"
};

const problem3 = {
  title: "计算二重积分在区域D上的值",
  description: "计算区域 D: {(x,y) | 0≤x≤1, 0≤y≤1} 上的二重积分 ∫∫D xy dxdy。"
};

console.log('【测试案例1】高度相似的题目');
console.log('题目A:', problem1.title);
console.log('题目B:', problem2.title);
console.log('');

// 计算相似度
const titleSim1 = calculateTextSimilarity(problem1.title, problem2.title);
const descSim1 = calculateTextSimilarity(problem1.description, problem2.description);

const concepts1A = extractMathConcepts(problem1.title + ' ' + problem1.description);
const concepts1B = extractMathConcepts(problem2.title + ' ' + problem2.description);
const conceptSim1 = calculateConceptSimilarity(concepts1A, concepts1B);

const overallSim1 = titleSim1 * 0.4 + descSim1 * 0.4 + conceptSim1 * 0.2;

console.log('相似度分析:');
console.log(`  标题相似度: ${(titleSim1 * 100).toFixed(1)}%`);
console.log(`  内容相似度: ${(descSim1 * 100).toFixed(1)}%`);
console.log(`  概念相似度: ${(conceptSim1 * 100).toFixed(1)}%`);
console.log(`  提取的概念A: [${concepts1A.join(', ')}]`);
console.log(`  提取的概念B: [${concepts1B.join(', ')}]`);
console.log(`  总体相似度: ${(overallSim1 * 100).toFixed(1)}%`);
console.log(`  判定结果: ${overallSim1 > 0.7 ? '❌ 重复' : '✅ 不重复'}`);
console.log('');

console.log('【测试案例2】不同类型的题目');
console.log('题目A:', problem1.title);
console.log('题目C:', problem3.title);
console.log('');

const titleSim2 = calculateTextSimilarity(problem1.title, problem3.title);
const descSim2 = calculateTextSimilarity(problem1.description, problem3.description);

const concepts2A = extractMathConcepts(problem1.title + ' ' + problem1.description);
const concepts2C = extractMathConcepts(problem3.title + ' ' + problem3.description);
const conceptSim2 = calculateConceptSimilarity(concepts2A, concepts2C);

const overallSim2 = titleSim2 * 0.4 + descSim2 * 0.4 + conceptSim2 * 0.2;

console.log('相似度分析:');
console.log(`  标题相似度: ${(titleSim2 * 100).toFixed(1)}%`);
console.log(`  内容相似度: ${(descSim2 * 100).toFixed(1)}%`);
console.log(`  概念相似度: ${(conceptSim2 * 100).toFixed(1)}%`);
console.log(`  提取的概念A: [${concepts2A.join(', ')}]`);
console.log(`  提取的概念C: [${concepts2C.join(', ')}]`);
console.log(`  总体相似度: ${(overallSim2 * 100).toFixed(1)}%`);
console.log(`  判定结果: ${overallSim2 > 0.7 ? '❌ 重复' : '✅ 不重复'}`);
console.log('');

console.log('🎯 算法总结:');
console.log('1. 总相似度 = 标题相似度×40% + 内容相似度×40% + 概念相似度×20%');
console.log('2. 重复判定阈值: ≥70%');
console.log('3. 高相似警告阈值: ≥50%');
console.log('4. 数学概念库包含: 函数、导数、积分、矩阵、概率等关键词');
console.log('5. 文本标准化: 去标点、转小写、规范空格');
console.log('6. 基于共同词汇比例计算文本相似度');
