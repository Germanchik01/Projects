let todos = [];
let darkMode = false;
let currentFilter = 'all';
let searchTerm = '';
let sortBy = 'priority';

// DOM элементы
const todoList = document.getElementById('todo-list');
const newTodoInput = document.getElementById('new-todo');
const addTodoButton = document.getElementById('add-todo');
const themeToggleButton = document.getElementById('theme-toggle');
const body = document.body;
const prioritySelect = document.getElementById('priority');
const deadlineInput = document.getElementById('deadline');

// кнопки
const filterAllButton = document.getElementById('filter-all');
const filterActiveButton = document.getElementById('filter-active');
const filterCompletedButton = document.getElementById('filter-completed');

// сортировка
const sortBySelect = document.getElementById('sort-by');

//поиск
const searchTermInput = document.getElementById('search-term');

// локальное хранилище
function saveTodosToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodosFromLocalStorage() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
    }
}

function saveThemeToLocalStorage() {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
}

function loadThemeFromLocalStorage() {
    const storedTheme = localStorage.getItem('darkMode');
    if (storedTheme) {
        darkMode = JSON.parse(storedTheme) === true;
        updateTheme();
    }
}


//Middleware
const applyMiddleware = (middleware) => (action) => middleware(action);

const thunk = (dispatch, getState) => (action) => {
    if (typeof action === 'function') {
        return action(dispatch, getState);
    }

    return dispatch(action);
};

const middleware = applyMiddleware(thunk);

const dispatch = (action) => {
    if (typeof action === 'function') {
        return middleware((dispatch, getState) => action(dispatch, getState))(internalDispatch, getState);
    } else {
        return internalDispatch(action);
    }
};

const internalDispatch = (action) => {
    switch (action.type) {
        case 'ADD_TODO':
            // симуляция апи
            simulateApiCall(() => {
                todos = [...todos, action.payload];
                renderTodoList();
                saveTodosToLocalStorage();
            });
            break;
        case 'TOGGLE_COMPLETE':
            simulateApiCall(() => {
                todos = todos.map((todo, index) =>
                    index === action.payload ? { ...todo, completed: !todo.completed } : todo
                );
                renderTodoList();
                saveTodosToLocalStorage();
            });
            break;
        case 'DELETE_TODO':
            simulateApiCall(() => {
                todos = todos.filter((_, index) => index !== action.payload);
                renderTodoList();
                saveTodosToLocalStorage();
            });
            break;
        case 'UPDATE_TODO':
            simulateApiCall(() => {
                todos = todos.map((todo, index) =>
                    index === action.payload.index ? { ...todo, text: action.payload.text } : todo
                );
                renderTodoList();
                saveTodosToLocalStorage();
            });
            break;
        case 'SET_FILTER':
            currentFilter = action.payload;
            renderTodoList();
            break;
        case 'SET_SORT':
            sortBy = action.payload;
            renderTodoList();
            break;
        case 'SET_SEARCH_TERM':
            searchTerm = action.payload;
            renderTodoList();
            break;
        default:
            console.log('Неизвестный тип действия:', action.type);
    }
};

const getState = () => ({ todos, darkMode, currentFilter, searchTerm, sortBy });

const simulateApiCall = (callback) => {
    setTimeout(callback, 500);
};

// действия
const addTodoAction = (text, priority, deadline) => ({
    type: 'ADD_TODO',
    payload: { text: text, completed: false, priority: priority, deadline: deadline },
});
const toggleCompleteAction = (index) => ({ type: 'TOGGLE_COMPLETE', payload: index });
const deleteTodoAction = (index) => ({ type: 'DELETE_TODO', payload: index });
const updateTodoAction = (index, text) => ({ type: 'UPDATE_TODO', payload: { index, text } });
const setFilterAction = (filter) => ({ type: 'SET_FILTER', payload: filter });
const setSortAction = (sort) => ({ type: 'SET_SORT', payload: sort });
const setSearchTermAction = (term) => ({ type: 'SET_SEARCH_TERM', payload: term });

// рендер
function renderTodoList() {
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter((todo) => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter((todo) => todo.completed);
    }

    if (searchTerm) {
        filteredTodos = filteredTodos.filter((todo) =>
            todo.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (sortBy === 'priority') {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        filteredTodos = [...filteredTodos].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === 'alphabetical') {
        filteredTodos = [...filteredTodos].sort((a, b) => a.text.localeCompare(b.text));
    }

    todoList.innerHTML = '';
    filteredTodos.forEach((todo, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('todo-item');
        listItem.classList.add(`priority-${todo.priority}`);
        listItem.dataset.index = index;

        if (listItem.dataset.editing) {
            listItem.classList.add('editing');
        }

        listItem.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} data-action="toggle" />
            <span>${todo.text}</span>
            <input type="text" class="edit-input" value="${todo.text}" style="display:none;">
            <button data-action="edit">Редактировать</button> <!-- Перевел текст кнопки -->
            <button data-action="delete">Удалить</button> <!-- Перевел текст кнопки -->
            <button data-action="save" class="save" style="display:none;">Сохранить</button> <!-- Перевел текст кнопки -->
            <button data-action="cancel" class="cancel" style="display:none;">Отменить</button> <!-- Перевел текст кнопки -->
            ${todo.deadline ? `<span class="deadline">Срок: ${todo.deadline}</span>` : ''}
        `;

        todoList.appendChild(listItem);
    });
}

// добавление
function addTodo() {
    const text = newTodoInput.value.trim();
    const priority = prioritySelect.value;
    const deadline = deadlineInput.value;
    if (text !== '') {
        dispatch(addTodoAction(text, priority, deadline));
        newTodoInput.value = '';
        prioritySelect.value = 'low';
        deadlineInput.value = '';
        todos = todos.map((todo, index) =>
          index === todos.length - 1 ? { ...todo, createdAt: new Date().getTime() } : todo
        );

    }
}

function updateTheme() {
    if (darkMode) {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
}

function toggleTheme() {
    darkMode = !darkMode;
    updateTheme();
    saveThemeToLocalStorage();
}

addTodoButton.addEventListener('click', addTodo);

newTodoInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTodo();
    }
});

todoList.addEventListener('click', (event) => {
    const target = event.target;
    const listItem = target.closest('.todo-item');
    const index = parseInt(listItem.dataset.index);
    const action = target.dataset.action;

    if (action === 'toggle') {
        dispatch(toggleCompleteAction(index));
    } else if (action === 'delete') {
        dispatch(deleteTodoAction(index));
    } else if (action === 'edit') {
        listItem.classList.add('editing');
        const input = listItem.querySelector('.edit-input');
        input.style.display = 'inline';
        input.focus();

        listItem.querySelector('span').style.display = 'none';
        target.style.display = 'none';
        listItem.querySelector('.save').style.display = 'inline';
        listItem.querySelector('.cancel').style.display = 'inline';
    } else if (action === 'save') {
        const input = listItem.querySelector('.edit-input');
        const newText = input.value.trim();
        if (newText !== '') {
            dispatch(updateTodoAction(index, newText));
        }
        listItem.classList.remove('editing');
        renderTodoList();
    } else if (action === 'cancel') {
        listItem.classList.remove('editing');
        renderTodoList();
    }
});

themeToggleButton.addEventListener('click', toggleTheme);

filterAllButton.addEventListener('click', () => {
    dispatch(setFilterAction('all'));
    setActiveFilterButton(filterAllButton);
});

filterActiveButton.addEventListener('click', () => {
    dispatch(setFilterAction('active'));
    setActiveFilterButton(filterActiveButton);
});

filterCompletedButton.addEventListener('click', () => {
    dispatch(setFilterAction('completed'));
    setActiveFilterButton(filterCompletedButton);
});

sortBySelect.addEventListener('change', (e) => {
    dispatch(setSortAction(e.target.value));
});

searchTermInput.addEventListener('input', (e) => {
    dispatch(setSearchTermAction(e.target.value));
});

function setActiveFilterButton(button) {
    filterAllButton.classList.remove('active');
    filterActiveButton.classList.remove('active');
    filterCompletedButton.classList.remove('active');
    button.classList.add('active');
}

loadTodosFromLocalStorage();
loadThemeFromLocalStorage();
updateTheme();
renderTodoList();