# CareBridge / 医路桥 - Vue 3 + TypeScript

现代化的医疗分诊与就诊准备助手前端，基于 Vue 3 Composition API + TypeScript 构建。

## 技术栈

- **Vue 3** - Composition API + `<script setup>`
- **TypeScript** - 严格类型检查
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Vite** - 构建工具
- **VueUse** - 实用组合式函数

## 项目结构

```
client/
├── src/
│   ├── assets/
│   │   └── main.css              # 全局样式系统
│   ├── components/
│   │   ├── NavBar.vue            # 导航栏
│   │   ├── Stepper.vue           # 步骤指示器
│   │   ├── IntakeCard.vue        # 患者信息录入
│   │   ├── FollowUpCard.vue      # 补充追问
│   │   ├── ResultCard.vue        # 分诊结果容器
│   │   ├── PresetSidebar.vue     # 快速体验预设
│   │   ├── SessionSidebar.vue    # 最近记录列表
│   │   ├── DisclaimerCard.vue    # 医疗免责声明
│   │   └── result/
│   │       ├── RiskTab.vue       # 风险分级标签
│   │       ├── SummaryTab.vue    # 就诊摘要标签
│   │       └── FollowUpTab.vue   # 随访记录标签
│   ├── router/
│   │   └── index.ts              # 路由配置
│   ├── services/
│   │   └── api.ts                # API 服务层
│   ├── stores/
│   │   └── triage.ts             # Pinia 状态管理
│   ├── types/
│   │   └── index.ts              # TypeScript 类型定义
│   ├── views/
│   │   ├── HomeView.vue          # 首页视图
│   │   └── SessionView.vue       # 会话详情视图
│   ├── App.vue                   # 根组件
│   ├── main.ts                   # 入口文件
│   └── env.d.ts                  # 环境类型声明
├── index.html                    # HTML 入口
├── tsconfig.json                 # TypeScript 配置
└── tsconfig.node.json            # Node.js TypeScript 配置
```

## 开发

```bash
# 安装依赖
npm install

# 启动后端服务器 (端口 4173)
npm start

# 启动 Vue 开发服务器 (端口 5173，带热重载)
npm run dev:client

# TypeScript 类型检查
npm run type-check

# 构建生产版本
npm run build
```

## 设计系统

基于 [UI UX Pro Max](https://uupm.cc) 医疗产品设计规则：

- **风格**: Accessible & Ethical + Soft UI Evolution
- **配色**: Medical Blue (#0077B6) + Health Green (#2D9C6F)
- **字体**: Inter (系统字体回退)
- **无障碍**: WCAG AA 标准，44px 最小触摸目标
- **响应式**: 375px / 768px / 1024px / 1440px 断点

## 类型定义

所有核心类型定义在 `src/types/index.ts`：

- `Patient` - 患者信息
- `SymptomInput` - 症状输入
- `TriageRequest` - 分诊请求
- `TriageResponse` - 分诊响应
- `Session` - 会话数据
- `RiskAssessment` - 风险评估
- `VisitSummary` - 就诊摘要
- `FollowUpRecord` - 随访记录

## 状态管理

使用 Pinia 进行状态管理，主要 store：

- `useTriageStore` - 管理分诊流程、会话状态、加载状态

## API 服务

所有 API 调用封装在 `src/services/api.ts`：

- `api.getSessions()` - 获取会话列表
- `api.getSession(id)` - 获取单个会话
- `api.submitTriage()` - 提交分诊
- `api.addFollowUp()` - 添加随访记录

## 路由

- `/` - 首页（症状录入 + 结果展示）
- `/session/:id` - 会话详情页
