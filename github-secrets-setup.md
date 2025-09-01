# GitHub Secrets 配置指南

## 🚀 快速配置步骤

### 第一步：获取仓库URL
```bash
# 运行这个命令获取你的仓库设置链接
echo "你的仓库设置链接："
git config --get remote.origin.url | sed 's/\.git$/\/settings\/secrets\/actions/'
```

### 第二步：配置Secrets

访问上面的链接，然后按以下步骤配置：

#### 🔑 添加API密钥（选择一个）

**选项1: DeepSeek (推荐)**
```
Name: DEEPSEEK_API_KEY
Secret: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**选项2: 豆包**  
```
Name: DOUBAO_API_KEY
Secret: your-doubao-api-key-here
```

**选项3: OpenAI**
```
Name: OPENAI_API_KEY  
Secret: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 第三步：配置Variables

点击 "Variables" 标签，添加：

```
Name: AI_MODEL
Value: deepseek (或 doubao, openai)
```

## 📋 配置检查清单

- [ ] ✅ 已添加AI API密钥到Secrets
- [ ] ✅ 已设置AI_MODEL变量
- [ ] ✅ 已推送代码到GitHub  
- [ ] ✅ 已启用Actions权限

## 🔍 验证配置

配置完成后，可以手动触发测试：

1. 进入仓库 → Actions
2. 选择 "Generate Daily Problem"  
3. 点击 "Run workflow"
4. 观察是否成功运行

## ⚠️ 安全提醒

- ❌ 不要把API密钥写在代码中
- ❌ 不要把API密钥提交到Git
- ✅ 只在GitHub Secrets中配置
- ✅ Secrets会自动在日志中隐藏
