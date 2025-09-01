# Mathematical Everyday - 安装配置指南

## 🚀 快速安装步骤

### 1. 安装依赖

```bash
# 使用npm安装
npm install

# 或使用yarn安装
yarn install
```

### 2. 配置环境变量

```bash
# 复制配置文件模板
cp config.example.env .env

# 编辑配置文件
nano .env  # 或使用你喜欢的编辑器
```

### 3. AI模型配置

#### 选项一：DeepSeek (推荐)
```env
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_MODEL=deepseek
```

注册地址：https://platform.deepseek.com/

#### 选项二：豆包 (国内推荐)
```env
DOUBAO_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_MODEL=doubao
```

注册地址：https://console.volcengine.com/ark

#### 选项三：OpenAI
```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_MODEL=openai
```

### 4. GitHub配置

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_USERNAME=your_username
GITHUB_REPO=mathematicalEveryDay
```

获取GitHub Token：
1. 登录GitHub
2. 设置 → Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token，选择 `repo` 权限
4. 复制生成的token

### 5. 时间配置

```env
GENERATE_PROBLEM_TIME=09:00
GENERATE_ANSWER_TIME=10:00
TIMEZONE=Asia/Shanghai
```

## 🧪 测试安装

### 测试题目生成
```bash
npm start test problem
```

### 测试答案生成  
```bash
npm start test solution
```

### 查看统计信息
```bash
npm start stats
```

## 🏃‍♂️ 启动项目

### 开发模式
```bash
npm run dev
```

### 启动定时调度器
```bash
npm run schedule
```

### 手动生成题目
```bash
npm run generate-problem
```

### 手动生成答案
```bash
npm run generate-answer
```

## 🔧 常见问题解决

### 问题1：API密钥无效
- 检查API密钥是否正确复制
- 确认API密钥是否有使用权限
- 检查账户余额是否充足

### 问题2：GitHub提交失败
- 确认GitHub Token权限包含`repo`
- 检查仓库名称是否正确
- 确认网络连接正常

### 问题3：时区问题
- 确认服务器时区设置
- 检查cron表达式是否正确
- 验证时间格式（24小时制）

### 问题4：Node.js版本问题
推荐使用Node.js 18或更高版本：
```bash
node --version  # 检查版本
nvm use 18      # 如果使用nvm
```

## 📁 目录结构检查

确保项目结构正确：
```
mathematicalEveryDay/
├── src/
├── problems/
├── package.json
├── .env
└── README.md
```

## 🚀 部署指南

### 本地部署
```bash
# 启动调度器
npm run schedule
```

### 服务器部署
```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start src/scheduler.js --name mathematical-everyday

# 查看状态
pm2 status

# 查看日志
pm2 logs mathematical-everyday
```

### Docker部署（可选）
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "schedule"]
```

## ✅ 安装验证清单

- [ ] Node.js版本 >= 18
- [ ] 依赖安装成功
- [ ] .env文件配置完成
- [ ] AI API密钥有效
- [ ] GitHub Token配置正确
- [ ] 测试命令运行成功
- [ ] 时区设置正确
- [ ] 网络连接正常

完成所有步骤后，你的Mathematical Everyday项目就可以正常运行了！🎉
