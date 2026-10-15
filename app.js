// DOM Element References
const balanceEl = document.getElementById("balance");
const moneyPlusEl = document.getElementById("money-plus");
const moneyMinusEl = document.getElementById("money-minus");
const listEl = document.getElementById("list");
const formEl = document.getElementById("form");
const textInput = document.getElementById("text");
const amountInput = document.getElementById("amount");

// Retrieve transactions from LocalStorage or initialize empty array
const STORAGE_KEY = "expense_tracker_transactions";
let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

/**
 * Handle form submission to add a new transaction
 */
function handleFormSubmit(e) {
  e.preventDefault();

  const description = textInput.value.trim();
  const amountVal = amountInput.value.trim();

  if (!description || !amountVal) {
    alert("Please provide both a description and a valid amount.");
    return;
  }

  const newTransaction = {
    id: generateUniqueId(),
    text: description,
    amount: parseFloat(amountVal),
  };

  transactions.push(newTransaction);

  syncAndRefresh();
  resetForm();
}

/**
 * Generate a unique numeric ID using timestamp and random fallback
 */
function generateUniqueId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Render a single transaction item into the DOM list
 */
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const absAmount = Math.abs(transaction.amount).toFixed(2);
  const cssClass = transaction.amount < 0 ? "minus" : "plus";

  const listItem = document.createElement("li");
  listItem.classList.add(cssClass);

  listItem.innerHTML = `
        ${escapeHTML(transaction.text)} 
        <span>${sign}$${absAmount}</span>
        <button class="delete-btn" aria-label="Delete transaction" onclick="removeTransaction(${transaction.id})">x</button>
    `;

  listEl.appendChild(listItem);
}

/**
 * Basic HTML sanitizer to prevent injection via list text
 */
function escapeHTML(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        tag
      ] || tag,
  );
}

/**
 * Remove a specific transaction by its ID
 */
function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  syncAndRefresh();
}

/**
 * Update financial summary figures (Balance, Income, Expense)
 */
function updateValues() {
  const amounts = transactions.map((t) => t.amount);

  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);

  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => acc + item, 0)
    .toFixed(2);

  const expense = (
    amounts.filter((item) => item < 0).reduce((acc, item) => acc + item, 0) * -1
  ).toFixed(2);

  balanceEl.innerText = `$${total}`;
  moneyPlusEl.innerText = `+$${income}`;
  moneyMinusEl.innerText = `-$${expense}`;
}

/**
 * Save current state to LocalStorage
 */
function updateLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

/**
 * Reset form input fields
 */
function resetForm() {
  textInput.value = "";
  amountInput.value = "";
  textInput.focus();
}

/**
 * Synchronize storage, redraw UI elements, and update calculations
 */
function syncAndRefresh() {
  listEl.innerHTML = "";
  transactions.forEach(addTransactionDOM);
  updateValues();
  updateLocalStorage();
}

// Initialize application on load
function init() {
  syncAndRefresh();
  formEl.addEventListener("submit", handleFormSubmit);
}

init();
