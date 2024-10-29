document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    fetchUsername();
    initializeCalendar();
    fetchTasks();

    document.getElementById('task-form').addEventListener('submit', event => {
        event.preventDefault();
        const taskId = document.getElementById('task-id').value;
        const taskDate = document.getElementById('task-date').value;
        const taskTitle = document.getElementById('task-title').value;
        const taskDesc = document.getElementById('task-desc').value;
        const taskStartTime = document.getElementById('task-start-time').value;
        const taskEndTime = document.getElementById('task-end-time').value;

        if (taskId) {
            updateTask(taskId, taskDate, taskTitle, taskDesc, taskStartTime, taskEndTime);
        } else {
            addTask(taskDate, taskTitle, taskDesc, taskStartTime, taskEndTime);
        }
    });

    document.getElementById('logout-button').addEventListener('click', () => {
        logout();
    });
});

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let tasks = [];
let selectedDayElement = null;

const holidays = {
    '2023-01-01': 'New Year\'s Day',
    '2023-04-05': 'Ching Ming Festival',
    '2023-05-01': 'Labour Day',
    '2023-07-01': 'HKSAR Establishment Day',
    '2023-10-01': 'National Day',
    '2023-12-25': 'Christmas Day',
    // Add more holidays as needed
};

function fetchUsername() {
    fetch('php/get_username.php')
        .then(response => response.json())
        .then(data => {
            const welcomeMessage = document.getElementById('welcome-message');
            welcomeMessage.textContent = `Welcome back, ${data.username}, let's check your schedule!`;
        })
        .catch(error => console.error('Error fetching username:', error));
}

function initializeCalendar() {
    document.getElementById('prev-year').addEventListener('click', () => changeYear(-1));
    document.getElementById('next-year').addEventListener('click', () => changeYear(1));
    document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
    renderCalendar();
}

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

function changeYear(delta) {
    currentYear += delta;
    renderCalendar();
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    document.getElementById('calendar-title').textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Add days of the week
    daysOfWeek.forEach(day => {
        const dayOfWeekCell = document.createElement('div');
        dayOfWeekCell.classList.add('calendar-day-of-week');
        dayOfWeekCell.textContent = day;
        calendar.appendChild(dayOfWeekCell);
    });

    // Adjust first day to start from Monday
    const adjustedFirstDay = (firstDay === 0 ? 6 : firstDay - 1);

    for (let i = 0; i < adjustedFirstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day');
        calendar.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()) {
            dayCell.classList.add('today');
        }
        if (holidays[dateStr]) {
            dayCell.classList.add('holiday');
            dayCell.title = holidays[dateStr];
        }
        dayCell.textContent = day;
        dayCell.addEventListener('click', () => selectDay(dayCell, day));
        calendar.appendChild(dayCell);

        // Render tasks for the day
        const taskList = document.createElement('ul');
        tasks.forEach(task => {
            if (task.date === dateStr) {
                const taskItem = document.createElement('li');
                const startTime = formatTime(task.start_time);
                const endTime = formatTime(task.end_time);
                taskItem.innerHTML = `<strong>${task.title}</strong><br>${startTime} - ${endTime}`;
                taskList.appendChild(taskItem);
            }
        });
        dayCell.appendChild(taskList);
    }
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
}

function selectDay(dayCell, day) {
    if (selectedDayElement === dayCell) {
        toggleTaskForm();
        return;
    }
    if (selectedDayElement) {
        selectedDayElement.classList.remove('selected');
    }
    selectedDayElement = dayCell;
    dayCell.classList.add('selected');
    openTaskForm(day);
}

function openTaskForm(day) {
    const taskDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    document.getElementById('task-date').value = taskDate;
    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value = '';
    document.getElementById('task-start-time').value = '';
    document.getElementById('task-end-time').value = '';
    document.getElementById('task-id').value = '';
    showTaskForm();
}

function showTaskForm() {
    const taskForm = document.getElementById('task-form');
    taskForm.classList.add('visible');
}

function toggleTaskForm() {
    const taskForm = document.getElementById('task-form');
    taskForm.classList.toggle('visible');
}

function fetchTasks() {
    console.log('Fetching tasks...');
    fetch('php/get_tasks.php')
        .then(response => response.json())
        .then(data => {
            console.log('Tasks fetched:', data);
            tasks = data.tasks;
            renderCalendar();
        })
        .catch(error => console.error('Error fetching tasks:', error));
}

function addTask(date, title, description, startTime, endTime) {
    console.log('Adding task...');
    fetch('php/add_task.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date, title, description, startTime, endTime })
    }).then(() => {
        fetchTasks();
        document.getElementById('task-form').reset();
        hideTaskForm();
    }).catch(error => console.error('Error adding task:', error));
}

function updateTask(id, date, title, description, startTime, endTime) {
    console.log('Updating task...');
    fetch('php/update_task.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, date, title, description, startTime, endTime })
    }).then(() => {
        fetchTasks();
        document.getElementById('task-form').reset();
        hideTaskForm();
    }).catch(error => console.error('Error updating task:', error));
}

function deleteTask(id) {
    console.log('Deleting task...');
    fetch('php/delete_task.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    }).then(() => {
        fetchTasks();
    }).catch(error => console.error('Error deleting task:', error));
}

function hideTaskForm() {
    const taskForm = document.getElementById('task-form');
    taskForm.classList.remove('visible');
}

function logout() {
    console.log('Logging out...');
    fetch('php/logout.php')
        .then(() => {
            window.location.href = 'login.html';
        })
        .catch(error => console.error('Error logging out:', error));
}