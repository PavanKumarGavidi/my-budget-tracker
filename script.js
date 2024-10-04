// Initialize categories
const categories = {
    income: ['Salary', 'Freelance', 'Investments', 'Other'],
    expense: ['Rent', 'Groceries', 'Utilities', 'Entertainment', 'Other']
};

// Initialize data structure
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// DOM elements
const form = document.getElementById('transaction-form');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const balanceEl = document.getElementById('balance');
const transactionListEl = document.getElementById('transactions');
const expenseChartEl = document.getElementById('expense-chart');

// Event listeners
form.addEventListener('submit', addTransaction);
typeSelect.addEventListener('change', updateCategoryOptions);

// Initialize the app
function init() {
    updateCategoryOptions();
    updateSummary();
    renderTransactionList();
    renderExpenseChart();
}

// Update category options based on transaction type
function updateCategoryOptions() {
    const type = typeSelect.value;
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    if (type) {
        categories[type].forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}

// Add new transaction
function addTransaction(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const type = typeSelect.value;
    const category = categorySelect.value;
    
    if (isNaN(amount) || !description || !type || !category) {
        alert('Please fill in all fields');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        amount: type === 'expense' ? -amount : amount,
        description,
        type,
        category,
        date: new Date().toISOString()
    };
    
    transactions.push(transaction);
    updateLocalStorage();
    updateSummary();
    renderTransactionList();
    renderExpenseChart();
    
    form.reset();
    updateCategoryOptions();
}

// Update local storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update financial summary
function updateSummary() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const balance = totalIncome - totalExpenses;
    
    totalIncomeEl.textContent = formatCurrency(totalIncome);
    totalExpensesEl.textContent = formatCurrency(totalExpenses);
    balanceEl.textContent = formatCurrency(balance);
}

// Render transaction list
function renderTransactionList() {
    transactionListEl.innerHTML = '';
    transactions.slice().reverse().forEach(transaction => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${transaction.description}</strong>
                <small>${transaction.category}</small>
            </div>
            <span class="${transaction.type}">${formatCurrency(Math.abs(transaction.amount))}</span>
        `;
        transactionListEl.appendChild(li);
    });
}

// Render expense chart
function renderExpenseChart() {
    const expenseData = categories.expense.map(category => {
        const total = transactions
            .filter(t => t.type === 'expense' && t.category === category)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return total;
    });
    
    const ctx = expenseChartEl.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.expenseChart) {
        window.expenseChart.destroy();
    }
    
    window.expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories.expense,
            datasets: [{
                data: expenseData,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'right',
                labels: {
                    boxWidth: 12,
                    fontSize: 10
                }
            },
            title: {
                display: false
            }
        }
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Initialize the app
init();