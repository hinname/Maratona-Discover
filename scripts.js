const Modal = { //fazer função toggle
  New : {
    open() {
      //Abrir modal
      //Adicionar a class active ao modal
      document
            .querySelector('.modal-overlay.newTransaction')
            .classList
            .add('active')
    },
    close() {
          //fechar o modal
          //remover a classe active do modal
          document
                .querySelector('.modal-overlay.newTransaction')
                .classList
                .remove('active')
    }
  },

  RemoveAll : {
    open() {
      //Abrir modal
      //Adicionar a class active ao modal
      document
            .querySelector('.modal-overlay.removeAll')
            .classList
            .add('active')
    },
    close() {
          //fechar o modal
          //remover a classe active do modal
          document
                .querySelector('.modal-overlay.removeAll')
                .classList
                .remove('active')
    }
  }
  
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },

  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) //transformar a transactions em JSON string pq local storage so funciona com string
  }
}

const Transaction = {
  all: Storage.get(),

  add(transaction){
    Transaction.all.push(transaction);

    App.reload();
  },

  edit(index) {
    console.log(index)
  },

  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload();
  },

  removeAll() {

  },
  incomes() {
    //somar as entradas
    let income = 0;
    Transaction.all.forEach((transaction) => {
      if(transaction.amount > 0) {
        income += transaction.amount;
      }
    })

    return income;
  },
  expenses() {

    //somar as saídas
    let expense = 0;
    Transaction.all.forEach((transaction) => {
      if(transaction.amount < 0) {
        expense += transaction.amount;
      }
    })

    return expense;
  },
  total() {
    //entradas - saídas
    return Transaction.incomes() + Transaction.expenses(); // + pq sinal ja ta negativel
  }
}

const Utils = {

  formatAmount(value) {
    value = Number(value) * 100

    return Math.round(value);
  },

  formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "") //troca global replace(/0/g, "Discover")
    value = Number(value) / 100

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value;
  }

}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  formatFields() {
    let { description, amount, date } = Form.getValues()

    amount  = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },
  validateFields() {
    const { description, amount, date } = Form.getValues()

    if(description.trim() === "" || 
      amount.trim() ==="" ||
      date.trim() ==="") {
        throw new Error("Por favor, preencha todos os campos")
      }
  },
  submit(event) {
    event.preventDefault()

    try {
      //Garantir que não tenha campo vazio
      Form.validateFields()
      //formatar dados
      const transaction = Form.formatFields()
      //salvar
      Transaction.add(transaction)
      //apagar form
      Form.clearFields()
      Modal.New.close()


    } catch(error) {
      alert(error.message)
    }

    

  }
}

//Substituir os dados do HTML com os dados do JS
const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense"

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
            <img onclick="Transaction.edit(${index})" id="editimage" src="./assets/edit.svg" alt="Atualizar transação">
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
      </td>
    `

    return html
  },

  updateBalance() {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes());
    
    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses());

    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total());
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML=""
  }
}


const App = {
  init() {
    //para cada transaction ele faz o DOM.addTransaction
    Transaction.all.forEach(DOM.addTransaction) //atalho
    DOM.updateBalance();
    Storage.set(Transaction.all)
  },
  reload() {
    //LIMPAR TODOS OS CAMPOS DO TBODY PARA REPOPULAR DO ZERO
    DOM.clearTransactions()
    App.init()
  },
}

App.init();
