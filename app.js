// Todo List App - JavaScript 逻辑
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        
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

    init() {
        this.setupEventListeners();
        this.updateDate();
        this.render();
        this.updateStats();
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

    addTodo() {
        const content = this.newTodoInput.value.trim();
        if (!content) return;

        const todo = {
            id: Date.now(),
            content,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.saveToLocalStorage();
        this.render();
        this.updateStats();

        // 清空输入框并聚焦
        this.newTodoInput.value = '';
        this.newTodoInput.focus();

        // 添加动画效果
        this.addButton.classList.add('pulse');
        setTimeout(() => this.addButton.classList.remove('pulse'), 500);
    }

    toggleTodo(id) {
        this.todos = this.todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });

        this.saveToLocalStorage();
        this.render();
        this.updateStats();
    }

    editTodo(id, newContent) {
        this.todos = this.todos.map(todo => {
            if (todo.id === id && newContent.trim()) {
                return { ...todo, content: newContent.trim() };
            }
            return todo;
        });

        this.saveToLocalStorage();
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToLocalStorage();
        this.render();
        this.updateStats();
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

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveToLocalStorage();
        this.render();
        this.updateStats();
    }

    selectAll() {
        this.todos = this.todos.map(todo => ({
            ...todo,
            completed: true
        }));
        this.saveToLocalStorage();
        this.render();
        this.updateStats();
    }

    deselectAll() {
        this.todos = this.todos.map(todo => ({
            ...todo,
            completed: false
        }));
        this.saveToLocalStorage();
        this.render();
        this.updateStats();
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
        const date = new Date(dateString);
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

    saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

// 创建应用实例
const todoApp = new TodoApp();

// 添加一些初始数据（如果没有数据）
if (todoApp.todos.length === 0) {
    todoApp.todos = [
        {
            id: 1,
            content: '学习 Three.js 3D 渲染',
            completed: true,
            createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 2,
            content: '开发 Todo List 应用',
            completed: true,
            createdAt: new Date(Date.now() - 43200000).toISOString()
        },
        {
            id: 3,
            content: '将项目推送到 GitHub',
            completed: false,
            createdAt: new Date().toISOString()
        }
    ];
    todoApp.saveToLocalStorage();
    todoApp.render();
    todoApp.updateStats();
}

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
