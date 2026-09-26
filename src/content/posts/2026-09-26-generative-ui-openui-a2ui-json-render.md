---
title: "生成式 UI 技术方案对比报告：Thesys OpenUI、A2UI 与 json-render"
date: 2026-09-26 12:45:00 +0800
description: "使用 DeepSeek 对 Thesys OpenUI、A2UI 与 json-render 进行四场景三轮实测，比较 OpenUI Lang、协议消息与 JSON Spec 的真实用量、耗时及集成条件。"
categories: [AI]
tags: [生成式UI, OpenUI, A2UI, json-render, DeepSeek, 前端, Agent]
draft: false
---

## 摘要

评估对象为 Thesys OpenUI、A2UI 与 json-render，应用场景包括新闻资讯、行情图表、登录表单和业务仪表盘。Thesys OpenUI 是由 Thesys 维护的生成式 UI 开放标准与框架。

三套方案均接入 DeepSeek，并使用官方解析或渲染接口和相同的七种业务组件。OpenUI 输出 OpenUI Lang，A2UI 输出协议消息，json-render 输出组件 Spec。四个场景各重复三轮，正式样本共 36 次调用，输入数据、模型和采样参数一致。

本组样本中，OpenUI 的输出 Token 和完整响应耗时较少。计入语言说明与组件定义等输入内容后，总 Token 的差距小于仅比较输出的差距。结果反映本次任务、组件目录和提示词配置，不能直接推广为三个项目在所有任务中的性能排名。

## 一、评估范围与方法

### 1.1 实验对象

评估日期为 2026 年 9 月 26 日。业务数据为固定人工样例，不代表实时新闻、证券行情或生产经营数据。模型负责生成界面描述，未联网检索业务内容。运行时间与批次 ID 记录于原始响应文件。

| 项目 | 实验配置 |
| --- | --- |
| 模型接口 | DeepSeek Chat Completions，返回模型名 `deepseek-flash` |
| 共同参数 | `temperature=0`、`thinking=disabled`、`max_tokens=6000`、流式响应 |
| 输出模式 | OpenUI Lang 使用文本；A2UI 与 json-render 使用 `response_format=json_object` |
| 重复方式 | 四场景 × 三方案 × 三轮，串行请求，按场景和轮次轮换顺序 |
| 重试策略 | 不自动重试，不修补模型输出，不剔除失败样本 |
| OpenUI 实现 | `@openuidev/lang-core 0.3.0`、`@openuidev/react-lang 0.3.0` |
| A2UI 实现 | `@a2ui/react 0.11.1`、`@a2ui/web_core 0.11.0`，消息版本 `v0.9` |
| json-render 实现 | `@json-render/core 0.21.0`、`@json-render/react 0.21.0` |
| 业务组件 | Stack、Card、Text、Metric、Chart、Input、Button，三套方案共用实现 |
| 浏览器检查 | Google Chrome，桌面 1280 px 与移动宽度 390 px |

SDK 软件包版本与语言、协议版本分别记录。OpenUI 使用组件调用与引用的静态子集；A2UI 实际消息版本为 `v0.9`。模型配置见 [DeepSeek API 文档](https://api-docs.deepseek.com/api/create-chat-completion/)。

### 1.2 统计边界

Token 采用 API 返回的 `usage`，保存输入、输出、缓存命中与未命中记录。输入包含系统提示词、格式说明、组件属性及业务数据。OpenUI 提示词由官方 `library.prompt()` 生成；两种 JSON 方案使用格式说明与相同属性的 JSON Schema。提示词形式和长度不同，全部计入输入用量。输出语法、提示词形式及长度共同构成实验变量。

首内容耗时从发起请求开始，计至第一个非空 `content` 片段；完整响应耗时计至 SSE 的 `[DONE]`。计时包含网络、接口等待、生成和流读取，不含浏览器渲染。三套 Demo 均实时显示源码，在完整响应通过校验后展示界面，未比较渐进式 UI 首屏时间。

统计样本为同一批次的 36 次调用，每套方案各 12 次。四次 OpenUI 接入验证属于预实验，不计入统计。

字符数按 JavaScript 字符串长度统计，字节数按 UTF-8 编码统计；二者均不用于估算 Token。

## 二、技术架构

### 2.1 Thesys OpenUI

OpenUI 由 Thesys 维护，定位为生成式 UI 的开放标准与框架。其核心 OpenUI Lang 以组件调用和引用描述界面，模型输出由客户端映射至已注册组件，界面功能由组件实现。官方提供语言核心、React 渲染运行时、组件库和对话界面等软件包。[OpenUI 官方网站](https://www.openui.com/)、[项目仓库](https://github.com/thesysdev/openui)

实验实现使用官方 `defineComponent` 与 `createLibrary` 注册七种业务组件，使用 `createParser` 解析模型输出，再交由 `@openuidev/react-lang` 的 `Renderer` 渲染。组件的 Zod 属性顺序决定 OpenUI Lang 的位置参数。系统提示词由同一组件库自动生成。[组件定义文档](https://www.openui.com/docs/openui-lang/defining-components)、[提示词文档](https://www.openui.com/docs/openui-lang/system-prompts)

OpenUI Lang 支持流式解析和渐进式渲染。实验采用完整响应后渲染的方式；OpenUI Cloud、Gateway、Autofix、远端工具、动态状态和多轮编辑不在评估范围内。[渲染器文档](https://www.openui.com/docs/openui-lang/renderer)

### 2.2 A2UI

A2UI 使用声明式消息描述界面，由客户端按照组件目录渲染。协议支持界面创建、组件更新、数据模型更新和用户动作。跨端映射要求各客户端实现对应的组件和属性。[官方项目说明](https://github.com/a2ui-project/a2ui)

实验实现使用官方 `MessageProcessor` 处理 `createSurface` 与 `updateComponents` 消息，再由官方 `A2uiSurface` 渲染。组件属性由 Zod 定义，Stack 和 Card 通过组件 ID 引用子节点。图表及表单属于自定义目录内的业务组件。消息采用静态字面值，本次未评测动态数据绑定、多轮增量更新或远端 Agent 动作。

### 2.3 json-render

json-render 通过 Catalog 定义组件属性，通过 Registry 关联组件实现，再由 Renderer 渲染 Spec。官方项目同时提供状态绑定、动作和渐进式生成能力。[官方项目说明](https://github.com/vercel-labs/json-render)

实验实现使用官方 `defineCatalog`、`defineRegistry` 与 `Renderer`。模型输出由 `root` 和 `elements` 构成的扁平 Spec，属性使用与 A2UI 等价的 Schema。服务端执行官方目录校验，并检查节点引用、循环、孤立节点及图表数据长度。测试未启用 SpecStream、动态表达式或多轮状态更新。

### 2.4 架构对照

| 项目 | Thesys OpenUI | A2UI | json-render |
| --- | --- | --- | --- |
| 技术形态 | 生成式 UI 开放标准与框架 | 声明式 UI 协议及相关实现 | 生成式 UI 框架 |
| 实验输出 | OpenUI Lang 组件调用与引用 | createSurface、updateComponents 消息 | root 与 elements Spec |
| 解析与渲染实现 | 官方 createParser 与 React Renderer | 官方 MessageProcessor 与 A2uiSurface | 官方 Catalog、Registry 与 Renderer |
| 组件约束 | Library 与 Zod 属性 | Catalog 与属性 Schema | Catalog 与属性 Schema |
| 参数组织 | 按组件属性顺序传入位置参数 | 组件消息中的具名字段 | props 对象及 children 引用 |
| 图表与表单 | 共用宿主业务组件 | 相同 | 相同 |
| 流式展示方式 | 实时源码，校验后展示界面 | 相同 | 相同 |
| 未评估能力 | 渐进式渲染、状态绑定、工具和增量编辑 | 数据模型更新、多轮消息及远端动作 | SpecStream、状态绑定和多轮动作 |

三套方案均依赖宿主组件实现，模型不生成图表绘制或表单校验的执行代码。比较重点是界面描述、输入约束、模型用量及完整响应时间；组件开发投入仍需在工程成本中单独计算。

## 三、场景结果

### 3.1 新闻资讯

输入包含三条固定新闻，每条均有标题、日期、来源和摘要。三套方案按原顺序展示内容，浏览器检查逐项比对文本。图 1—图 6 均采用第一轮生成结果。

![Thesys OpenUI 真实生成的新闻资讯页](/images/posts/generative-ui-comparison/openui-news.png)

图 1：Thesys OpenUI，OpenUI Lang 通过官方 React Renderer 映射为新闻组件。

![A2UI 官方渲染器展示的新闻资讯页](/images/posts/generative-ui-comparison/a2ui-news.png)

图 2：A2UI，模型生成组件消息，客户端按目录渲染。

![json-render 官方渲染器展示的新闻资讯页](/images/posts/generative-ui-comparison/json-render-news.png)

图 3：json-render，通过 Registry 渲染 Spec。

OpenUI 第一轮资讯样本同时使用 Card 标题与 Text 标题，出现重复标题。新闻内容完整，标题重复构成可见的排版冗余。

新闻内容相同，但模型选择的容器、标题和分组方式可能不同。组件拆分粒度会改变描述长度，因此还需结合输出内容和完整输入用量解释 Token 差异。

### 3.2 行情图表

输入包含八个日期、八个收盘价、最后收盘价 108.00、涨跌幅 +8.00%，以及固定演示数据说明。三套方案均通过同一个 SVG Chart 组件展示折线和数据点。

![Thesys OpenUI 真实生成的行情图表](/images/posts/generative-ui-comparison/openui-market.png)

图 4：Thesys OpenUI，Chart 调用的位置参数包含标题、日期与价格数组。

![A2UI 真实生成的行情图表](/images/posts/generative-ui-comparison/a2ui-market.png)

图 5：A2UI，通过 Chart 组件字段传递相同业务数据。

![json-render 真实生成的行情图表](/images/posts/generative-ui-comparison/json-render-market.png)

图 6：json-render，通过 Chart 的 props 传递相同业务数据。

图表评估范围为静态折线与数据点展示，不包括缩放、实时订阅、复杂指标叠加或触控交互。

### 3.3 登录表单

任务要求电子邮箱、密码、提交和重置，以及明确的本地校验反馈。邮箱应符合基本格式，密码至少八位；页面不执行身份认证或向外发送表单数据。三套方案均使用相同的 Input 和 Button 实现。

浏览器依次执行无效邮箱、短密码、有效输入和重置操作，检查反馈与输入状态。表单评估范围为本地交互；账户系统、会话管理和服务端鉴权未纳入测试。

### 3.4 业务仪表盘

输入包含销售额 ¥128,600、订单数 846、客单价 ¥152.01、转化率 3.8%，以及七日订单序列。三套方案均通过 Metric 与 Chart 组件展示指标和折线图。仪表盘采用固定样例数据，不具备数据刷新功能。

## 四、量化结果

### 4.1 实际 Token

每个场景的数值为三次调用的中位数。输入包含全部生成约束及业务数据，总 Token 采用 API 返回的输入与输出合计。

| 场景 | 方案 | 输入 Token | 输出 Token | 总 Token |
| --- | --- | ---: | ---: | ---: |
| 新闻资讯 | Thesys OpenUI | 947 | 313 | 1,260 |
| 新闻资讯 | A2UI | 896 | 468 | 1,364 |
| 新闻资讯 | json-render | 852 | 466 | 1,318 |
| 行情图表 | Thesys OpenUI | 913 | 208 | 1,121 |
| 行情图表 | A2UI | 862 | 539 | 1,401 |
| 行情图表 | json-render | 818 | 514 | 1,332 |
| 登录表单 | Thesys OpenUI | 871 | 136 | 1,007 |
| 登录表单 | A2UI | 820 | 297 | 1,117 |
| 登录表单 | json-render | 776 | 269 | 1,045 |
| 业务仪表盘 | Thesys OpenUI | 914 | 185 | 1,099 |
| 业务仪表盘 | A2UI | 863 | 311 | 1,174 |
| 业务仪表盘 | json-render | 819 | 299 | 1,118 |

各方案全部 12 次正式调用的累计用量如下。缓存命中属于输入的一部分，不应再加到输入总数中。

| 方案 | 输入 Token | 其中缓存命中 | 输出 Token | 合计 Token |
| --- | ---: | ---: | ---: | ---: |
| Thesys OpenUI | 10,935 | 8,832 | 2,543 | 13,478 |
| A2UI | 10,323 | 7,680 | 4,857 | 15,180 |
| json-render | 9,795 | 7,680 | 4,655 | 14,450 |

OpenUI 的累计输出 Token 比 A2UI 少 47.6%，比 json-render 少 45.4%。但 OpenUI 的输入为 10,935 Token，高于另两项。计入输入后，OpenUI 的总 Token 比 A2UI 少 11.2%，比 json-render 少 6.7%。

输出 Token 的降幅高于总 Token 的降幅。费用计算还涉及输入缓存命中、未命中及输出的不同单价；上述比例衡量 Token 用量差异，不代表实际费用降幅。

### 4.2 首内容与完整响应耗时

单位为秒。首内容与完整响应列为三次中位数，末列为完整响应的最小值与最大值。

| 场景 | 方案 | 首内容 | 完整响应 | 完整响应范围 |
| --- | --- | ---: | ---: | ---: |
| 新闻资讯 | Thesys OpenUI | 0.55 | 1.47 | 1.47–1.56 |
| 新闻资讯 | A2UI | 0.46 | 1.77 | 1.56–2.17 |
| 新闻资讯 | json-render | 0.40 | 1.62 | 1.41–2.03 |
| 行情图表 | Thesys OpenUI | 0.54 | 1.24 | 1.24–1.26 |
| 行情图表 | A2UI | 0.52 | 1.98 | 1.87–2.10 |
| 行情图表 | json-render | 0.49 | 1.86 | 1.81–1.89 |
| 登录表单 | Thesys OpenUI | 0.37 | 0.94 | 0.81–1.03 |
| 登录表单 | A2UI | 0.53 | 1.56 | 1.21–1.67 |
| 登录表单 | json-render | 0.38 | 1.54 | 1.11–1.59 |
| 业务仪表盘 | Thesys OpenUI | 0.57 | 1.19 | 1.06–1.36 |
| 业务仪表盘 | A2UI | 0.60 | 1.55 | 1.46–1.62 |
| 业务仪表盘 | json-render | 0.63 | 1.39 | 1.36–1.46 |

OpenUI 在四个场景中的完整响应中位数均较少，首内容耗时没有保持相同排序。输出长度、系统提示词、缓存、接口等待和网络均会影响结果；实验未控制冷缓存，计时范围不含客户端渲染。

每个条件只重复三次，最小值和最大值是观测范围，不是置信区间。测试未覆盖高并发、模型高峰负载、长会话及跨区域网络。

### 4.3 输出规模

每格依次为字符数与 UTF-8 字节数的中位数，单位为“字符 / 字节”。

| 场景 | Thesys OpenUI | A2UI | json-render |
| --- | ---: | ---: | ---: |
| 新闻资讯 | 751 / 1,070 | 1,424 / 1,678 | 1,380 / 1,616 |
| 行情图表 | 547 / 637 | 1,655 / 1,761 | 1,505 / 1,605 |
| 登录表单 | 432 / 530 | 1,013 / 1,209 | 915 / 1,069 |
| 业务仪表盘 | 444 / 538 | 1,016 / 1,118 | 939 / 1,041 |

位置参数省去重复属性名，但容器拆分和重复文本同样影响输出规模。统计保留各方案生成的原始节点结构。DOM 元素数、组件实例数和顶层节点数属于不同指标，复杂度比较需采用统一口径。

### 4.4 校验与浏览器结果

正式 36 次调用均正常结束、返回 usage 并通过对应结构检查。OpenUI 检查官方解析器错误、未解析引用、孤立语句及属性；A2UI 检查官方消息与组件属性；json-render 检查官方目录与属性。宿主还检查图结构或嵌套组件、图表数组长度。这些检查不等于完整安全审计。

22 项工程测试覆盖流式分片、截断、凭据缺失、HTTP 失败、JSON 模式、OpenUI 解析、未知组件、属性类型和引用完整性等。36 份输出均通过本次浏览器检查，检查内容包括新闻文本、行情数据、指标、图表、表单反馈和重置，以及 390 px 宽度下的横向溢出。逐项检查结果保存于测试记录。

生产登录、远端业务动作、多轮状态和无障碍测试不在本轮验收范围内。

## 五、安全机制与集成要求

### 5.1 组件目录与输出校验

三套方案均将模型输出映射为已注册组件。OpenUI Lang 的组件调用由官方解析器解释，不作为 JavaScript 执行；A2UI 与 json-render 通过消息、目录和属性校验限制可用能力。实验渲染入口仅接受对应的界面描述格式。

客户端仍需拒绝未知组件、无效属性、缺失引用和不完整输出。OpenUI 的流式解析器可以保留部分可渲染内容，完整性校验在响应结束后检查解析错误、未解析引用和孤立语句。

### 5.2 数据与动作权限

三个 Demo 的图表只读取数字数组，按钮仅能调用宿主允许的本地 submit 或 reset。没有配置远端工具、业务请求或身份认证。添加具备网络请求、文件访问或数据修改能力的组件后，必须单独设置权限与审计。

Schema 校验处理结构与类型，业务鉴权处理对象归属和操作范围。开放标准、声明式语言及 JSON 格式均不能替代服务端授权。

### 5.3 集成检查

| 检查项 | 实施要求 |
| --- | --- |
| 组件兼容 | 记录库或目录版本及各端支持的组件、属性和动作 |
| 输出处理 | 明确解析失败、生成中断、未知组件与引用错误的处理 |
| 状态管理 | 验证增量更新不会覆盖输入或造成重复提交 |
| 数据与动作 | 服务端核验数据范围、对象归属和操作权限 |
| 运行记录 | 保存请求配置、校验失败、模型用量及动作结果 |
| 凭据 | 服务端读取配置，不进入前端代码与发布包 |

## 六、项目支持与社区情况

### 6.1 项目与版本

| 项目 | Thesys OpenUI | A2UI | json-render |
| --- | --- | --- | --- |
| 维护组织 | Thesys | Google 发起的 A2UI 项目 | Vercel Labs |
| 开源许可 | MIT | Apache-2.0 | Apache-2.0 |
| GitHub Star 近似值 | 9.8k | 16.5k | 18.3k |
| 交付形式 | OpenUI Lang、语言核心、渲染器、组件库及配套工具 | 协议、SDK 与渲染器 | `@json-render/*` 包 |
| 文档入口 | openui.com | a2ui.org | json-render.dev |
| 版本区分 | 实验 SDK 0.3.0；文档另列 OpenUI Lang 语言版本 | 实验消息 v0.9；SDK 版本单独记录 | 实验核心及 React 包 0.21.0 |

Star 为评估日仓库显示的近似值，不代表生产使用规模。[Thesys OpenUI 仓库](https://github.com/thesysdev/openui)、[A2UI 仓库](https://github.com/a2ui-project/a2ui)、[json-render 仓库](https://github.com/vercel-labs/json-render)。依赖版本由源码包中的 lockfile 固定；语言规范与软件包分别标注版本。

### 6.2 SDK 与渲染器

A2UI 提供官方实现，也收录第三方渲染器。社区目录涵盖 React、Vue、Svelte、Android、Apple 原生平台、React Native、Lynx 和 Material UI 等，并列明不同协议版本的支持情况。官方 `@a2ui/react` 与社区 React 包需要分别识别。渲染器数量不等同于全部实现都支持相同协议版本。[A2UI 渲染器目录](https://a2ui.org/ecosystem/renderers/)

json-render 提供各目标平台的包，以及 shadcn/ui、状态管理适配和 MCP 集成。React Native 渲染器支持移动端原生视图，框架支持范围不局限于浏览器。[渲染器文档](https://json-render.dev/docs/renderers)、[安装与状态适配文档](https://json-render.dev/docs/installation)

OpenUI 将无框架依赖的语言核心与渲染运行时分开，官方提供 React 支持，并维护组件库和集成包。接入时可以复用现有业务组件；开源框架支持直接接入模型接口，实验采用 DeepSeek Chat Completions。[OpenUI 软件包说明](https://github.com/thesysdev/openui)

### 6.3 社区指标的适用范围

Star、软件包下载量、发布数量和技术文章数量分别反映不同活动，不能合并为生产采用率。软件包周下载量需注明统计周及包清单，同一应用可能同时下载多个包。缺少统计周期和包范围的下载总量不具备可比性；教程数量反映技术传播情况，不能用于估计企业使用规模。

维护情况应结合发布记录、提交历史和问题处理情况判断。仅凭项目创建时间、曾经的传播热度或单一版本号，不能确认项目已经停止维护。

## 七、行业采用与技术传播

### 7.1 Thesys OpenUI

OpenUI 官方维护的采用者目录列出 Standard Metrics、GAIA、Oodle 等团队，并描述了对话组件、可观测性界面等用途。目录属于项目收录的使用声明，不代表独立审计的生产覆盖率或商业关系。[OpenUI 采用者目录](https://github.com/thesysdev/openui/blob/main/ADOPTERS.md)

同一目录列出 assistant-ui、Lynx、LangChain 和 Mastra 的集成信息。这些条目可以说明工程接入路径，不能据此推导企业用户总量。Thesys 提供的 OpenUI Cloud 与开源框架也应分别评价：本次测试对象为开源语言及 React 渲染器，不包含托管服务的纠错、路由或运行保障。

### 7.2 A2UI

Google Opal 团队参与 A2UI 开发，并将其用于动态界面。Flutter GenUI SDK 使用 A2UI 连接服务端 Agent 与 Flutter 客户端。CopilotKit 提供 AG-UI 与 A2UI 的集成支持。[A2UI 官方应用案例](https://a2ui.org/ecosystem/a2ui-in-the-world/)

Gemini Enterprise 已提供 A2UI Agent 的部署与注册文档，使用 A2A 端点传递界面描述。该集成有明确的产品接入路径，但不能据此推定所有 Agent 注册方式都支持 A2UI。[Google Cloud 接入指南](https://cloud.google.com/blog/topics/developers-practitioners/guide-to-gemini-enterprise-and-a2ui-integration)、[Cloud Run 部署教程](https://docs.cloud.google.com/gemini/enterprise/docs/a2ui-agents/tutorial-host-agent-cloud-run)

国内移动端项目 AGenUI 提供 iOS、Android 和 HarmonyOS 的 A2UI 渲染能力，采用共享 C++ 核心及各平台原生渲染实现，支持自定义组件和函数调用。该项目已被 A2UI 社区目录收录，官网位于高德域名下。[AGenUI 项目](https://github.com/AGenUI/AGenUI)、[高德 AGenUI 官网](https://genui.amap.com/)

### 7.3 json-render

json-render 的工程集成包括 Vercel AI SDK、shadcn/ui，以及 Next.js、TanStack Start 等应用框架。多端渲染、状态绑定和渐进式更新均有官方文档或代码示例。[快速接入示例](https://json-render.dev/docs/quick-start)、[发布记录](https://github.com/vercel-labs/json-render/releases)

框架适配与企业生产使用属于不同统计对象。上述集成信息未提供企业生产用户数量。媒体报道、开发者讨论及个人贡献者参与可说明技术传播情况，但不能替代具体部署案例和运行数据。

## 八、Agent 协议分工

| 协议 | 主要职责 | 与生成式 UI 的关系 |
| --- | --- | --- |
| MCP | 连接 AI 应用与工具、资源及外部数据 | 为 Agent 提供业务能力与上下文 |
| A2A | Agent 之间的任务协作与消息交换 | 可承载返回给客户端的界面内容 |
| AG-UI | Agent 与前端之间的事件、状态及交互通信 | 组织实时交互过程 |
| A2UI | 描述界面组件、数据及更新 | 由客户端映射为可交互界面 |

协议职责分别见 [MCP 文档](https://modelcontextprotocol.io/docs/getting-started/intro)、[A2A 文档](https://a2a-protocol.org/latest/)、[AG-UI 文档](https://docs.ag-ui.com/introduction)和 [A2UI 文档](https://a2ui.org/)。

A2UI 与 AG-UI 可以配合使用：AG-UI 处理 Agent 与应用的交互事件，A2UI 描述其中需要渲染的界面。Gemini Enterprise 的接入示例采用 A2A 传递 A2UI 内容。具体传输方式由应用选择，使用 A2UI 不要求同时部署全部协议。

## 九、优势与限制

| 方案 | 主要优势 | 主要限制 |
| --- | --- | --- |
| Thesys OpenUI | OpenUI Lang 使用紧凑位置参数；可从组件库生成提示词；官方支持流式解析和 React 渲染 | 需要维护组件库及参数顺序；新语言需写入提示词；部分可渲染输出仍须检查完整性 |
| A2UI | 界面描述与客户端实现分离；协议包含数据模型及增量更新；适合统一多端组件映射 | 需要维护目录和客户端兼容性；消息封装与具名字段占用输出 |
| json-render | Catalog、Registry 与 Renderer 分工明确；便于接入已有组件、状态及动作机制 | 需要维护目录和目标端实现；Spec 长度受节点拆分影响 |

三套方案均可复用图表和表单组件。视觉质量与业务能力取决于组件实现和模型组合结果，不能按 OpenUI Lang 或 JSON 的格式名称直接排序。

## 十、选型结论

| 应用条件 | 可评估方案 | 实施条件 |
| --- | --- | --- |
| 重视描述紧凑程度，并希望接入流式组件渲染 | Thesys OpenUI | 定义组件库和位置参数，生成提示词，接入解析错误处理 |
| 多客户端接收 Agent 生成的统一界面描述 | A2UI | 统一协议与目录版本，完成各端组件和事件映射 |
| 现有组件库中接入 JSON 描述的动态卡片和表单 | json-render | 建立 Catalog 与 Registry，接入应用状态和业务动作 |
| 需要稳定的图表、表单和业务控件 | 三者均可采用 | 先实现和测试受控组件，再决定描述和传输方式 |

在四个场景的三轮测试中，OpenUI Lang 的累计输出 Token 最少，各场景完整响应耗时的中位数均低于另外两套方案。总调用量还包含输入，实际费用还区分输入缓存命中、未命中和输出单价。选型中的用量与费用估算应采用目标业务的提示词、组件目录和计费条件。

评估范围限于单轮静态界面生成与本地交互，未覆盖多轮 Agent 交互、渐进式首屏、动态工具、复杂实时图表、生产鉴权或长期运行稳定性。这些能力需在目标系统中单独验收。

## 十一、数据与代码

[实验源码与完整测试记录](/downloads/generative-ui-deepseek-demo.zip)包含依赖锁定文件、提示词、原始响应、汇总数据、单元测试及浏览器检查脚本。统计数据另提供 [JSON 汇总文件](/downloads/generative-ui-deepseek-summary.json)和[逐次调用 CSV](/downloads/generative-ui-deepseek-runs.csv)。

业务任务与输入数据定义于 `lib/scenarios.mjs`，格式约束和组件 Schema 定义于 `lib/prompts.mjs` 与 `lib/catalog.mjs`。单次调用记录包含完整提示词、返回模型名、请求 ID、usage、耗时及原始输出。场景截图对应第一轮新闻与行情样本，可通过运行 ID 回放。

复现环境为 Node.js 24、npm 和 Google Chrome，安装与运行命令见源码包 README。模型温度为零仍可能产生不同输出；缓存状态、服务负载和模型更新也会影响耗时。不同批次应分别统计并保留原始记录。

## 参考资料

- [DeepSeek Chat Completions：流式响应、usage 与 JSON 输出模式](https://api-docs.deepseek.com/api/create-chat-completion/)
- [Thesys OpenUI：生成式 UI 开放标准与框架](https://github.com/thesysdev/openui)
- [OpenUI Lang 与官方渲染器](https://www.openui.com/docs/openui-lang)
- [A2UI：协议、组件目录与客户端实现](https://github.com/a2ui-project/a2ui)
- [json-render：Catalog、Registry 与渲染器](https://github.com/vercel-labs/json-render)
- [A2UI 官方应用案例](https://a2ui.org/ecosystem/a2ui-in-the-world/)
- [A2UI 社区渲染器](https://a2ui.org/ecosystem/renderers/)
- [Google Cloud：Gemini Enterprise 与 A2UI 接入](https://cloud.google.com/blog/topics/developers-practitioners/guide-to-gemini-enterprise-and-a2ui-integration)
- [AGenUI 项目](https://github.com/AGenUI/AGenUI)
- [json-render 官方文档](https://json-render.dev/docs)
