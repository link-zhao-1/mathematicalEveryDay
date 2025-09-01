#!/bin/bash

# Mathematical Everyday - GitHub Actions 快速部署脚本

echo "🚀 Mathematical Everyday GitHub Actions 部署向导"
echo "=================================================="

# 检查Git仓库
if [ ! -d ".git" ]; then
    echo "❌ 错误: 请在Git仓库根目录运行此脚本"
    exit 1
fi

# 检查是否有远程仓库
REMOTE_URL=$(git config --get remote.origin.url 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo "❌ 错误: 请先设置Git远程仓库"
    echo "运行: git remote add origin <your-repo-url>"
    exit 1
fi

echo "✅ Git仓库检查通过: $REMOTE_URL"

# 创建必要的目录
mkdir -p .github/workflows
echo "📁 创建 .github/workflows 目录"

# 检查workflow文件
WORKFLOWS=("generate-problem.yml" "generate-answer.yml" "daily-problem.yml")
for workflow in "${WORKFLOWS[@]}"; do
    if [ -f ".github/workflows/$workflow" ]; then
        echo "✅ Workflow文件已存在: $workflow"
    else
        echo "❌ 缺少workflow文件: $workflow"
    fi
done

# 提交workflow文件
echo ""
echo "📝 提交GitHub Actions配置..."
git add .github/
git add GITHUB_ACTIONS_DEPLOYMENT.md
git add setup-github-actions.sh

if git diff --staged --quiet; then
    echo "ℹ️  没有新的更改需要提交"
else
    git commit -m "🚀 Add GitHub Actions workflows for automated deployment

✨ Features:
- Daily problem generation (9:00 AM Beijing Time)  
- Daily answer generation (8:00 PM Beijing Time)
- Weekly maintenance and statistics
- Manual trigger support
- Duplicate prevention
- Automatic README updates

📋 Workflows:
- generate-problem.yml: Daily problem generation
- generate-answer.yml: Daily answer generation  
- daily-problem.yml: Comprehensive management

🔧 Setup:
- Requires AI API keys in Repository Secrets
- Needs write permissions for Actions
- Supports multiple AI models (DeepSeek, Doubao, OpenAI)"

    echo "✅ Workflows committed successfully"
fi

echo ""
echo "🎯 接下来的配置步骤:"
echo "=============================="
echo ""

echo "1. 推送到GitHub:"
echo "   git push origin main"
echo ""

echo "2. 在GitHub仓库中设置Secrets:"
echo "   Settings → Secrets and variables → Actions → New repository secret"
echo ""

echo "   必需的Secrets (选择一个AI模型):"
echo "   - DEEPSEEK_API_KEY: sk-your-deepseek-key"
echo "   - DOUBAO_API_KEY: your-doubao-key"  
echo "   - OPENAI_API_KEY: sk-your-openai-key"
echo ""

echo "3. 设置Repository Variables:"
echo "   Settings → Secrets and variables → Actions → Variables"
echo ""
echo "   - AI_MODEL: deepseek (或 doubao, openai)"
echo ""

echo "4. 启用GitHub Actions权限:"
echo "   Settings → Actions → General"
echo "   - Allow all actions and reusable workflows"
echo "   - Read and write permissions"
echo "   - Allow GitHub Actions to create and approve pull requests"
echo ""

echo "5. 手动测试运行:"
echo "   Actions → Generate Daily Problem → Run workflow"
echo ""

echo "🎉 部署完成后，系统将自动:"
echo "- 每天09:00生成新题目"  
echo "- 每天20:00生成答案"
echo "- 每周日进行维护"
echo "- 自动更新README"
echo "- 自动提交到Git"
echo ""

echo "📚 详细说明请查看: GITHUB_ACTIONS_DEPLOYMENT.md"
echo ""

# 获取仓库信息用于快速链接
REPO_URL=$(echo "$REMOTE_URL" | sed 's/\.git$//')
if [[ $REPO_URL == *"github.com"* ]]; then
    echo "🔗 快速链接:"
    echo "   仓库设置: ${REPO_URL}/settings"
    echo "   Actions页面: ${REPO_URL}/actions"
    echo "   Secrets设置: ${REPO_URL}/settings/secrets/actions"
fi

echo ""
echo "✨ GitHub Actions部署准备完成!"
