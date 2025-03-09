interface Transaction {
  id: number;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: Date;
}

class BudgetApp {
  private transactions: Transaction[] = [];
  private nextId: number = 1;

  constructor() {
    this.loadFromLocalStorage();
    this.setupEventListeners();
    this.updateSummary();
    this.renderTransactions();
  }

  private setupEventListeners(): void {
    const budgetForm = document.getElementById("budgetForm") as HTMLFormElement;
    const filterSelect = document.getElementById("filter") as HTMLSelectElement;

    budgetForm.addEventListener("submit", this.handleFormSubmit.bind(this));
    filterSelect.addEventListener("change", this.renderTransactions.bind(this));
  }

  private handleFormSubmit(event: Event): void {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const description = (
      document.getElementById("description") as HTMLInputElement
    ).value;
    const category = (document.getElementById("category") as HTMLInputElement)
      .value;
    const amount = parseFloat(
      (document.getElementById("amount") as HTMLInputElement).value
    );
    const type = (document.getElementById("type") as HTMLSelectElement)
      .value as "income" | "expense";

    if (description && category && amount && !isNaN(amount)) {
      this.addTransaction({
        id: this.nextId++,
        description,
        category,
        amount,
        type,
        date: new Date(),
      });

      form.reset();
    }
  }

  private addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
    this.saveToLocalStorage();
    this.updateSummary();
    this.renderTransactions();
  }

  private deleteTransaction(id: number): void {
    this.transactions = this.transactions.filter(
      (transaction) => transaction.id !== id
    );
    this.saveToLocalStorage();
    this.updateSummary();
    this.renderTransactions();
  }

  private updateSummary(): void {
    const income = this.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const expense = this.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const balance = income - expense;

    (
      document.getElementById("income") as HTMLElement
    ).textContent = `${income.toFixed(2)} €`;
    (
      document.getElementById("expense") as HTMLElement
    ).textContent = `${expense.toFixed(2)} €`;
    (
      document.getElementById("balance") as HTMLElement
    ).textContent = `${balance.toFixed(2)} €`;

    // Farbe des Kontostands je nach Wert anpassen
    const balanceElement = document.getElementById("balance") as HTMLElement;
    if (balance < 0) {
      balanceElement.classList.add("negative");
      balanceElement.classList.remove("positive");
    } else {
      balanceElement.classList.add("positive");
      balanceElement.classList.remove("negative");
    }
  }

  private renderTransactions(): void {
    const transactionList = document.getElementById(
      "transactionList"
    ) as HTMLUListElement;
    const filterValue = (document.getElementById("filter") as HTMLSelectElement)
      .value;

    // Liste leeren
    transactionList.innerHTML = "";

    // Gefilterte Transaktionen
    let filteredTransactions = [...this.transactions];

    if (filterValue === "income") {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.type === "income"
      );
    } else if (filterValue === "expense") {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.type === "expense"
      );
    }

    // Nach Datum sortieren (neueste zuerst)
    filteredTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Transaktionen rendern
    filteredTransactions.forEach((transaction) => {
      const listItem = document.createElement("li");
      listItem.classList.add("transaction-item");
      listItem.classList.add(transaction.type);

      const date = new Date(transaction.date);
      const formattedDate = `${String(date.getDate()).padStart(
        2,
        "0"
      )}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;

      listItem.innerHTML = `
        <div class="transaction-info">
          <div class="transaction-description">${transaction.description}</div>
          <div class="transaction-category">${transaction.category}</div>
          <div class="transaction-date">${formattedDate}</div>
          <div class="transaction-amount ${
            transaction.type === "income" ? "positive" : "negative"
          }">
            ${
              transaction.type === "income" ? "+" : "-"
            } ${transaction.amount.toFixed(2)} €
          </div>
        </div>
        <button class="delete-btn" data-id="${transaction.id}">×</button>
      `;

      const deleteButton = listItem.querySelector(
        ".delete-btn"
      ) as HTMLButtonElement;
      deleteButton.addEventListener("click", () => {
        this.deleteTransaction(transaction.id);
      });

      transactionList.appendChild(listItem);
    });
  }

  private saveToLocalStorage(): void {
    localStorage.setItem("transactions", JSON.stringify(this.transactions));
    localStorage.setItem("nextId", this.nextId.toString());
  }

  private loadFromLocalStorage(): void {
    const savedTransactions = localStorage.getItem("transactions");
    const savedNextId = localStorage.getItem("nextId");

    if (savedTransactions) {
      this.transactions = JSON.parse(savedTransactions);
      // Datum-Strings in Date-Objekte umwandeln
      this.transactions.forEach((t) => {
        t.date = new Date(t.date);
      });
    }

    if (savedNextId) {
      this.nextId = parseInt(savedNextId);
    }
  }
}

// App initialisieren, wenn das DOM geladen ist
document.addEventListener("DOMContentLoaded", () => {
  new BudgetApp();
});
