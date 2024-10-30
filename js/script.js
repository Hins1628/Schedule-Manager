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

        if (!validateTime(taskStartTime, taskEndTime)) {
            alert('Start time must be before end time.');
            return;
        }

        if (taskId) {
            updateTask(taskId, taskDate, taskTitle, taskDesc, taskStartTime, taskEndTime);
        } else {
            addTask(taskDate, taskTitle, taskDesc, taskStartTime, taskEndTime);
        }
    });

    document.getElementById('logout-button').addEventListener('click', () => {
        logout();
    });

    document.getElementById('prev-tasks-page').addEventListener('click', () => {
        if (upcomingTasksPage > 0) {
            upcomingTasksPage--;
            renderUpcomingTasks();
        }
    });

    document.getElementById('next-tasks-page').addEventListener('click', () => {
        upcomingTasksPage++;
        renderUpcomingTasks();
    });
});

function validateTime(startTime, endTime) {
    return startTime < endTime;
}

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let tasks = [];
let selectedDayElement = null;
let upcomingTasksPage = 0;
const tasksPerPage = 5;

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
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Username fetched:', data);
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
        const dayTasks = tasks.filter(task => task.date === dateStr);
        dayTasks.sort((a, b) => a.start_time.localeCompare(b.start_time));
        dayTasks.forEach(task => {
            const taskItem = document.createElement('li');
            const startTime = formatTime(task.start_time);
            const endTime = formatTime(task.end_time);
            //taskItem.innerHTML = `<strong>${task.title}</strong><br>${startTime} - ${endTime}`;
            taskItem.innerHTML = `<strong>${task.title}</strong><br>`;
            taskList.appendChild(taskItem);
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
    showAlreadyAddedTasks(taskDate);
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
            renderUpcomingTasks();
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

function renderUpcomingTasks() {
    const upcomingTasksContainer = document.getElementById('upcoming-tasks');
    upcomingTasksContainer.innerHTML = '';
    const now = new Date();
    const sortedTasks = tasks
        .filter(task => {
            const taskStart = new Date(task.date + ' ' + task.start_time);
            const taskEnd = new Date(task.date + ' ' + task.end_time);
            return taskStart > now || (taskStart <= now && taskEnd > now);
        })
        .sort((a, b) => new Date(a.date + ' ' + a.start_time) - new Date(b.date + ' ' + b.start_time));
    const startIndex = upcomingTasksPage * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    const paginatedTasks = sortedTasks.slice(startIndex, endIndex);

    paginatedTasks.forEach(task => {
        const taskItem = document.createElement('li');
        const startTime = formatTime(task.start_time);
        const endTime = formatTime(task.end_time);
        taskItem.innerHTML = `<p><strong>${task.title}</strong><br>${task.date} ${startTime} - ${endTime}</p>`;
        
        // Add delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering the jump to date
            deleteTask(task.id);
        });
        taskItem.appendChild(deleteButton);

        taskItem.addEventListener('click', () => {
            jumpToTaskDate(task.date);
        });
        upcomingTasksContainer.appendChild(taskItem);
    });

    const paginationControls = document.createElement('div');
    paginationControls.classList.add('pagination-controls');

    if (upcomingTasksPage > 0) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
            upcomingTasksPage--;
            renderUpcomingTasks();
        });
        paginationControls.appendChild(prevButton);
    }

    if (endIndex < sortedTasks.length) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            upcomingTasksPage++;
            renderUpcomingTasks();
        });
        paginationControls.appendChild(nextButton);
    }

    upcomingTasksContainer.appendChild(paginationControls);
}

function jumpToTaskDate(date) {
    const [year, month, day] = date.split('-').map(Number);
    currentYear = year;
    currentMonth = month - 1;
    renderCalendar();

    // Calculate the index of the day cell
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const adjustedFirstDay = (firstDay === 0 ? 6 : firstDay - 1);
    const dayIndex = adjustedFirstDay + day - 1; // Subtract 1 to account for zero-based index

    const dayCell = document.querySelectorAll('.calendar-day')[dayIndex];
    if (dayCell) {
        dayCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        dayCell.classList.add('selected');
        if (selectedDayElement) {
            selectedDayElement.classList.remove('selected');
        }
        selectedDayElement = dayCell;
    }
}