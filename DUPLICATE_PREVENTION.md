# 题目去重功能说明

Mathematical Everyday 项目实现了强大的题目去重功能，确保生成的题目不会重复，提高题目库的质量和多样性。

## 🎯 去重机制

### 1. 多层次检测
- **文件检测**：检查现有题目文件的相似度
- **历史记录检测**：检查历史生成记录，防止删除文件后重复
- **实时生成检测**：生成过程中自动重试，直到获得独特题目

### 2. 相似度算法
- **标题相似度**（权重 40%）：比较题目标题的文字相似性
- **内容相似度**（权重 40%）：分析题目描述的内容重叠
- **概念相似度**（权重 20%）：提取数学概念关键词进行匹配

### 3. 智能重试机制
- 最多重试3次生成不同的题目
- 每次重试时向AI提供已存在题目的信息
- 逐步增加差异化要求

## 🔧 技术实现

### 相似度计算公式
```javascript
总相似度 = 标题相似度 × 0.4 + 内容相似度 × 0.4 + 概念相似度 × 0.2
```

### 重复判定阈值
- **重复阈值**：相似度 ≥ 0.7 (70%)
- **高相似阈值**：相似度 ≥ 0.5 (50%)
- **历史检查阈值**：相似度 ≥ 0.8 (80%)

### 数学概念提取
系统自动提取以下数学概念：
- **微积分**：导数、微分、积分、极限、连续、切线、极值、单调、凹凸
- **线性代数**：矩阵、行列式、向量、特征值、特征向量、线性、齐次
- **级数**：级数、收敛、发散、幂级数、泰勒、傅里叶、比值、根值
- **概率统计**：概率、随机变量、分布、期望、方差、协方差、独立、相关
- **微分方程**：微分方程、常微分、偏微分、齐次方程、非齐次方程、通解、特解

## 📊 使用方法

### 1. 自动去重（默认启用）
```bash
# 生成题目时自动启用去重
npm run generate-problem

# 指定分类生成（也会自动去重）
npm start generate-problem -c differential
```

### 2. 检查现有题目重复
```bash
# 基础重复检查
npm start check-duplicates

# 详细相似度信息
npm start check-duplicates -v
```

### 3. 历史记录管理
```bash
# 查看历史统计
node src/index.js history stats

# 清理旧记录（保留最新1000条）
node src/index.js history cleanup

# 导出历史记录
node src/index.js history export -o backup.json
```

## 📈 生成日志示例

### 成功生成（第一次尝试）
```
Generating problem for category: 微分学
Attempt 1/3 for generating unique problem...
✅ Unique problem generated on attempt 1
Problem generated successfully: /questions/differential/2024-01-15-problem.md
Problem ID: 1704123456789_abc123def
Final uniqueness check - Highest similarity: 0.234
```

### 检测到重复并重试
```
Generating problem for category: 积分学
Attempt 1/3 for generating unique problem...
⚠️ Duplicate detected on attempt 1. Similarity: 0.782
Similar to file: 计算定积分的值
Attempt 2/3 for generating unique problem...
✅ Unique problem generated on attempt 2
Problem generated successfully: /questions/integral/2024-01-15-problem.md
```

### 重试失败示例
```
Generating problem for category: 线性代数
Attempt 1/3 for generating unique problem...
⚠️ Duplicate detected on attempt 1. Similarity: 0.756
Attempt 2/3 for generating unique problem...
⚠️ Duplicate detected on attempt 2. Similarity: 0.721
Attempt 3/3 for generating unique problem...
⚠️ Duplicate detected on attempt 3. Similarity: 0.701
❌ Failed to generate unique problem after 3 attempts. Last similarity: 0.701
```

## 📋 重复检查报告

### 基础报告
```bash
$ npm start check-duplicates

🔍 Analyzing problem uniqueness...

📊 Uniqueness Report:
  Total problems: 25
  Uniqueness score: 92.0%
  Duplicate pairs: 2
  Similar pairs: 5

📚 Category Distribution:
  微分学: 8
  积分学: 6
  线性代数: 5
  概率统计: 6

✅ No duplicate problems found!
```

### 详细报告（带 -v 参数）
```bash
$ npm start check-duplicates -v

❌ Duplicate Problems Found:

1. Similarity: 78.5%
   Problem 1: 求函数的极值点
   Problem 2: 计算函数极值
   Title similarity: 85.2%
   Description similarity: 71.8%
   Concept similarity: 78.5%

⚠️ Highly Similar Problems:

1. Similarity: 65.3%
   Problem 1: 矩阵的特征值计算
   Problem 2: 求矩阵特征值和特征向量
```

## 🛠️ 配置选项

### 调整相似度阈值
可以在生成时指定自定义阈值：
```javascript
// 在 problemGenerator.js 中修改
const duplicateCheckResult = await checkForDuplicates(problemData, 0.6); // 降低阈值到60%
```

### 修改重试次数
```javascript
// 增加重试次数到5次
await generateDailyProblem(categoryId, 5);
```

### 历史记录清理策略
```javascript
// 保留最新500条记录
await cleanupHistory(500);
```

## 🔍 故障排除

### 1. 重复检测过于严格
如果经常遇到"无法生成独特题目"错误：
- 降低相似度阈值（从0.7到0.6）
- 增加重试次数
- 检查是否某个分类的题目过多

### 2. 历史文件过大
如果历史记录文件变得很大：
```bash
# 清理旧记录
node src/index.js history cleanup -n 500
```

### 3. 误判为重复
手动检查报告的重复题目：
```bash
npm start check-duplicates -v
```

## 📚 最佳实践

### 1. 定期检查重复
```bash
# 建议每周检查一次
npm start check-duplicates -v
```

### 2. 分类均衡生成
避免在单一分类中生成过多题目，保持各分类平衡。

### 3. 历史记录管理
- 定期清理旧记录（建议保留最新1000条）
- 定期导出备份历史记录

### 4. 监控唯一性得分
保持唯一性得分在90%以上，如果低于此值，需要检查重复问题。

这套去重系统确保了Mathematical Everyday生成的每道题目都是独特和有价值的！🎓✨
