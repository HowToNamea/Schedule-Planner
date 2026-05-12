# Schedule Planner

日程规划桌面应用 —— 帮助你安排每天的任务、追踪完成状态，简洁直观的时间管理工具。

## 功能特性

- **任务创建** — 按日期、时间段创建任务，支持全天事件（如生日、纪念日）
- **图片附件** — 任务可附带图片，支持预览和放大查看
- **完成标记** — 点击圆圈按钮标记任务完成，已完成任务自动划线+半透明
- **双视图** — 日历视图（月/周/日）和列表视图自由切换
- **搜索** — 通过关键词搜索历史任务，查看某天做了什么事
- **删除确认** — 删除任务前弹窗确认，防止误删
- **主题自定义** — 默认淡蓝色主题，可在设置中自由更换主色调和背景色
- **本地存储** — 所有数据保存在本地，无需联网
- **键盘快捷键** — `Ctrl+N` 新建任务、`Esc` 关闭弹窗

## 技术栈

| 层面 | 技术 |
|------|------|
| 桌面框架 | Electron |
| 前端 UI | React 19 + TypeScript |
| 状态管理 | Zustand |
| 日历组件 | react-big-calendar |
| 数据库 | SQLite (sql.js) |
| 日期处理 | date-fns |
| 构建工具 | electron-vite |
| 打包 | electron-builder |

## 项目结构

```
my_schedule_project/
├── src/
│   ├── main/            # Electron 主进程（数据库、IPC通信）
│   ├── preload/         # 预加载脚本（安全桥接层）
│   └── renderer/        # React 前端
│       ├── components/  # UI 组件
│       │   ├── Layout/      # 布局（Header + Sidebar）
│       │   ├── Calendar/    # 日历视图
│       │   ├── ListView/    # 列表视图
│       │   ├── TaskForm/    # 任务表单弹窗
│       │   ├── TaskDetail/  # 任务详情弹窗
│       │   ├── SearchBar/   # 搜索栏
│       │   ├── ConfirmDialog/ # 确认弹窗
│       │   └── Settings/    # 设置面板
│       ├── store/       # Zustand 状态管理
│       ├── types/       # TypeScript 类型定义
│       └── styles/      # 全局样式和主题变量
├── resources/           # 应用图标等资源
├── package.json
└── electron-builder.yml # 打包配置
```

## 安装和使用

### 直接运行

下载 `dist/Schedule-Planner.zip`，解压后双击 `Schedule Planner.exe` 即可运行。

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build

# 打包 Windows 安装包
npm run package
```

## 数据存储

所有数据保存在本地用户目录：

```
C:\Users\<用户名>\AppData\Roaming\schedule-planner\
├── schedule.db    # SQLite 数据库
└── images/        # 图片附件
```

## License

MIT
