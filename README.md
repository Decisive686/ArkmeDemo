# Arkme Demo — 即我「安排」模块

移动端前端 Demo，展示「即我」app 的安排模块核心体验。

## 本地测试入口

```bash
pnpm install
pnpm dev
```

- 移动端 Demo：http://127.0.0.1:5173/
- 消息测试后台：http://127.0.0.1:5173/sendtest

## 功能

### 安排

从首页自然浮现的任务管理模块，不在底部导航栏中，避免"待办堆积"的心理负担。

- **AI 自动识别**：通过消息测试后台发送对话内容，AI 漏斗系统自动分析并生成候选安排
- **手动创建**：支持填写标题、时间、地点、相关人、备注、执行方式
- **生命周期管理**：候选安排 → 用户确认 → 正式安排 → 完成/归档
- **关注度分层**：今日关注 / 近期 / 待确认 / 以后再说 / 低打扰
- **执行方式**：纯人工 / AI 辅助 / AI 自动
- **多来源合并**：多条对话指向同一事件时自动合并，详情保留全部来源上下文

### 消息测试后台

独立的测试控制台（`/sendtest`），可创建多个测试身份，以私聊或群聊方式向移动端 Demo 发消息，验证 AI 识别和消息接收能力。

### AI 信息漏斗

将生活流文本（对话、自言自语等）经过语义切片、四向分流（记忆/情绪/灵感/安排）、关系识别、安全判断等多层分析，输出结构化的 FunnelResult。

支持两种模式：
- **mock**：规则匹配 + 预置样例，无需 API Key，默认可用
- **openai**：调用 OpenAI 兼容接口，支持自定义 API Key / BaseUrl / Model

## 技术栈

| 技术 | 版本 |
|------|------|
| React | 18.3 |
| TypeScript | 5.5 |
| Vite | 5.3 |
| Tailwind CSS | 3.4 |
| pnpm | 9.12+ |

数据持久化：localStorage
多语言：16 种语言

## 项目结构

```
src/
├── pages/                   # 页面
│   ├── Home.tsx             # 主页（安排入口 + 侧边栏）
│   └── AdminMessageConsole.tsx  # 消息测试后台
├── components/              # 组件
│   └── ArrangementExperience.tsx  # 安排模块 UI（列表、详情、编辑器、API 设置）
├── data/                    # 数据层
│   ├── arrangements.ts      # 安排 CRUD、排序、合并
│   ├── funnelRules.ts       # mock 漏斗规则
│   ├── funnelFixtures.ts    # mock 精确样例
│   ├── funnelHomeSections.ts # 首页分区聚合
│   └── testConversations.ts # 测试对话数据
├── services/ai/             # AI 服务
│   ├── analyzeLifeStream.ts # 生活流分析入口
│   ├── funnelPrompt.ts      # Prompt 构建
│   ├── funnelResultSchema.ts # 输出校验
│   ├── mockAnalyzeLifeStream.ts    # mock 实现
│   └── openaiAnalyzeLifeStream.ts  # OpenAI 调用
├── types/                   # 类型定义
│   ├── arrangement.ts       # 安排类型
│   └── funnel.ts            # FunnelResult 结构
└── settings/
    └── preferences.ts       # 主题、语言、强调色
```

## 开发命令

```bash
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm lint             # 代码检查
pnpm verify:answer    # 完整验证（lint + build + 日志检查）
```

## 相关文档

- [候选人答题规范](docs/candidate-rules.md)
- [安排模块 PRD](docs/PRD.md)
- [安排信息漏斗约束](docs/arrangement-funnel.md)
- [FunnelResult 输出契约](docs/funnel-result-contract.md)
- [安排模块原始需求](docs/arrangements-requirements.md)
