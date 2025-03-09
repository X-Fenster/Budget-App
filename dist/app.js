var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var BudgetApp = /** @class */ (function () {
    function BudgetApp() {
        this.transactions = [];
        this.nextId = 1;
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.updateSummary();
        this.renderTransactions();
    }
    BudgetApp.prototype.setupEventListeners = function () {
        var budgetForm = document.getElementById("budgetForm");
        var filterSelect = document.getElementById("filter");
        budgetForm.addEventListener("submit", this.handleFormSubmit.bind(this));
        filterSelect.addEventListener("change", this.renderTransactions.bind(this));
    };
    BudgetApp.prototype.handleFormSubmit = function (event) {
        event.preventDefault();
        var form = event.target;
        var description = document.getElementById("description").value;
        var category = document.getElementById("category")
            .value;
        var amount = parseFloat(document.getElementById("amount").value);
        var type = document.getElementById("type")
            .value;
        if (description && category && amount && !isNaN(amount)) {
            this.addTransaction({
                id: this.nextId++,
                description: description,
                category: category,
                amount: amount,
                type: type,
                date: new Date(),
            });
            form.reset();
        }
    };
    BudgetApp.prototype.addTransaction = function (transaction) {
        this.transactions.push(transaction);
        this.saveToLocalStorage();
        this.updateSummary();
        this.renderTransactions();
    };
    BudgetApp.prototype.deleteTransaction = function (id) {
        this.transactions = this.transactions.filter(function (transaction) { return transaction.id !== id; });
        this.saveToLocalStorage();
        this.updateSummary();
        this.renderTransactions();
    };
    BudgetApp.prototype.updateSummary = function () {
        var income = this.transactions
            .filter(function (t) { return t.type === "income"; })
            .reduce(function (sum, transaction) { return sum + transaction.amount; }, 0);
        var expense = this.transactions
            .filter(function (t) { return t.type === "expense"; })
            .reduce(function (sum, transaction) { return sum + transaction.amount; }, 0);
        var balance = income - expense;
        document.getElementById("income").textContent = "".concat(income.toFixed(2), " \u20AC");
        document.getElementById("expense").textContent = "".concat(expense.toFixed(2), " \u20AC");
        document.getElementById("balance").textContent = "".concat(balance.toFixed(2), " \u20AC");
        // Farbe des Kontostands je nach Wert anpassen
        var balanceElement = document.getElementById("balance");
        if (balance < 0) {
            balanceElement.classList.add("negative");
            balanceElement.classList.remove("positive");
        }
        else {
            balanceElement.classList.add("positive");
            balanceElement.classList.remove("negative");
        }
    };
    BudgetApp.prototype.renderTransactions = function () {
        var _this = this;
        var transactionList = document.getElementById("transactionList");
        var filterValue = document.getElementById("filter")
            .value;
        // Liste leeren
        transactionList.innerHTML = "";
        // Gefilterte Transaktionen
        var filteredTransactions = __spreadArray([], this.transactions, true);
        if (filterValue === "income") {
            filteredTransactions = filteredTransactions.filter(function (t) { return t.type === "income"; });
        }
        else if (filterValue === "expense") {
            filteredTransactions = filteredTransactions.filter(function (t) { return t.type === "expense"; });
        }
        // Nach Datum sortieren (neueste zuerst)
        filteredTransactions.sort(function (a, b) { return b.date.getTime() - a.date.getTime(); });
        // Transaktionen rendern
        filteredTransactions.forEach(function (transaction) {
            var listItem = document.createElement("li");
            listItem.classList.add("transaction-item");
            listItem.classList.add(transaction.type);
            var date = new Date(transaction.date);
            var formattedDate = "".concat(date.getDate().toString().padStart(2, "0"), ".").concat((date.getMonth() + 1)
                .toString()
                .padStart(2, "0"), ".").concat(date.getFullYear());
            listItem.innerHTML = "\n        <div class=\"transaction-info\">\n          <div class=\"transaction-description\">".concat(transaction.description, "</div>\n          <div class=\"transaction-category\">").concat(transaction.category, "</div>\n          <div class=\"transaction-date\">").concat(formattedDate, "</div>\n          <div class=\"transaction-amount ").concat(transaction.type === "income" ? "positive" : "negative", "\">\n            ").concat(transaction.type === "income" ? "+" : "-", " ").concat(transaction.amount.toFixed(2), " \u20AC\n          </div>\n        </div>\n        <button class=\"delete-btn\" data-id=\"").concat(transaction.id, "\">\u00D7</button>\n      ");
            var deleteButton = listItem.querySelector(".delete-btn");
            deleteButton.addEventListener("click", function () {
                _this.deleteTransaction(transaction.id);
            });
            transactionList.appendChild(listItem);
        });
    };
    BudgetApp.prototype.saveToLocalStorage = function () {
        localStorage.setItem("transactions", JSON.stringify(this.transactions));
        localStorage.setItem("nextId", this.nextId.toString());
    };
    BudgetApp.prototype.loadFromLocalStorage = function () {
        var savedTransactions = localStorage.getItem("transactions");
        var savedNextId = localStorage.getItem("nextId");
        if (savedTransactions) {
            this.transactions = JSON.parse(savedTransactions);
            // Datum-Strings in Date-Objekte umwandeln
            this.transactions.forEach(function (t) {
                t.date = new Date(t.date);
            });
        }
        if (savedNextId) {
            this.nextId = parseInt(savedNextId);
        }
    };
    return BudgetApp;
}());
// App initialisieren, wenn das DOM geladen ist
document.addEventListener("DOMContentLoaded", function () {
    new BudgetApp();
});
