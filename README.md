# 📝 Todo List App

## 🌐 在线演示
- **实时演示**: http://118.196.46.184/todo
- **服务器**: Ubuntu 24.04 LTS
- **部署**: Nginx 1.24.0

## 🚀 功能特性
- ✅ 添加、编辑、删除任务
- ✅ 任务状态切换（进行中/已完成）
- ✅ 本地存储持久化
- ✅ 任务过滤（全部/进行中/已完成）
- ✅ 任务统计显示
- ✅ 响应式设计
- ✅ 键盘快捷键支持
- ✅ 动画和过渡效果

## 🛠️ 技术栈
- **HTML5** - 语义化标记
- **CSS3** - 现代样式，响应式设计
- **JavaScript (ES6+)** - 交互逻辑
- **LocalStorage** - 数据持久化
- **Font Awesome** - 图标库

## 📁 项目结构
```
todo/
├── index.html          # 主 HTML 文件
├── style.css          # 样式文件
├── app.js             # JavaScript 逻辑
├── README.md          # 项目说明
├── .gitignore         # Git 忽略文件
└── LICENSE            # MIT 许可证
```

## 🚀 快速开始

### 1. 本地运行
```bash
# 克隆仓库
git clone https://github.com/<your-username>/todo.git
cd todo

# 使用任意 HTTP 服务器运行
python3 -m http.server 8000
# 或
npx serve .
```

### 2. 部署到服务器
```bash
# 复制到 Nginx 目录
sudo cp -r . /var/www/html/todo/

# 配置 Nginx
sudo cp nginx-todo.conf /etc/nginx/sites-available/todo
sudo ln -s /etc/nginx/sites-available/todo /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

### 3. 访问应用
- 打开浏览器访问: http://your-server-ip/todo
- 本地访问: http://localhost:8000

## 🎮 使用说明

### 功能操作
1. **添加任务**: 在输入框中输入内容，点击添加按钮或按 Enter 键
2. **完成任务**: 点击任务前面的复选框
3. **编辑任务**: 点击编辑按钮（铅笔图标）
4. **删除任务**: 点击删除按钮（垃圾桶图标）
5. **过滤任务**: 使用顶部过滤按钮查看不同状态的任务
6. **批量操作**: 使用底部操作按钮进行全选或清除已完成任务

### 统计面板
- **总任务**: 显示所有任务的数量
- **进行中**: 显示未完成的任务数量
- **已完成**: 显示已完成的任务数量

## 🔧 开发说明

### 核心功能
- **任务管理**: 完整的 CRUD 操作
- **数据持久化**: 使用 LocalStorage 保存数据
- **状态管理**: 实时更新任务状态
- **用户界面**: 响应式设计和动画效果

### 技术实现
1. **架构**: 模块化 JavaScript 类设计
2. **存储**: 使用 LocalStorage API
3. **样式**: CSS3 现代特性
4. **交互**: 事件驱动编程

## 📝 许可证
MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献
欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m 'Add some feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 创建 Pull Request

## 📞 联系
- **项目维护者**: Web Developer
- **邮箱**: 578375250@qq.com
- **服务器**: 118.196.46.184
- **GitHub**: [MJessie](https://github.com/MJessie)

## 🎉 特别感谢
- 所有开源贡献者
- 现代 Web 标准

---

**高效管理你的任务，提升生产力！** 🚀

> 项目创建时间: $(date)
> 最后更新: $(date)
> 版本: 1.0.0
