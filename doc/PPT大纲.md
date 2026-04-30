# CareBridge / 医路桥 PPT 大纲

## Slide 1. Title

**CareBridge / 医路桥**  
AI Triage & Visit Preparation Assistant for Underserved Patients

可补充一句副标题：
让患者在见到医生之前，就完成更清晰、更安全的就医准备。

## Slide 2. Problem

标题建议：
**医疗资源不均，不只是“看病难”，更是“就医前判断难”**

核心内容：

- 很多基层和偏远地区患者不知道什么时候该去医院
- 用户常常不会准确描述症状
- 去错科室、拖延就医、重复沟通很常见
- 医生接诊前缺少结构化病情信息

一句总结：
医疗问题不总是始于诊断能力不足，很多时候始于信息混乱和行动延迟。

## Slide 3. Who We Serve

标题建议：
**Target Users**

核心内容：

- 基层和偏远地区普通患者
- 需要家属协助就医的老人
- 不知道挂什么科的首次就医用户
- 社区/基层医生与接诊医生

展示建议：
这一页可以放 2-4 个用户画像卡片。

## Slide 4. Existing Pain Points

标题建议：
**Current Pain Points in the Care Journey**

核心内容：

- 症状描述碎片化
- 紧急程度判断不准
- 家属协作困难
- 医生问诊前准备不足

展示建议：
用一条患者旅程线，从“症状出现”到“进入医院”标出断点。

## Slide 5. Our Solution

标题建议：
**Introducing CareBridge**

核心内容：

CareBridge 是一个 AI 分诊与就医准备助手，能够：

- 采集自然语言症状
- 进行动态追问
- 进行风险分层
- 推荐下一步行动与科室
- 自动生成病情摘要
- 支持后续症状追踪

一句总结：
We do not replace doctors. We prepare patients better.

## Slide 6. Product Flow

标题建议：
**How It Works**

流程建议：

1. 用户输入症状
2. 系统追问关键问题
3. 风险等级判断
4. 输出行动建议
5. 生成病情摘要
6. 持续随访记录

展示建议：
这页用流程图最清晰。

## Slide 7. Key Features

标题建议：
**Core Features**

拆成 4-5 个模块卡片：

- Symptom Intake
- Risk Stratification
- Department Recommendation
- Visit Summary
- Follow-up Tracking

每个模块只写一句价值说明，避免字太多。

## Slide 8. Multi-Role Value

标题建议：
**Value for Patients, Families, and Doctors**

核心内容：

- 患者：更清楚地知道下一步做什么
- 家属：更容易代为整理病情
- 基层医生：更快获取重点信息
- 接诊医生：减少重复问询，提高效率

这一页很重要，因为它能体现项目不只是“AI 功能”，而是完整服务链价值。

## Slide 9. Safety Boundaries

标题建议：
**Medical Safety Boundaries**

核心内容：

- 不提供最终医学诊断
- 不替代医生面诊
- 红旗症状优先建议急诊或线下就医
- 对高不确定性情况采取保守建议
- 用户健康信息应进行安全保护

这一页很加分，会让评委觉得你有医疗责任感。

## Slide 10. Technical Architecture

标题建议：
**Technical Design**

核心内容：

- Frontend: React / Next.js
- Backend: Node.js
- Database: Supabase / Firebase
- AI: symptom parsing, follow-up prompts, summary generation
- Rules Engine: red-flag detection and risk boundary control

重点说明：
风险分层不是完全依赖大模型自由输出，而是“规则 + AI 辅助解释”的组合。

## Slide 11. Demo Story

标题建议：
**Demo Scenario**

场景建议：

一位县城周边用户连续发热、咳嗽并伴随轻微胸闷，不知道是否需要马上就医。  
CareBridge 通过追问识别风险，建议 24 小时内线下就医，并生成可直接出示给医生的病情摘要。

这一页是后面视频演示的桥。

## Slide 12. Impact

标题建议：
**Why This Matters**

核心内容：

- 提升基层与偏远地区用户的医疗入口可及性
- 减少延误就医与错误分流
- 提高患者表达质量和医生接诊效率
- 为更公平、更高效的医疗服务提供辅助工具

## Slide 13. Future Scope

标题建议：
**Future Roadmap**

可以写：

- 语音输入与语音播报
- 方言/多语言支持
- 慢病专病版本
- 基层诊所合作转诊模块
- 医生端摘要工作台

## Slide 14. Closing

标题建议：
**CareBridge: Helping Patients Reach Care Earlier, Safer, and Better Prepared**

收尾话术建议：

CareBridge 不是让 AI 替医生做决定，而是让更多患者在真正见到医生之前，就已经完成更有质量的医疗准备。  
在医疗资源不均衡的现实下，这种“更早一步的帮助”本身就是有价值的创新。
