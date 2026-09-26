---
title: "生成式 UI 技术方案对比报告：OpenUI、A2UI 与 json-render"
date: 2026-09-26 12:45:00 +0800
description: "使用 DeepSeek 对 HTML 代码生成、A2UI 与 json-render 进行四场景、三轮真实调用测试，比较实际 Token、响应耗时、渲染结果与集成条件。"
categories: [AI]
tags: [生成式UI, OpenUI, A2UI, json-render, DeepSeek, 前端, Agent]
draft: false
---

## 摘要

本报告比较 HTML 代码生成、A2UI 与 json-render 三条生成式 UI 路线，覆盖新闻资讯、行情图表、登录表单和业务仪表盘。三条路线均调用 DeepSeek，统一业务输入、模型和采样参数，按每场景三轮执行，共取得 36 份正式响应。

HTML 路线由模型生成 HTML、CSS 和 JavaScript，在隔离的 iframe 内运行；A2UI 与 json-render 使用官方 React 渲染器，并共享图表、表单等业务组件。本实验未部署 W&B OpenUI 官方应用，HTML 数据只用于分析其所代表的代码生成方式，不能作为 OpenUI 官方产品的性能数据。

正式测试的 36 份输出均通过对应格式的结构检查。A2UI 和 json-render 的输出 Token 少于 HTML 路线，但组件 Schema 增加了输入 Token。新闻资讯场景中，三条路线的总 Token 中位数接近；图表、表单和仪表盘场景中，复用宿主组件明显缩短了模型输出。完整响应耗时的差异同时受到输出长度、提示词、网络和缓存条件影响。

## 一、评估范围与方法

### 1.1 实验对象

评估日期为 2026 年 9 月 26 日，正式运行开始时间为北京时间 14:10。业务数据为固定人工样例，不代表实时新闻、证券行情或生产经营数据。模型负责生成界面结构或代码，未联网检索业务内容。

| 项目 | 本次配置 |
| --- | --- |
| 模型接口 | DeepSeek Chat Completions，实际返回模型名 `deepseek-flash` |
| 共同参数 | `temperature=0`、`thinking=disabled`、`max_tokens=6000`、流式响应 |
| 输出模式 | HTML 使用文本；A2UI 与 json-render 使用 `response_format=json_object` |
| 重复方式 | 四场景 × 三路线 × 三轮，串行请求，按场景和轮次轮换路线顺序 |
| 重试策略 | 正式测试不自动重试，不修补模型输出，不剔除失败样本 |
| A2UI 实现 | `@a2ui/react 0.11.1`、`@a2ui/web_core 0.11.0`，消息版本 `v0.9` |
| json-render 实现 | `@json-render/core 0.21.0`、`@json-render/react 0.21.0` |
| 业务组件 | Stack、Card、Text、Metric、Chart、Input、Button，两种声明式路线共用实现 |
| 浏览器检查 | Google Chrome，桌面 1280 px 与移动宽度 390 px |

SDK 软件包版本与 A2UI 协议版本分别记录。这里的 `v0.9` 是实际消息版本，不以网站当前协议版本替代。模型参数与 JSON 输出模式的含义见 [DeepSeek API 文档](https://api-docs.deepseek.com/api/create-chat-completion/)。

### 1.2 统计边界

Token 直接采用 API 返回的 `usage`，同时保存输入、输出、缓存命中与未命中 Token。输入包含系统提示词、组件属性 Schema 和完整业务数据。字符数按 JavaScript 字符串长度统计，字节数按 UTF-8 编码统计；二者均不用于估算 Token。

首内容耗时从发起请求开始，计至收到第一个非空 `content` 片段；完整响应耗时计至收到 SSE 的 `[DONE]`。计时包含网络、接口等待、模型生成和流读取，不含浏览器解析、布局与绘制。本次显示实时源码流，在完整响应通过校验后渲染界面，未测量渐进式 UI 的首屏时间。

初测另执行了 36 次调用，其中 json-render 的两份表单响应多出闭合字符。最终配置启用 JSON 输出模式后，重新运行完整测试组。初测期间还修正了 SVG 命名空间误报和宿主表单事件权限；这些属于测试工程问题。初测记录单独保存，不与正式样本合并，不修改原始模型输出。

## 二、技术架构

### 2.1 OpenUI 与 HTML 代码生成路线

W&B OpenUI 是自然语言驱动的界面生成应用，支持预览、修改生成结果，以及向 React、Svelte、Web Components 等形式转换。模型接入包括 OpenAI、Groq、Ollama 等路径。[官方项目说明](https://github.com/wandb/openui)

本次 HTML 实现通过 DeepSeek 直接生成完整文档，包含内联样式、SVG 或 Canvas 图形以及必要的本地交互脚本。页面布局与图形代码由模型逐次生成，宿主提供 iframe 隔离和资源限制。实验只覆盖这种代码生成与预览方式，没有覆盖 OpenUI 官方应用的提示词、代码转换、编辑流程及服务端开销。

### 2.2 A2UI

A2UI 使用声明式消息描述界面，由客户端按照组件目录渲染。协议支持界面创建、组件更新、数据模型更新和用户动作。跨端映射要求各客户端实现对应的组件和属性。[官方项目说明](https://github.com/a2ui-project/a2ui)

本实验使用官方 `MessageProcessor` 处理 `createSurface` 与 `updateComponents` 消息，再由官方 `A2uiSurface` 渲染。组件属性由 Zod 定义，Stack 和 Card 通过组件 ID 引用子节点。图表及表单属于自定义目录内的业务组件。消息采用静态字面值，本次未评测动态数据绑定、多轮增量更新或远端 Agent 动作。

### 2.3 json-render

json-render 通过 Catalog 定义组件属性，通过 Registry 关联组件实现，再由 Renderer 渲染 Spec。官方项目同时提供状态绑定、动作和渐进式生成能力。[官方项目说明](https://github.com/vercel-labs/json-render)

本实验使用官方 `defineCatalog`、`defineRegistry` 与 `Renderer`。模型输出由 `root` 和 `elements` 构成的扁平 Spec，属性使用与 A2UI 等价的 Schema。服务端执行官方目录校验，并检查节点引用、循环、孤立节点及图表数据长度。测试未启用 SpecStream、动态表达式或多轮状态更新。

### 2.4 架构对照

| 项目 | HTML 路线 | A2UI | json-render |
| --- | --- | --- | --- |
| 本次输出 | 完整 HTML、CSS、JavaScript | 两条 A2UI 消息及组件列表 | root 与 elements Spec |
| 本次渲染 | 隔离 iframe | 官方 MessageProcessor 与 A2uiSurface | 官方 Registry 与 Renderer |
| 组件约束 | 提示词和执行环境约束 | 自定义 Catalog 及属性 Schema | Catalog 及属性 Schema |
| 图表 | 模型生成 SVG 或 Canvas 代码 | 宿主 Chart 组件 | 与 A2UI 相同的 Chart 组件 |
| 表单 | 模型生成本地校验代码 | 宿主 Input 与 Button 组件 | 与 A2UI 相同的 Input 与 Button 组件 |
| 结构检查 | 文档完整性及有限资源检查 | 官方消息校验、组件属性和引用检查 | 官方目录校验、组件属性和引用检查 |
| 本次流式展示 | 实时显示源码，完成后展示页面 | 相同 | 相同 |
| 框架原生扩展能力 | 由生成代码和宿主决定 | 数据模型、增量消息、多端映射 | 状态绑定、动作、渐进式渲染、多端渲染器 |

三条路线面对相同业务要求，但实现负担不同。HTML 将样式、图形和交互代码计入模型输出；声明式路线将这些实现预置在宿主中。因此，输出缩短同时依赖组件开发投入，不能解释为无需工程成本。

## 三、场景结果

### 3.1 新闻资讯

输入包含三条固定新闻，每条均有标题、日期、来源和摘要。三条路线按原顺序展示内容，浏览器检查逐项比对文本。以下截图固定选取正式第一轮输出。

![HTML 路线真实生成的新闻资讯页](/images/posts/generative-ui-comparison/openui-news.png)

图 1：HTML 路线，模型生成卡片样式与内容结构。

![A2UI 官方渲染器展示的新闻资讯页](/images/posts/generative-ui-comparison/a2ui-news.png)

图 2：A2UI，模型生成组件描述，宿主提供卡片和文字组件。

![json-render 官方渲染器展示的新闻资讯页](/images/posts/generative-ui-comparison/json-render-news.png)

图 3：json-render，使用与 A2UI 相同的业务组件。

三条路线均展示了指定新闻内容。A2UI 与 json-render 输出较短，但输入包含组件定义；计入输入后，总 Token 中位数分别为 1,358 和 1,312，与 HTML 的 1,361 接近。仅比较输出 Token 会放大这个场景的调用量差异。

### 3.2 行情图表

输入包含八个日期、八个收盘价、最后收盘价 108.00、涨跌幅 +8.00%，以及固定演示数据说明。三条路线均绘制折线图，并展示日期和价格数据。HTML 自行生成图形代码，A2UI 与 json-render 调用同一个 SVG Chart 组件。

![HTML 路线真实生成的行情图表](/images/posts/generative-ui-comparison/openui-market.png)

图 4：HTML 路线，坐标、折线和数据展示代码由模型生成。

![A2UI 真实生成的行情图表](/images/posts/generative-ui-comparison/a2ui-market.png)

图 5：A2UI，组件消息包含图表标题、日期和价格数组。

![json-render 真实生成的行情图表](/images/posts/generative-ui-comparison/json-render-market.png)

图 6：json-render，通过同一 Chart 实现绘制行情。

本次已配置等价的基础图表能力，比较范围为静态折线与数据点展示，不包括缩放、实时行情订阅、复杂指标叠加或移动端触控细节。组件粒度仍影响输出：模型可以选择额外的卡片和文字节点，即使业务数据相同，描述长度也可能变化。

### 3.3 登录表单

任务要求电子邮箱、密码输入、提交、重置，以及明确的本地校验提示。邮箱应符合基本格式，密码至少八位；页面不得执行身份认证或向外发送表单数据。

HTML 路线由模型生成校验和事件处理代码，声明式路线调用宿主固定实现。浏览器依次执行无效邮箱、短密码、有效输入和重置操作。该检查验证本地交互，不涉及账户系统、服务端鉴权、会话管理或真实登录成功率。

### 3.4 业务仪表盘

输入包含销售额 ¥128,600、订单数 846、客单价 ¥152.01、转化率 3.8%，以及七日订单序列。三条路线均展示指标和折线图。数据为固定样例，未配置刷新按钮，也没有将页面描述为实时经营看板。

## 四、量化结果

### 4.1 实际 Token

下表为每个场景三次调用的中位数。总 Token 为 API 返回的输入与输出之和，所有格式的输入均包含其生成约束。

| 场景 | 路线 | 输入 Token | 输出 Token | 总 Token |
| --- | --- | ---: | ---: | ---: |
| 新闻资讯 | HTML 路线 | 317 | 1,044 | 1,361 |
| 新闻资讯 | A2UI | 896 | 462 | 1,358 |
| 新闻资讯 | json-render | 852 | 460 | 1,312 |
| 行情图表 | HTML 路线 | 283 | 2,936 | 3,219 |
| 行情图表 | A2UI | 862 | 539 | 1,401 |
| 行情图表 | json-render | 818 | 514 | 1,332 |
| 登录表单 | HTML 路线 | 241 | 2,201 | 2,442 |
| 登录表单 | A2UI | 820 | 321 | 1,141 |
| 登录表单 | json-render | 776 | 268 | 1,044 |
| 业务仪表盘 | HTML 路线 | 284 | 2,387 | 2,671 |
| 业务仪表盘 | A2UI | 863 | 311 | 1,174 |
| 业务仪表盘 | json-render | 819 | 299 | 1,118 |

以下为各路线全部 12 次正式调用的累计用量。缓存命中 Token 是输入的一部分，不能再次加到输入总量中。

| 路线 | 输入 Token | 其中缓存命中 | 输出 Token | 合计 Token |
| --- | ---: | ---: | ---: | ---: |
| HTML 路线 | 3,375 | 1,152 | 26,093 | 29,468 |
| A2UI | 10,323 | 7,168 | 4,892 | 15,215 |
| json-render | 9,795 | 7,680 | 4,647 | 14,442 |

A2UI 与 json-render 的累计输出 Token 分别比 HTML 少 81.3% 和 82.2%；计入输入后，总 Token 分别少 48.4% 和 51.0%。这些比例只描述本组任务与组件目录，不代表模型账单同比例减少。输入缓存命中、未命中和输出的单价不同，本报告未读取账户账单，故不将 Token 合计换算为实际扣费。

### 4.2 首内容与完整响应耗时

单位为秒。首内容与完整响应列为三次中位数，末列列出完整响应的最小值和最大值。

| 场景 | 路线 | 首内容 | 完整响应 | 完整响应范围 |
| --- | --- | ---: | ---: | ---: |
| 新闻资讯 | HTML 路线 | 0.48 | 3.43 | 3.22–3.53 |
| 新闻资讯 | A2UI | 0.61 | 1.86 | 1.45–1.96 |
| 新闻资讯 | json-render | 0.61 | 1.95 | 1.55–2.11 |
| 行情图表 | HTML 路线 | 0.41 | 8.04 | 6.55–8.27 |
| 行情图表 | A2UI | 0.55 | 2.02 | 1.87–2.20 |
| 行情图表 | json-render | 0.45 | 1.85 | 1.62–1.95 |
| 登录表单 | HTML 路线 | 0.68 | 6.51 | 6.25–8.01 |
| 登录表单 | A2UI | 0.45 | 1.42 | 1.37–1.73 |
| 登录表单 | json-render | 0.45 | 1.30 | 1.16–1.36 |
| 业务仪表盘 | HTML 路线 | 0.53 | 6.99 | 6.47–7.49 |
| 业务仪表盘 | A2UI | 0.61 | 1.48 | 1.47–1.56 |
| 业务仪表盘 | json-render | 0.46 | 1.34 | 1.26–1.57 |

本组任务中，声明式路线的完整响应较短，图表和表单差异较明显。首内容耗时没有保持相同排序，说明不能用完整响应时间反推首片段响应能力。三条路线使用相同服务端和网络环境，但未关闭或均衡模型缓存；结果不属于冷缓存性能基准，也不用于衡量渲染器执行速度。

每个条件仅重复三次，表内范围是观测范围，不是置信区间。实验未覆盖高并发、长会话、模型高峰负载及跨区域网络。

### 4.3 输出规模

每格依次为字符数与 UTF-8 字节数的中位数，单位为“字符 / 字节”。这里不使用口径不明的 KB 近似值。

| 场景 | HTML 路线 | A2UI | json-render |
| --- | ---: | ---: | ---: |
| 新闻资讯 | 2,925 / 3,193 | 1,415 / 1,651 | 1,362 / 1,598 |
| 行情图表 | 8,103 / 8,367 | 1,655 / 1,761 | 1,505 / 1,605 |
| 登录表单 | 6,685 / 7,127 | 1,106 / 1,304 | 914 / 1,066 |
| 业务仪表盘 | 6,256 / 6,476 | 1,016 / 1,118 | 939 / 1,041 |

字符数只反映本次输出文本规模。组件数量受拆分粒度影响，DOM 元素数、组件实例数和顶层节点数也不是同一口径，本报告不把它们混合为复杂度排名。

### 4.4 校验与浏览器结果

正式 36 次请求均正常结束并返回 usage，输出通过各自的结构检查。HTML 检查完整文档和部分资源声明；A2UI 检查官方消息、目录属性和节点引用；json-render 检查官方目录 Schema 和节点引用。三种检查的覆盖程度不同，通过率不能直接作为统一安全评分。

工程单元测试覆盖流式 UTF-8 分片、截断响应、凭据缺失、HTTP 失败、JSON 输出模式、未知组件、属性类型、缺失引用、循环引用、孤立节点、图表数组及 SVG 命名空间等，共 19 项。36 份正式输出均通过本次浏览器检查，检查项包括新闻文本、行情数据、仪表盘指标、图表元素、表单反馈和移动宽度横向溢出。单元测试与浏览器结果分别保存在源码包和结果目录中。

静态数据检查及表单交互不等于完整业务验收。对于生产系统，还需要核验数据来源、业务规则、权限、无障碍要求及多轮更新中的状态保留。

## 五、安全机制与集成要求

### 5.1 生成代码的执行边界

HTML 在独立来源的 iframe 中运行，sandbox 允许脚本与本地表单事件，不开放同源权限。CSP 禁止外部资源、网络连接、表单网络提交和 base 地址修改。允许表单事件是为了使生成的本地校验逻辑能够执行；真实表单提交仍被限制。

字符串检查只能发现部分资源声明，不能证明生成代码没有风险。生产接入还需限制计算资源、处理死循环及弹出交互、审查宿主通信，敏感操作必须经过受控接口。

### 5.2 声明式目录的边界

A2UI 与 json-render 仅接受注册组件及其允许属性。图表读取数字数组，表单按钮仅调用本地 submit 或 reset。两者均不接受模型直接提供的脚本。组件内部能访问什么资源，仍由宿主实现决定。

Schema 校验处理结构和类型，业务鉴权处理访问权限。增加一个具备远端请求或数据修改能力的组件，就同时增加了相应的授权和审计要求。声明式格式本身不能替代权限控制。

### 5.3 集成检查

| 检查项 | 实施要求 |
| --- | --- |
| 组件兼容 | 记录目录版本及各端支持的组件、属性与动作 |
| 输出处理 | 明确无效 JSON、生成中断、未知组件与引用错误的处理 |
| 状态管理 | 验证增量更新不会覆盖用户输入或重复提交 |
| 数据与动作 | 服务端核验数据范围、对象归属和操作权限 |
| 运行记录 | 保存必要的请求配置、校验失败、模型用量及动作结果 |
| 凭据 | 仅服务端读取环境变量或已有凭据文件，不进入前端与发布包 |

## 六、项目支持与社区情况

### 6.1 项目与版本

| 项目 | OpenUI | A2UI | json-render |
| --- | --- | --- | --- |
| 发起组织 | Weights & Biases | Google | Vercel Labs |
| 开源许可 | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| GitHub Star 近似值 | 22.6k | 16.5k | 18.3k |
| 交付形式 | 自托管应用 | 协议、SDK 与渲染器 | `@json-render/*` 包 |
| 文档入口 | 仓库 README 与开发文档 | a2ui.org | json-render.dev |
| 版本状态 | 以仓库代码为准 | v0.9.1 为当前版本，v1.0 为候选版本 | 发布页列出 v0.21.0，发布日期为 9 月 18 日 |
| 客户端支持 | 生成 HTML，并提供框架代码转换 | 官方及社区渲染器 | React、Vue、Svelte、Solid、React Native 等 |

Star 为本次查询时仓库页面的近似显示值，会随时间变化。[OpenUI 仓库](https://github.com/wandb/openui)、[A2UI 仓库](https://github.com/a2ui-project/a2ui)、[json-render 仓库](https://github.com/vercel-labs/json-render)。协议版本及发布状态分别见 [A2UI 版本说明](https://a2ui.org/)和 [json-render 发布记录](https://github.com/vercel-labs/json-render/releases)。

### 6.2 SDK 与渲染器

A2UI 提供官方实现，也收录第三方渲染器。社区目录涵盖 React、Vue、Svelte、Android、Apple 原生平台、React Native、Lynx 和 Material UI 等，并列明不同协议版本的支持情况。官方 `@a2ui/react` 与社区 React 包需要分别识别。渲染器数量不等同于全部实现都支持相同协议版本。[A2UI 渲染器目录](https://a2ui.org/ecosystem/renderers/)

json-render 提供各目标平台的包，以及 shadcn/ui、状态管理适配和 MCP 集成。React Native 渲染器支持移动端原生视图，框架支持范围不局限于浏览器。[渲染器文档](https://json-render.dev/docs/renderers)、[安装与状态适配文档](https://json-render.dev/docs/installation)

OpenUI 的主要使用方式是部署界面生成应用。Ollama 属于模型接入方式，与客户端渲染器是不同概念。生成代码进入其他产品后，其依赖管理、交互测试和维护工作仍由接入项目承担。

### 6.3 社区指标的适用范围

Star、软件包下载量、发布数量和技术文章数量分别反映不同活动，不能合并为生产采用率。软件包周下载量需注明统计周及包清单，同一应用可能同时下载多个包。本报告不采用缺少统计周期和包范围的下载总量，也不以教程数量推断企业使用规模。

维护情况应结合发布记录、提交历史和问题处理情况判断。仅凭项目创建时间、曾经的传播热度或单一版本号，不能确认项目已经停止维护。

## 七、行业采用与技术传播

### 7.1 OpenUI

W&B 在项目说明中将 OpenUI 用于界面及相关工具的测试和原型开发。该用途可以确认原型应用定位；W&B 平台客户数量不等于 OpenUI 的生产用户数量。[OpenUI 项目说明](https://github.com/wandb/openui)

本报告未形成 OpenUI 企业生产部署数量的统计。中文教程、镜像仓库和个人试用内容可用于了解使用方法，不能直接作为企业部署证据。

### 7.2 A2UI

Google Opal 团队参与 A2UI 开发，并将其用于动态界面。Flutter GenUI SDK 使用 A2UI 连接服务端 Agent 与 Flutter 客户端。CopilotKit 提供 AG-UI 与 A2UI 的集成支持。[A2UI 官方应用案例](https://a2ui.org/ecosystem/a2ui-in-the-world/)

Gemini Enterprise 已提供 A2UI Agent 的部署与注册文档，使用 A2A 端点传递界面描述。该集成有明确的产品接入路径，但不能据此推定所有 Agent 注册方式都支持 A2UI。[Google Cloud 接入指南](https://cloud.google.com/blog/topics/developers-practitioners/guide-to-gemini-enterprise-and-a2ui-integration)、[Cloud Run 部署教程](https://docs.cloud.google.com/gemini/enterprise/docs/a2ui-agents/tutorial-host-agent-cloud-run)

国内移动端项目 AGenUI 提供 iOS、Android 和 HarmonyOS 的 A2UI 渲染能力，采用共享 C++ 核心及各平台原生渲染实现，支持自定义组件和函数调用。该项目已被 A2UI 社区目录收录，官网位于高德域名下。[AGenUI 项目](https://github.com/AGenUI/AGenUI)、[高德 AGenUI 官网](https://genui.amap.com/)

### 7.3 json-render

json-render 的工程集成包括 Vercel AI SDK、shadcn/ui，以及 Next.js、TanStack Start 等应用框架。多端渲染、状态绑定和渐进式更新均有官方文档或代码示例。[快速接入示例](https://json-render.dev/docs/quick-start)、[发布记录](https://github.com/vercel-labs/json-render/releases)

框架适配与企业生产使用属于不同统计对象。本报告确认上述集成能力，不据此推定企业用户数量。媒体报道、开发者讨论及个人贡献者参与可说明技术传播情况，但不能替代具体部署案例和运行数据。

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

| 路线 | 主要优势 | 主要限制 |
| --- | --- | --- |
| HTML / OpenUI 类代码生成 | 可直接生成布局、样式、图形与交互逻辑，适合原型和视觉探索 | 输出包含完整实现代码，需要隔离、审查及维护；本次未测试 OpenUI 官方应用 |
| A2UI | 组件描述与客户端实现分离；协议包含数据模型和增量更新；可配置多端映射 | 需要维护 Catalog 和各端实现；协议与 SDK 版本分别适配；本次仅测试静态消息子集 |
| json-render | Catalog、Registry 与 Renderer 分工明确，便于复用已有组件及状态机制 | 未注册能力需要开发；目录与目标平台需保持一致；本次未测试 SpecStream 和多轮状态 |

共享业务组件使图表和表单的实现较为一致，也把部分工作从模型生成阶段移到了宿主开发阶段。输出长度、开发投入和用户可见质量应分别评价。

## 十、选型结论

| 应用条件 | 可采用的路线 | 实施条件 |
| --- | --- | --- |
| 界面原型、自定义布局和图形探索 | OpenUI 类代码生成 | 配置执行隔离，检查生成代码，明确后续维护方式 |
| 多客户端接收 Agent 生成的界面 | A2UI | 统一协议和目录版本，完成各端组件及事件映射 |
| 在现有组件库中接入动态卡片和表单 | json-render | 建立 Catalog 与 Registry，接入应用状态和业务动作 |
| 需要可重复图表与表单行为的页面 | 声明式路线配合业务组件 | 预先实现和测试组件，限定参数与数据访问权限 |

本次实测中，三条路线均完成四类固定业务任务。A2UI 与 json-render 在图表、表单和仪表盘中减少了模型输出及完整响应时间；新闻资讯计入组件 Schema 后，总 Token 差异较小。两种声明式路线之间的差别不足以建立跨任务的稳定性能排名。

选型还取决于已有组件的覆盖程度、目标客户端、所需状态机制和代码执行权限。本实验未覆盖官方 OpenUI 应用、多轮 Agent 交互、复杂实时图表、生产鉴权或长期运行稳定性，这些能力需要在目标系统中单独验收。

## 十一、本地运行与复现

[下载 Demo 源码与完整测试记录](/downloads/generative-ui-deepseek-demo.zip)，或单独查看[正式统计 JSON](/downloads/generative-ui-deepseek-summary.json)与[逐次调用 CSV](/downloads/generative-ui-deepseek-runs.csv)。源码包包含 lockfile、提示词、原始响应、正式与初测记录、单元测试及浏览器脚本，不包含密钥或 node_modules。

### 11.1 工程目录

```text
gen-ui-comparison/
├── lib/                 # DeepSeek、业务输入、提示词、目录与校验
├── src/                 # 页面及官方渲染器适配
├── scripts/             # 批量调用、统计、浏览器检查
├── tests/               # 流解析与校验测试
├── results/             # 正式36次响应及汇总
├── pilot-results/       # 单独保存的初测记录
├── screenshots/         # 六张正式场景截图
├── server.mjs
├── package.json
└── package-lock.json
```

### 11.2 启动与复测

运行环境为 Node.js 24 与 npm。先安装依赖，再配置自己的 DeepSeek 密钥：

```bash
npm ci
cp .env.example .env
# 编辑 .env 填入自己的密钥
node --env-file=.env server.mjs
```

打开 `http://127.0.0.1:4175`。选择路线和场景后，“调用 DeepSeek”发起真实请求，“回放实测”读取已保存结果。已有 YAML 凭据可以通过环境变量 `DEEPSEEK_CREDENTIAL_FILE` 指定，程序只在服务端读取。

```bash
npm test
npm run build
node --env-file=.env scripts/benchmark.mjs
node scripts/summarize.mjs
node scripts/browser-check.mjs
```

浏览器检查需要同时运行本地服务，并安装 Google Chrome；其他安装位置可通过 `CHROME_PATH` 指定。重新执行 benchmark 会产生新的调用用量。回放与浏览器复核不调用模型。

### 11.3 复现范围

业务任务与数据固定在 `lib/scenarios.mjs`，格式约束和组件 Schema 固定在 `lib/prompts.mjs` 与 `lib/catalog.mjs`。每次响应保存完整提示词、实际模型名、request ID、usage、时间与原始输出。截图选用正式第一轮的新闻和行情样本，能够通过对应运行 ID 回放。

温度设为零不保证远程服务逐字复现，缓存、服务负载和模型更新也会改变耗时。复测应保留新的运行批次，按相同定义重新汇总，不覆盖已发布记录。

## 参考资料

- [DeepSeek Chat Completions：流式响应、usage 与 JSON 输出模式](https://api-docs.deepseek.com/api/create-chat-completion/)
- [W&B OpenUI：项目说明与运行方式](https://github.com/wandb/openui)
- [A2UI：协议、组件目录与客户端实现](https://github.com/a2ui-project/a2ui)
- [json-render：Catalog、Registry 与渲染器](https://github.com/vercel-labs/json-render)
- [A2UI 官方应用案例](https://a2ui.org/ecosystem/a2ui-in-the-world/)
- [A2UI 社区渲染器](https://a2ui.org/ecosystem/renderers/)
- [Google Cloud：Gemini Enterprise 与 A2UI 接入](https://cloud.google.com/blog/topics/developers-practitioners/guide-to-gemini-enterprise-and-a2ui-integration)
- [AGenUI 项目](https://github.com/AGenUI/AGenUI)
- [json-render 官方文档](https://json-render.dev/docs)
