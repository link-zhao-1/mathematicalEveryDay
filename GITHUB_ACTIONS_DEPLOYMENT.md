# GitHub Actions 部署指南

通过GitHub Actions实现Mathematical Everyday的完全自动化部署和运行。

## 🚀 自动化流程

### 📅 每日问题生成

- **时间**: 每天北京时间 09:00 (UTC 01:00)
- **功能**: 自动生成新的数学问题
- **文件**: `.github/workflows/generate-problem.yml`

### 📝 每日答案生成

- **时间**: 每天北京时间 20:00 (UTC 12:00)
- **功能**: 为昨天的问题生成答案
- **文件**: `.github/workflows/generate-answer.yml`

### 🧹 定期维护

- **时间**: 每周日北京时间 08:00 (UTC 00:00)
- **功能**: 统计分析、重复检查、历史清理
- **文件**: `.github/workflows/daily-problem.yml` (maintenance job)

## ⚙️ 配置步骤

### 1. 设置Repository Secrets

在GitHub仓库设置中添加以下Secrets：

#### AI模型配置 (选择一个)

```
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
DOUBAO_API_KEY=your-doubao-api-key  
OPENAI_API_KEY=sk-your-openai-api-key
```

#### GitHub配置

```
GITHUB_TOKEN=自动提供，无需设置
```

### 2. 设置Repository Variables

在GitHub仓库设置中添加以下Variables：

```
AI_MODEL=deepseek  # 或 doubao, openai
```

### 3. 启用GitHub Actions

1. 进入仓库的 **Settings** → **Actions** → **General**
2. 选择 **Allow all actions and reusable workflows**
3. 在 **Workflow permissions** 中选择 **Read and write permissions**
4. 勾选 **Allow GitHub Actions to create and approve pull requests**

## 📋 Workflow文件说明

### 主要Workflow

#### 1. `generate-problem.yml` - 每日问题生成

```yaml
# 特点:
- 每天自动检查是否已有当日问题
- 支持手动触发，可选择分类
- 自动提交到Git
- 防重复生成
```

#### 2. `generate-answer.yml` - 答案生成

```yaml
# 特点:
- 扫描所有未解答的问题
- 批量生成答案
- 自动更新README状态
- 提交答案到Git
```

#### 3. `daily-problem.yml` - 综合管理

```yaml
# 特点:
- 问题和答案的完整生成流程
- 周期性维护任务
- 统计报告生成
- 历史记录清理
```

## 🎛️ 手动触发

### 生成问题

1. 进入 **Actions** 标签页
2. 选择 **Generate Daily Problem**
3. 点击 **Run workflow**
4. 可选择分类：differential, integral, probability等

### 生成答案

1. 选择 **Generate Answers**
2. 点击 **Run workflow**
3. 将为所有未解答问题生成答案

## 📊 自动化流程示例

### 每日流程

```
09:00 北京时间
├── 检查今日是否已有问题
├── 生成新问题（如果没有）
├── 更新README
├── 提交到Git
└── 发送通知（可选）

20:00 北京时间  
├── 扫描未解答问题
├── 生成答案
├── 更新README状态
├── 提交到Git
└── 发送通知（可选）
```

### 维护流程（每周日）

```
08:00 北京时间
├── 生成项目统计
├── 检查重复问题
├── 清理历史记录
├── 更新README
└── 提交维护报告
```

## 🔧 高级配置

### 自定义时间

修改 `.github/workflows/*.yml` 中的 cron 表达式：

```yaml
schedule:
  - cron: '0 1 * * *'  # UTC时间，需要转换
```

### 多AI模型支持

在Repository Variables中设置：

```
AI_MODEL=deepseek     # 主模型
FALLBACK_MODEL=doubao # 备用模型
```

### 通知配置

添加Slack/Discord通知：

```yaml
- name: Notify Success
  uses: 8398a7/action-slack@v3
  with:
    status: success
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🚨 故障排除

### 常见问题

#### 1. API配额超限

```yaml
# 解决方案: 添加错误处理和重试
- name: Generate with retry
  run: |
    for i in {1..3}; do
      npm start generate-problem && break
      sleep 60
    done
```

#### 2. Git提交失败

```yaml
# 解决方案: 检查权限设置
permissions:
  contents: write
  actions: read
```

#### 3. Secrets未设置

检查Repository Secrets是否正确配置AI API密钥。

### 调试方法

#### 查看运行日志

1. 进入 **Actions** 标签页
2. 选择失败的workflow run
3. 展开具体步骤查看错误信息

#### 本地测试

```bash
# 测试问题生成
npm start generate-problem -c differential

# 测试答案生成  
npm start generate-solutions

# 测试README更新
node update-readme.js
```

## 📈 监控和优化

### 成功指标

- ✅ 每日问题生成成功率 > 95%
- ✅ 答案生成成功率 > 90%
- ✅ README自动更新成功
- ✅ Git提交无冲突

### 性能优化

- 使用npm缓存加速安装
- 并行运行独立任务
- 合理设置超时时间
- 优化AI API调用频率

## 🔄 版本升级

当需要升级依赖或修改逻辑时：

1. **测试分支验证**：

   ```bash
   git checkout -b test-actions
   # 修改workflow文件
   git push origin test-actions
   ```
2. **观察运行结果**：
   在测试分支运行几天，确认稳定
3. **合并到主分支**：

   ```bash
   git checkout main
   git merge test-actions
   ```

## 🎯 最佳实践

1. **定期检查Secrets有效性**
2. **监控API使用量和费用**
3. **备份重要数据和配置**
4. **保持依赖版本更新**
5. **设置合理的超时和重试机制**

通过GitHub Actions，您的Mathematical Everyday项目将实现完全自动化运行，无需人工干预即可每日生成高质量的数学问题！🎓✨
