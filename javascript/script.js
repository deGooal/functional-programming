document.addEventListener('DOMContentLoaded', () => {
    // Глобальное состояние приложения
    let tasks = [];
    let currentFilter = 'all'; // 'all', 'active', 'completed'

    // Получение ссылок на DOM-элементы
    const taskForm = document.getElementById('addTaskForm');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const filterButtonsContainer = document.querySelector('.filters'); // Для делегирования

    // --- ЧИСТЫЕ ФУНКЦИИ для работы с данными ---
    const addTask = (currentTasks, text) => {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };
        return [...currentTasks, newTask];
    };

    const toggleTaskStatus = (currentTasks, taskId) => {
        return currentTasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
    };

    const deleteTask = (currentTasks, taskId) => {
        return currentTasks.filter(task => task.id !== taskId);
    };

    const getFilteredTasks = (allTasks, filter) => {
        if (filter === 'active') {
            return allTasks.filter(task => !task.completed);
        }
        if (filter === 'completed') {
            return allTasks.filter(task => task.completed);
        }
        return allTasks; // 'all'
    };

    // --- "ГРЯЗНЫЕ" ФУНКЦИИ (работа с DOM и состоянием) ---
    function renderTasks() {
        const tasksToRender = getFilteredTasks(tasks, currentFilter);
        taskList.innerHTML = ''; // Очищаем старый список

        tasksToRender.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = String(task.id); // Убедимся, что ID - строка для data-атрибута
            if (task.completed) {
                li.classList.add('completed');
            }

            const taskTextSpan = document.createElement('span');
            taskTextSpan.textContent = task.text;

            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('actions');

            const completeButton = document.createElement('button');
            completeButton.classList.add('complete-btn');
            completeButton.dataset.action = 'toggle';
            completeButton.textContent = task.completed ? 'Отменить' : 'Выполнить';
            if (task.completed) completeButton.classList.add('undo-btn');

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-btn');
            deleteButton.dataset.action = 'delete';
            deleteButton.textContent = 'Удалить';

            actionsDiv.appendChild(completeButton);
            actionsDiv.appendChild(deleteButton);

            li.appendChild(taskTextSpan);
            li.appendChild(actionsDiv);
            taskList.appendChild(li);
        });
        updateFilterButtonsUI();
    }

    function updateFilterButtonsUI() {
        const buttons = filterButtonsContainer.querySelectorAll('button');
        buttons.forEach(btn => {
            if (btn.dataset.filter === currentFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // --- Сохранение и загрузка из Local Storage ---
    function saveTasksToLocalStorage() {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
    }

    function loadTasksFromLocalStorage() {
        const storedTasks = localStorage.getItem('todoTasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
    }

    // --- ОБРАБОТЧИКИ СОБЫТИЙ ---
    taskForm.addEventListener('submit', event => {
        event.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText) {
            tasks = addTask(tasks, taskText);
            taskInput.value = '';
            renderTasks();
            saveTasksToLocalStorage();
        }
    });

    // Делегирование событий для кнопок в задачах
    taskList.addEventListener('click', event => {
        const targetButton = event.target.closest('button');
        if (!targetButton) return; // Клик не по кнопке

        const action = targetButton.dataset.action;
        const listItem = targetButton.closest('li');
        if (!listItem) return;

        const taskId = Number(listItem.dataset.id);

        if (action === 'toggle') {
            tasks = toggleTaskStatus(tasks, taskId);
        } else if (action === 'delete') {
            tasks = deleteTask(tasks, taskId);
        }

        renderTasks();
        saveTasksToLocalStorage();
    });

    // Обработчик для кнопок фильтрации
    filterButtonsContainer.addEventListener('click', event => {
        const targetButton = event.target.closest('button[data-filter]');
        if (targetButton) {
            currentFilter = targetButton.dataset.filter;
            renderTasks();
            // Можно сохранить currentFilter в localStorage, если нужно
        }
    });

    // --- Инициализация ---
    loadTasksFromLocalStorage();
    renderTasks();
});
