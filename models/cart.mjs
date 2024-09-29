class CartBookView {
    constructor(option_id, title, authors, state, price, quantity, total_price, available_quantity) {
        this.option_id = option_id;
        this.title = title;
        this.authors = authors;
        this.state = state;
        this.price = price;
        this.quantity = quantity;
        this.total_price = total_price;
        this.available_quantity = available_quantity;
    }
}

class Cart {
    constructor(sum, discount_percent, discount_sum, total, books) {
        this.sum = sum;
        this.discount_percent = discount_percent;
        this.discount_sum = discount_sum;
        this.total = total;
        this.books = books;
    }
}

export { Cart, CartBookView };
