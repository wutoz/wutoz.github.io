---
title: "生成式 UI 技术方案对比报告：OpenUI、A2UI 与 json-render"
date: 2026-09-26 12:45:00 +0800
description: "比较 OpenUI、A2UI 与 json-render 的技术架构、场景实现、输出规模、安全机制和集成条件，列明测试数据的统计口径，并给出适用范围与选型结论。"
categories: [AI]
tags: [生成式UI, OpenUI, A2UI, json-render, 前端, Agent]
draft: false
---

## 摘要

本报告比较 OpenUI、A2UI 与 json-render 的生成式 UI 实现方式，分析资讯列表、行情分时图、登录表单和数据仪表盘四类场景。比较内容包括输出格式、组件组织、渲染方式、安全机制及产品集成条件。

OpenUI 采用代码生成方式，适用于界面原型和自定义视觉表达；A2UI 通过声明式协议描述组件与数据，适用于多客户端之间的 UI 传递；json-render 通过组件目录和 Schema 约束生成内容，适用于已有组件体系的应用集成。

场景样本中，OpenUI Demo 实现了 SVG 行情图，A2UI 与 json-render Demo 使用进度条和列表展示行情信息。该差异与本次 Demo 的组件配置有关，不能据此认定声明式方案缺少图表支持。现有数据能够反映样本输出规模，尚不足以确定模型调用成本或生成速度排名。

## 一、评估范围与数据说明

评估日期为 2026 年 9 月 26 日。评估对象为三套自建 Demo，覆盖资讯列表、行情分时图、登录表单和数据仪表盘四类场景，包含六张场景截图、177 项断言和 36 组测试。A2UI Demo 按 v0.9.1 协议进行比较。

| 评估项 | 内容 | 统计范围 |
| --- | --- | --- |
| 场景实现 | 资讯列表、行情分时图、登录表单、数据仪表盘 | 页面输出及组件组织方式 |
| 运行截图 | 三套 Demo 的资讯、行情页面 | 使用 puppeteer-core 与 Chrome 截取 |
| 输出规模 | 字符数、组件数、Token 估算值 | Demo API 响应内容 |
| 响应时间 | 五轮请求的平均耗时 | Demo 接口耗时 |
| 自动化测试 | 177 项断言、36 组测试 | 三套 Demo 的本地测试 |

场景结论限定于本次 Demo 的实现配置。Token 数为估算值，接口耗时未区分模型推理、网络传输与浏览器渲染阶段，不用于确定实际计费成本或完整生成速度。截图中的资讯及证券数据均为界面演示内容。

## 二、技术架构

### 2.1 OpenUI

W&B OpenUI 是自然语言驱动的界面生成应用，支持预览和修改生成结果，并提供 HTML 向 React、Svelte、Web Components 等形式的转换能力。[官方项目说明](https://github.com/wandb/openui)

OpenUI 支持 OpenAI、Groq、Ollama，以及通过 LiteLLM 接入 Claude 等模型。模型接入与客户端渲染是独立能力。

本次 Demo 以 HTML、CSS 和 SVG 表达页面，在 iframe 中渲染。布局和图形可以随生成内容调整，适合尚未形成固定组件规范的原型开发。生成代码的执行权限、外部资源访问和宿主通信需要单独控制。

### 2.2 A2UI

A2UI 采用声明式 JSON 描述界面，客户端根据预先批准的组件目录渲染内容。界面结构与具体组件实现分离，协议支持数据模型及增量更新。[官方项目说明](https://github.com/a2ui-project/a2ui)

客户端可将相同描述映射到不同技术栈的组件。跨端兼容取决于各端对组件、属性和事件的支持情况，需要维护目录版本及兼容规则。协议限制模型直接生成可执行代码的范围，业务动作仍须经过服务端授权。

### 2.3 json-render

json-render 通过 Catalog 定义允许生成的组件和动作，通过 Registry 关联组件实现，由 Renderer 渲染生成结果。Zod Schema 用于校验属性结构，SpecStream 支持增量描述，Demo 通过 SSE 传递流式内容。[官方项目说明](https://github.com/vercel-labs/json-render)

官方仓库提供 React、Vue、Svelte、Solid 和 React Native 等渲染器。接入时需要匹配目标端的组件实现、状态管理及事件处理方式。已有业务组件可以注册到目录，供模型按规定的属性和组合方式调用。

### 2.4 架构对照

| 项目 | OpenUI 路线 | A2UI | json-render |
| --- | --- | --- | --- |
| 技术形态 | 界面生成应用 | 声明式 UI 协议及相关实现 | 生成式 UI 框架 |
| 输出内容 | HTML、样式及脚本 | 组件描述、数据模型及更新消息 | 符合 Schema 的组件描述 |
| 渲染方式 | 本次 Demo 使用 iframe | 客户端组件映射 | Registry 与 Renderer |
| 组件约束 | 取决于生成规则和执行环境 | 预先批准的 Catalog | Catalog 与 Schema |
| 结构与类型校验 | 本次 Demo 未设置统一组件 Schema | JSON Schema 与协议校验 | Zod 属性定义及运行时校验 |
| 事件回传 | 本次 Demo 使用 postMessage | 按协议回传用户动作 | 渲染器事件映射至应用动作 |
| 数据更新 | 由生成代码及宿主实现决定 | 协议支持数据模型更新 | 由状态机制和组件绑定处理 |
| 增量展示 | 取决于具体实现 | 支持增量更新 | 支持渐进式渲染 |
| 图表实现 | 可生成 SVG 等图形代码 | 注册相应图表组件 | 注册相应图表组件 |
| 多端适配 | 需要转换或适配生成代码 | 各端实现协议与组件映射 | 使用对应平台的渲染器 |

## 三、场景结果

### 3.1 资讯列表

场景要求包括分类筛选、新闻卡片、时间戳和来源标签。三套 Demo 均展示了资讯列表。

![OpenUI Demo 资讯列表](/images/posts/generative-ui-comparison/openui-news.png)

图 1：OpenUI Demo 资讯列表，使用 HTML 和样式组织卡片。

![A2UI Demo 资讯列表](/images/posts/generative-ui-comparison/a2ui-news.png)

图 2：A2UI Demo 资讯列表，使用声明式组件描述页面。

![json-render Demo 资讯列表](/images/posts/generative-ui-comparison/json-render-news.png)

图 3：json-render Demo 资讯列表，使用组件目录约束页面结构。

资讯列表中，OpenUI Demo 约含 30 个 DOM 元素，A2UI Demo 使用 66 个组件实例，json-render Demo 使用 9 个顶层组件。A2UI Catalog 校验与 json-render Zod 校验均通过。OpenUI 使用沙箱渲染，卡片包含悬停效果。两项统计分别对应组件实例总量和顶层节点数量，不能直接用于评价结构复杂度。

组件粒度会影响输出长度。将新闻项拆分为 Card、Text、Tag 和 Button，需要描述多个节点；使用 NewsCard 等业务组件，可以减少重复结构，但要求客户端预先实现该组件。组件目录的复用程度是比较输出规模时需要控制的条件。

### 3.2 行情分时图

OpenUI Demo 使用 SVG polyline 绘制折线，包含渐变填充、坐标轴标签和 CSS 脉动动画。A2UI 与 json-render Demo 使用进度条、价格信息及列表表达行情数据，分别记录 29 个和 16 个组件。A2UI 通过 DataModel 绑定数据，json-render Demo 通过 Props 传递数据并展示流式日志。

![OpenUI Demo 行情分时图](/images/posts/generative-ui-comparison/openui-market.png)

图 4：OpenUI Demo 使用 SVG 绘制行情分时图。

![A2UI Demo 行情页面](/images/posts/generative-ui-comparison/a2ui-market.png)

图 5：A2UI Demo 使用现有目录中的组件展示行情信息。

![json-render Demo 行情页面](/images/posts/generative-ui-comparison/json-render-market.png)

图 6：json-render Demo 使用进度条和列表展示行情信息。

本次声明式 Demo 未配置符合场景要求的图表组件。接入专用图表组件后，模型可提供数据序列、时间范围和展示参数，由组件处理坐标轴、缩放、触控及空数据状态。

三套页面的图表能力不同，因此该场景的输出长度不具备功能等价条件下的可比性。较短的描述不能单独作为图表实现效率较高的依据。

### 3.3 登录表单与数据仪表盘

登录表单和数据仪表盘分别用于比较交互型页面及统计展示型页面。两项场景统计输出字符数、Token 估算值与 API 响应时间。

两类场景中，A2UI 与 json-render Demo 的输出字符数均少于 OpenUI Demo。该结果反映了本组样本中结构化描述的长度优势。该统计不包含表单提交正确率、数据刷新成功率及状态保留率。

## 四、量化结果与统计口径

### 4.1 输出字符数

| 场景 | OpenUI Demo | A2UI Demo | json-render Demo |
| --- | ---: | ---: | ---: |
| 资讯列表 | 4,809 | 5,577 | 7,960 |
| 行情分时图 | 7,318 | 2,672 | 3,532 |
| 登录表单 | 2,943 | 1,019 | 1,780 |
| 数据仪表盘 | 5,528 | 1,898 | 3,200 |

单位：字符。各项均按对应 Demo 的输出内容统计。

资讯列表样本中，OpenUI Demo 输出最短；登录表单和数据仪表盘样本中，A2UI Demo 输出最短。输出规模受页面内容、组件粒度和样式表达方式影响，本组结果不代表框架在其他任务中的固定排序。

字符数、编码字节数与 Token 数采用不同统计口径。以下保留接口记录的 KB 近似值，未注明按 1,000 或 1,024 字节换算，故不据此计算精确压缩比例。

| 场景 | OpenUI Demo | A2UI Demo | json-render Demo |
| --- | ---: | ---: | ---: |
| 资讯列表 | 5.0 KB | 6.7 KB | 10.5 KB |
| 行情分时图 | 7.8 KB | 3.8 KB | 6.3 KB |
| 登录表单 | 3.1 KB | 2.2 KB | 2.6 KB |
| 数据仪表盘 | 5.8 KB | 3.1 KB | 4.4 KB |

按字符数计算，登录表单和数据仪表盘中，A2UI 输出分别为 OpenUI 的 34.6% 和 34.3%。这一比例仅描述本组样本，不能解释为计费 Token 的同比例减少。

### 4.2 Token 估算

| 场景 | OpenUI Demo | A2UI Demo | json-render Demo |
| --- | ---: | ---: | ---: |
| 资讯列表 | 1,374 | 2,344 | 2,274 |
| 登录表单 | 840 | 291 | 187 |
| 数据仪表盘 | 1,579 | 542 | 280 |
| 分项算术合计 | 3,793 | 3,177 | 2,741 |

合计按所列分项计算。估算方法与模型分词器未注明，数据不等同于实际计费 Token，不能用于确定成本排名。

模型调用成本应包含输入提示词、组件 Schema、输出内容及失败重试。成本核算需要使用同一模型和统一任务条件下的 usage 记录，并明确单次请求或整项任务的计费范围。

按估算合计计算，A2UI 与 json-render 分别比 OpenUI 低 16.2% 和 27.7%。该结果是所列估算值的算术比较，不是模型计费实测结论。

成本情景可用公式 `输出费用 = 输出 Token × 任务组数 × 每百万 Token 单价 ÷ 1,000,000` 表示。假设输出单价为 15 美元/百万 Token，每组包含资讯列表、登录表单和数据仪表盘各一次，执行 1,000 组的估算输出费用如下。

| 方案 | 每组估算输出 Token | 1,000 组输出费用 |
| --- | ---: | ---: |
| OpenUI | 3,793 | 56.90 美元 |
| A2UI | 3,177 | 47.66 美元 |
| json-render | 2,741 | 41.12 美元 |

15 美元为统一计算假设，不代表 GPT-4o 或其他模型的当前报价；表中不含输入、重试及基础设施费用。

### 4.3 API 响应时间

| 场景 | OpenUI Demo | A2UI Demo | json-render Demo |
| --- | ---: | ---: | ---: |
| 资讯列表 | 2.9 | 1.5 | 1.5 |
| 行情分时图 | 0.4 | 0.6 | 0.5 |
| 登录表单 | 0.4 | 0.5 | 0.4 |
| 数据仪表盘 | 0.4 | 0.5 | 0.4 |

单位：ms，为五轮请求的平均值。计时记录未区分模型推理、网络传输和浏览器渲染，不用于比较完整 UI 生成速度。

### 4.4 测试记录

| Demo | 断言数量 | 测试组数 |
| --- | ---: | ---: |
| OpenUI | 33 | 10 |
| A2UI | 78 | 14 |
| json-render | 66 | 12 |
| 合计 | 177 | 36 |

断言数量用于描述本地测试规模。官方协议一致性及生产环境验收需要分别执行对应测试，不能由断言数量推定。

## 五、安全机制与集成要求

### 5.1 代码生成方案

生成内容包含脚本时，需要限制其执行权限和外部访问。iframe 的隔离效果取决于 sandbox 配置、来源限制及消息处理方式。宿主应校验通信来源和消息结构，敏感业务操作由受控接口执行。

代码生成方案还需要处理输出异常、脚本错误和页面不可用时的恢复方式。生成结果进入长期维护的产品前，应按项目代码规范检查依赖和实现。

### 5.2 声明式方案

A2UI 与 json-render 将可生成内容限定在组件目录及其属性范围内。客户端负责校验未知组件、属性值和事件参数，并限制组件可访问的资源。

Schema 校验确认数据结构是否符合约定，服务端鉴权确认用户是否有权执行操作。业务对象访问、数据修改和敏感动作必须经过权限检查。组件目录变更也需要版本管理，避免生成端与客户端的支持范围不一致。

### 5.3 产品集成要求

| 检查项 | 要求 |
| --- | --- |
| 组件兼容 | 明确目标端支持的组件、属性及事件 |
| 数据处理 | 校验数据格式、更新顺序及异常值 |
| 动作执行 | 将生成事件映射到明确的业务接口并校验权限 |
| 异常处理 | 对未知组件、无效输出和生成中断提供回退界面 |
| 状态管理 | 确认增量更新不会丢失用户输入或重复提交 |
| 运行记录 | 保存必要的生成结果、校验失败和动作执行记录 |

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

| 方案 | 主要优势 | 主要限制 |
| --- | --- | --- |
| OpenUI | 可直接生成布局、SVG 图形与样式；支持多模型接入；本次资讯列表输出字符数较少 | 生成代码需要隔离与审查；接入业务系统后需维护数据、状态及动作逻辑；本次 Demo 未提供统一组件 Schema |
| A2UI | 界面描述与客户端实现分离；支持数据模型和增量更新；可复用多端渲染器；组件目录便于限定允许使用的能力 | 自定义图表及业务控件需要开发；各端协议兼容情况不同；细粒度组件可能增加输出长度；版本升级需要适配 |
| json-render | Catalog、Schema 与 Registry 分工明确；支持渐进式渲染；便于接入已有组件库；提供多个平台渲染器 | 需要维护组件目录及对应实现；依赖目标平台的运行环境；未注册的业务能力需要扩展；Schema 校验不能替代业务授权 |

代码生成允许较大的布局自由度，声明式方案的表现范围由组件实现决定。专用图表、动画和交互组件能够扩展声明式方案，视觉质量不能仅按输出格式排序。

## 十、选型结论

| 应用条件 | 适用方案 | 实施条件 |
| --- | --- | --- |
| 界面原型、自定义布局与图形探索 | OpenUI 代码生成路线 | 配置隔离环境，检查生成代码并明确维护责任 |
| 多客户端接收 Agent 生成的 UI 描述 | A2UI | 统一协议版本，完成各端组件和事件映射 |
| 已有组件库中接入动态卡片、表单及渐进式展示 | json-render | 建立 Catalog 与 Registry，接入应用状态及业务动作 |
| 需要稳定图表交互的业务页面 | A2UI 或 json-render 配合专用图表组件 | 预先实现图表组件，限定参数及数据访问权限 |

本次场景比较确认了代码生成与组件映射两类实现的差异。OpenUI Demo 在行情场景中提供了完整折线图；声明式 Demo 的图表表现受本次组件目录限制。资讯列表、表单和仪表盘的输出规模随组件粒度及内容变化，不能形成统一的效率排序。

方案选择应以目标端支持情况、现有组件复用程度和业务权限要求为依据。现有记录支持架构与场景适用性分析；模型成本、完整生成耗时和生产稳定性不列入本报告的确定性结论。

## 十一、本地运行与复现

### 11.1 工程目录

以下为对比 Demo 工程的运行约定，需在具备该工程源码的环境中执行。博客页面提供报告和截图，不包含 Demo 服务端及测试脚本。

```text
gen-ui-comparison/
├── demos/
│   ├── openui/          # 端口 3101
│   │   ├── server.js
│   │   ├── index.html
│   │   └── test.js      # 33 项断言 / 10 组测试
│   ├── a2ui/            # 端口 3102
│   │   ├── server.js
│   │   ├── index.html
│   │   └── test.js      # 78 项断言 / 14 组测试
│   └── json-render/     # 端口 3103
│       ├── server.js
│       ├── index.html
│       └── test.js      # 66 项断言 / 12 组测试
├── docs/
│   ├── final-report.html
│   └── screenshots/
└── scripts/
    ├── validate.sh
    └── take-screenshots.mjs
```

### 11.2 启动与测试

完整验证脚本入口：

```bash
./scripts/validate.sh
```

分别在三个终端中启动服务，每条命令从工程根目录执行：

```bash
(cd demos/openui && node server.js)
(cd demos/a2ui && node server.js)
(cd demos/json-render && node server.js)
```

对应访问地址为 `http://localhost:3101`、`http://localhost:3102` 和 `http://localhost:3103`。测试命令为：

```bash
(cd demos/openui && node test.js)
(cd demos/a2ui && node test.js)
(cd demos/json-render && node test.js)
```

运行环境需要 Node.js；截图流程使用 Chrome 和 puppeteer-core。采用本地预置响应的演示与真实模型调用应分别配置，接入远程模型还需要相应网络和凭据，不能将完整评测环境概括为零外部依赖。

### 11.3 场景提示词

| 提示词 | 用途 |
| --- | --- |
| 生成一个资讯列表页 | 比较内容密集型页面 |
| 生成一个行情分时图 | 比较数据展示与图表能力 |
| 生成一个登录表单 | 比较交互型页面 |
| 生成一个数据仪表盘 | 比较统计展示型页面 |
| 生成一个用户资料卡片 | 补充观察卡片展示；不计入四项量化场景 |

## 参考资料

- [W&B OpenUI：项目说明与运行方式](https://github.com/wandb/openui)
- [A2UI：协议说明、组件目录与客户端映射](https://github.com/a2ui-project/a2ui)
- [json-render：Catalog、Registry 与渲染器](https://github.com/vercel-labs/json-render)
- [A2UI 官方应用案例](https://a2ui.org/ecosystem/a2ui-in-the-world/)
- [A2UI 社区渲染器](https://a2ui.org/ecosystem/renderers/)
- [Google Cloud：Gemini Enterprise 与 A2UI 接入](https://cloud.google.com/blog/topics/developers-practitioners/guide-to-gemini-enterprise-and-a2ui-integration)
- [AGenUI 项目](https://github.com/AGenUI/AGenUI)
- [json-render 官方文档](https://json-render.dev/docs)
