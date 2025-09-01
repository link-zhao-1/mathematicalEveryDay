// 简化的相似度计算演示
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  const normalize = (text) => text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  const normalizedText1 = normalize(text1);
  const normalizedText2 = normalize(text2);
  
  if (normalizedText1 === normalizedText2) return 1;
  
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

function extractMathConcepts(text) {
  const mathKeywords = [
    '导数', '微分', '积分', '极限', '连续', '切线', '极值', '单调',
    '矩阵', '行列式', '向量', '特征值', '线性',
    '级数', '收敛', '发散', '幂级数',
    '概率', '随机变量', '分布', '期望', '方差',
    'sin', 'cos', 'tan', 'ln', 'log', 'exp'
  ];
  
  const concepts = [];
  const normalizedText = text.toLowerCase();
  
  for (const keyword of mathKeywords) {
    if (normalizedText.includes(keyword.toLowerCase())) {
      concepts.push(keyword);
    }
  }
  
  return concepts;
}

function calculateConceptSimilarity(concepts1, concepts2) {
  if (concepts1.length === 0 && concepts2.length === 0) return 0;
  if (concepts1.length === 0 || concepts2.length === 0) return 0;
  
  const set1 = new Set(concepts1);
  const set2 = new Set(concepts2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

function calculateProblemSimilarity(problem1, problem2) {
  const titleSimilarity = calculateTextSimilarity(problem1.title, problem2.title);
  const descriptionSimilarity = calculateTextSimilarity(problem1.description, problem2.description);
  
  const concepts1 = extractMathConcepts(problem1.title + ' ' + problem1.description);
  const concepts2 = extractMathConcepts(problem2.title + ' ' + problem2.description);
  const conceptSimilarity = calculateConceptSimilarity(concepts1, concepts2);
  
  const overallSimilarity = 
    titleSimilarity * 0.4 + 
    descriptionSimilarity * 0.4 + 
    conceptSimilarity * 0.2;
  
  return {
    overall: overallSimilarity,
    title: titleSimilarity,
    description: descriptionSimilarity,
    concept: conceptSimilarity,
    isDuplicate: overallSimilarity > 0.7,
    concepts1,
    concepts2
  };
}

// 测试用例
console.log('🔍 题目重复检测算法演示\n');

const problem1 = {
  title: "求函数 f(x) = x^2 + 2x + 1 的极值点",
  description: "已知函数 f(x) = x^2 + 2x + 1，求该函数的极值点和极值。使用导数方法求解。",
  category: "微分学"
};

const problem2 = {
  title: "计算函数 g(x) = x^2 + 2x + 1 的极值",
  description: "给定函数 g(x) = x^2 + 2x + 1，求出函数的极值点及对应的极值。利用导数分析。",
  category: "微分学"
};

const problem3 = {
  title: "计算二重积分 ∫∫D xy dxdy",
  description: "计算区域 D: {(x,y) | 0≤x≤1, 0≤y≤1} 上的二重积分。使用累次积分方法求解。",
  category: "多重积分"
};

console.log('【测试1】高度相似题目');
console.log(`题目A: ${problem1.title}`);
console.log(`题目B: ${problem2.title}`);

const sim1 = calculateProblemSimilarity(problem1, problem2);
console.log('\n相似度分析:');
console.log(`  标题相似度: ${(sim1.title * 100).toFixed(1)}%`);
console.log(`  内容相似度: ${(sim1.description * 100).toFixed(1)}%`);
console.log(`  概念相似度: ${(sim1.concept * 100).toFixed(1)}%`);
console.log(`  提取的概念A: [${sim1.concepts1.join(', ')}]`);
console.log(`  提取的概念B: [${sim1.concepts2.join(', ')}]`);
console.log(`  总体相似度: ${(sim1.overall * 100).toFixed(1)}%`);
console.log(`  判定结果: ${sim1.isDuplicate ? '❌ 重复' : '✅ 不重复'}\n`);

console.log('【测试2】不同类型题目');
console.log(`题目A: ${problem1.title}`);
console.log(`题目C: ${problem3.title}`);

const sim2 = calculateProblemSimilarity(problem1, problem3);
console.log('\n相似度分析:');
console.log(`  标题相似度: ${(sim2.title * 100).toFixed(1)}%`);
console.log(`  内容相似度: ${(sim2.description * 100).toFixed(1)}%`);
console.log(`  概念相似度: ${(sim2.concept * 100).toFixed(1)}%`);
console.log(`  提取的概念A: [${sim2.concepts1.join(', ')}]`);
console.log(`  提取的概念C: [${sim2.concepts2.join(', ')}]`);
console.log(`  总体相似度: ${(sim2.overall * 100).toFixed(1)}%`);
console.log(`  判定结果: ${sim2.isDuplicate ? '❌ 重复' : '✅ 不重复'}\n`);

console.log('🎯 算法核心:');
console.log('  总相似度 = 标题×40% + 内容×40% + 概念×20%');
console.log('  重复阈值: ≥70%');
console.log('  数学概念库: 导数、积分、极值、矩阵、概率等');
