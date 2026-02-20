// Todo List App - JavaScript 逻辑（SQLite 后端）
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.apiBase = '/todo/api';
        
        // DOM 元素
        this.newTodoInput = document.getElementById('newTodo');
        this.addButton = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.clearCompletedButton = document.getElementById('clearCompleted');
        this.selectAllButton = document.getElementById('selectAll');
        this.deselectAllButton = document.getElementById('deselectAll');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        // 统计元素
        this.totalTasksElement = document.getElementById('totalTasks');
        this.activeTasksElement = document.getElementById('activeTasks');
        this.completedTasksElement = document.getElementById('completedTasks');
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.updateDate();
        await this.loadTodos();
    }

    setupEventListeners() {
        // 添加任务
        this.addButton.addEventListener('click', () => this.addTodo());
        this.newTodoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // 过滤按钮
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.setFilter(e));
        });

        // 操作按钮
        this.clearCompletedButton.addEventListener('click', () => this.clearCompleted());
        this.selectAllButton.addEventListener('click', () => this.selectAll());
        this.deselectAllButton.addEventListener('click', () => this.deselectAll());
    }

    async loadTodos() {
        try {
            const res = await fetch(`${this.apiBase}/todos`);
            const data = await res.json();
            this.todos = data.map(t => ({
                ...t,
                createdAt: t.createdAt || t.created_at,
                updatedAt: t.updatedAt || t.updated_at
            }));
            this.render();
            this.updateStats();
        } catch (err) {
            console.error('加载任务失败', err);
        }
    }

    async addTodo() {
        const content = this.newTodoInput.value.trim();
        if (!content) return;

        try {
            const res = await fetch(`${this.apiBase}/todos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            const todo = await res.json();
            this.todos.unshift(todo);
            this.render();
            this.updateStats();

            // 清空输入框并聚焦
            this.newTodoInput.value = '';
            this.newTodoInput.focus();

            // 添加动画效果
            this.addButton.classList.add('pulse');
            setTimeout(() => this.addButton.classList.remove('pulse'), 500);
        } catch (err) {
            console.error('添加任务失败', err);
        }
    }

    async toggleTodo(id) {
        const target = this.todos.find(t => t.id === id);
        if (!target) return;
        const newCompleted = !target.completed;

        try {
            const res = await fetch(`${this.apiBase}/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: newCompleted })
            });
            const updated = await res.json();
            this.todos = this.todos.map(todo => (todo.id === id ? updated : todo));
            this.render();
            this.updateStats();
        } catch (err) {
            console.error('更新任务失败', err);
        }
    }

    async editTodo(id, newContent) {
        if (!newContent.trim()) return;

        try {
            const res = await fetch(`${this.apiBase}/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent.trim() })
            });
            const updated = await res.json();
            this.todos = this.todos.map(todo => (todo.id === id ? updated : todo));
            this.render();
        } catch (err) {
            console.error('编辑任务失败', err);
        }
    }

    async deleteTodo(id) {
        try {
            await fetch(`${this.apiBase}/todos/${id}`, { method: 'DELETE' });
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.render();
            this.updateStats();
        } catch (err) {
            console.error('删除任务失败', err);
        }
    }

    setFilter(event) {
        const filter = event.target.dataset.filter;
        this.currentFilter = filter;

        // 更新按钮状态
        this.filterButtons.forEach(button => {
            if (button.dataset.filter === filter) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        this.render();
    }

    async clearCompleted() {
        try {
            await fetch(`${this.apiBase}/todos/clear-completed`, { method: 'POST' });
            this.todos = this.todos.filter(todo => !todo.completed);
            this.render();
            this.updateStats();
        } catch (err) {
            console.error('清除已完成任务失败', err);
        }
    }

    async selectAll() {
        try {
            await fetch(`${this.apiBase}/todos/set-all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: true })
            });
            this.todos = this.todos.map(todo => ({ ...todo, completed: true }));
            this.render();
            this.updateStats();
        } catch (err) {
            console.error('全选失败', err);
        }
    }

    async deselectAll() {
        try {
            await fetch(`${this.apiBase}/todos/set-all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: false })
            });
            this.todos = this.todos.map(todo => ({ ...todo, completed: false }));
            this.render();
            this.updateStats();
        } catch (err) {
            console.error('取消全选失败', err);
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            const message = this.getEmptyMessage();
            this.todoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>${message}</h3>
                    <p>添加你的第一个任务开始吧！</p>
                </div>
            `;
            return;
        }

        this.todoList.innerHTML = filteredTodos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <input type="checkbox" class="todo-checkbox" 
                       ${todo.completed ? 'checked' : ''}
                       onchange="todoApp.toggleTodo(${todo.id})">
                
                <div class="todo-content">
                    ${this.escapeHtml(todo.content)}
                    <div class="todo-meta">
                        <small>创建: ${this.formatDate(todo.createdAt)}</small>
                    </div>
                </div>

                <div class="todo-actions">
                    <button class="action-btn edit-btn" 
                            onclick="todoApp.startEdit(${todo.id}, this)">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" 
                            onclick="todoApp.deleteTodo(${todo.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    startEdit(id, button) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const contentElement = button.closest('.todo-item').querySelector('.todo-content');
        const content = todo.content;

        contentElement.innerHTML = `
            <input type="text" class="edit-input" value="${this.escapeHtml(content)}"
                   onkeypress="if(event.key === 'Enter') todoApp.finishEdit(${id}, this)"
                   onblur="todoApp.finishEdit(${id}, this)">
        `;

        const input = contentElement.querySelector('.edit-input');
        input.focus();
        input.select();
    }

    finishEdit(id, input) {
        const newContent = input.value.trim();
        if (newContent) {
            this.editTodo(id, newContent);
        }
        this.render();
    }

    updateDate() {
        const dateElement = document.getElementById('todayDate');
        if (!dateElement) return;
        const now = new Date();
        const dateStr = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        dateElement.textContent = `今天：${dateStr}`;
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const active = total - completed;

        this.totalTasksElement.textContent = total;
        this.activeTasksElement.textContent = active;
        this.completedTasksElement.textContent = completed;
    }

    getEmptyMessage() {
        switch (this.currentFilter) {
            case 'active':
                return '没有进行中的任务';
            case 'completed':
                return '没有已完成的任务';
            default:
                return '还没有任何任务';
        }
    }

    formatDate(dateString) {
        if (!dateString) return '未知';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '未知';
        return date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 创建应用实例
const todoApp = new TodoApp();

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        todoApp.selectAll();
    } else if (e.key === 'Escape') {
        e.preventDefault();
        todoApp.deselectAll();
    }
});

// 初始化完成
console.log('✅ Todo List App 已启动');
