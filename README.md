# Mathematical Everyday 📚

每天用AI自动生成高等数学题目的项目，支持自动答案生成和GitHub自动提交。

## ✨ 功能特性

- 🤖 **AI驱动生成**: 支持DeepSeek、豆包等多种AI模型
- 📅 **每日自动化**: 定时生成题目和答案
- 📊 **智能分类**: 微分、积分、微分方程等8大数学分类
- 🔄 **自动提交**: 自动提交到GitHub仓库
- 📐 **数学符号**: 完整支持LaTeX数学公式
- 🎯 **考研标准**: 参考历年考研真题风格和难度
- ⚙️ **灵活配置**: 支持自定义时间、模型等配置

## 📁 项目结构

```
mathematicalEveryDay/
├── src/
│   ├── config/           # 配置管理
│   ├── services/         # 核心服务
│   │   ├── aiService.js      # AI模型接口
│   │   ├── problemGenerator.js # 题目生成
│   │   ├── solutionGenerator.js # 答案生成
│   │   └── gitService.js     # Git自动提交
│   ├── utils/            # 工具函数
│   │   ├── categories.js     # 题目分类
│   │   ├── fileManager.js    # 文件管理
│   │   └── problemTracker.js # 题目追踪
│   ├── scripts/          # 独立脚本
│   ├── scheduler.js      # 定时任务调度
│   └── index.js          # 主入口
├── problems/             # 生成的题目存储
│   ├── differential/     # 微分学
│   ├── integral/         # 积分学
│   ├── differential-equations/ # 微分方程
│   ├── multivariable-differential/ # 多元微分
│   ├── multiple-integrals/ # 多重积分
│   ├── series/           # 级数
│   ├── linear-algebra/   # 线性代数
│   └── probability-statistics/ # 概率统计
└── config.example.env    # 配置文件模板
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制配置文件模板并编辑：

```bash
cp config.example.env .env
```

编辑 `.env` 文件，配置你的AI模型API密钥：

```env
# AI模型配置 (选择一个)
DEEPSEEK_API_KEY=your_deepseek_api_key_here
# DOUBAO_API_KEY=your_doubao_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here

# GitHub配置
GITHUB_TOKEN=your_github_token_here
GITHUB_USERNAME=your_github_username
GITHUB_REPO=mathematicalEveryDay

# 当前使用的AI模型
AI_MODEL=deepseek

# 定时配置
GENERATE_PROBLEM_TIME=09:00
GENERATE_ANSWER_TIME=09:00
TIMEZONE=Asia/Shanghai
```

### 3. 支持的AI模型

#### DeepSeek API
- 注册地址: https://platform.deepseek.com/
- 配置 `DEEPSEEK_API_KEY`
- 设置 `AI_MODEL=deepseek`

#### 豆包 (ByteDance)
- 注册地址: https://console.volcengine.com/ark
- 配置 `DOUBAO_API_KEY`
- 设置 `AI_MODEL=doubao`

#### OpenAI (可选)
- 配置 `OPENAI_API_KEY`
- 设置 `AI_MODEL=openai`

### 4. GitHub配置

创建GitHub Personal Access Token:
1. 访问 GitHub Settings → Developer settings → Personal access tokens
2. 创建新token，勾选 `repo` 权限
3. 将token设置为 `GITHUB_TOKEN`

## 📖 使用方法

### 命令行界面

```bash
# 查看所有命令
npm start

# 启动定时调度器
npm run schedule

# 手动生成题目
npm run generate-problem

# 手动生成答案
npm run generate-answer

# 查看统计信息
npm start stats

# 查看所有分类
npm start categories

# 生成指定分类的题目
npm start generate-problem -c differential

# 测试功能
npm start test problem
npm start test solution
```

### 定时任务

启动定时调度器后，系统将：
- 每天指定时间自动生成新题目
- 每天指定时间为昨天的题目生成答案
- 每6小时检查并补充遗漏的答案
- 自动提交所有变更到GitHub

```bash
npm run schedule
```

## 📚 题目分类

| 分类ID | 中文名称 | 英文名称 | 描述 |
|--------|----------|----------|------|
| `differential` | 微分学 | Differential Calculus | 导数、微分、切线、函数单调性、极值等 |
| `integral` | 积分学 | Integral Calculus | 不定积分、定积分、积分应用等 |
| `differential_equation` | 微分方程 | Differential Equations | 常微分方程、偏微分方程等 |
| `multivariable_differential` | 多元微分 | Multivariable Differential | 偏导数、全微分、梯度、方向导数等 |
| `multiple_integral` | 多重积分 | Multiple Integrals | 二重积分、三重积分、曲线积分、曲面积分等 |
| `series` | 级数 | Series | 数项级数、幂级数、傅里叶级数等 |
| `linear_algebra` | 线性代数 | Linear Algebra | 矩阵、行列式、向量空间、特征值等 |
| `probability` | 概率统计 | Probability and Statistics | 概率、随机变量、分布、统计推断等 |

## 📐 数学符号支持

项目完整支持LaTeX数学公式，包括：

### 基础符号
- 分数: `\\frac{a}{b}` → $\\frac{a}{b}$
- 根号: `\\sqrt{x}` → $\\sqrt{x}$
- 上标: `x^2` → $x^2$
- 下标: `x_1` → $x_1$

### 微积分符号
- 导数: `\\frac{dy}{dx}` → $\\frac{dy}{dx}$
- 偏导数: `\\frac{\\partial f}{\\partial x}` → $\\frac{\\partial f}{\\partial x}$
- 积分: `\\int f(x)dx` → $\\int f(x)dx$
- 定积分: `\\int_a^b f(x)dx` → $\\int_a^b f(x)dx$

### 高级符号
- 极限: `\\lim_{x \\to 0}` → $\\lim_{x \\to 0}$
- 求和: `\\sum_{i=1}^n` → $\\sum_{i=1}^n$
- 矩阵: `\\begin{matrix} a & b \\\\ c & d \\end{matrix}`

## 🔧 开发与部署

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式 (自动重启)
npm run dev

# 生成测试题目
npm start test problem

# 生成测试答案
npm start test solution
```

### 部署到服务器

1. 将项目上传到服务器
2. 配置环境变量
3. 安装PM2进程管理器

```bash
npm install -g pm2

# 启动定时调度器
pm2 start src/scheduler.js --name mathematical-everyday

# 查看日志
pm2 logs mathematical-everyday

# 重启服务
pm2 restart mathematical-everyday
```

### GitHub Actions (可选)

可以使用GitHub Actions定时运行：

```yaml
name: Generate Daily Problem
on:
  schedule:
    - cron: '0 1 * * *'  # 每天9点 (UTC+8)
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm start generate-problem
        env:
          DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 📊 示例输出

### 生成的题目格式

```markdown
# 求函数 f(x) = x³ - 3x² + 2x 的极值点

## 📊 题目信息
- **日期**: 2024-01-15
- **分类**: 微分学
- **难度**: 中等
- **来源**: 考研真题风格

## 📝 题目描述
已知函数 f(x) = x³ - 3x² + 2x，求：
1. 函数的驻点
2. 判断各驻点的性质
3. 求出所有极值点及对应的极值

## 💡 解题提示
1. 先求函数的一阶导数
2. 令一阶导数为0，求出驻点
3. 利用二阶导数判别法判断极值点的性质

## 📚 解答
> 解答将在明天自动生成
```

### 生成的答案格式

```markdown
## 📚 解答

### 解题步骤

**1. 求一阶导数**
对函数 f(x) = x³ - 3x² + 2x 求导：
$$f'(x) = 3x^2 - 6x + 2$$

**2. 求驻点**
令 f'(x) = 0：
$$3x^2 - 6x + 2 = 0$$

### 最终答案
**答案**: 极大值点为 x = (3-√3)/3，极小值点为 x = (3+√3)/3
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork本仓库
2. 创建特性分支: `git checkout -b feature/your-feature`
3. 提交更改: `git commit -m 'Add your feature'`
4. 推送到分支: `git push origin feature/your-feature`
5. 提交Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- [DeepSeek API文档](https://platform.deepseek.com/api-docs/)
- [豆包API文档](https://www.volcengine.com/docs/82379)
- [LaTeX数学符号参考](https://katex.org/docs/supported.html)
- [GitHub API文档](https://docs.github.com/en/rest)

## ❓ 常见问题

### Q: 如何切换AI模型？
A: 修改 `.env` 文件中的 `AI_MODEL` 参数，支持 `deepseek`、`doubao`、`openai`。

### Q: 题目重复怎么办？
A: AI会尽量生成不同的题目，如果遇到重复，可以手动删除重复文件或调整生成参数。

### Q: 数学公式不显示？
A: 确保使用支持LaTeX的Markdown渲染器，GitHub默认支持。

### Q: 定时任务不工作？
A: 检查时区设置和cron表达式是否正确，确保服务器时间准确。

---

*本项目由AI驱动，致力于让数学学习更加便捷和有趣！* 🎓✨
