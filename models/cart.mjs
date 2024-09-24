class CartBookView {
    constructor(option_id, title, authors, state, price, quantity, total_price) {
        this.option_id = option_id;
        this.title = title;
        this.authors = authors;
        this.state = state;
        this.price = price;
        this.quantity = quantity;
        this.total_price = total_price;
    }
}

class Cart {
    constructor(sum, discount, total, books) {
        this.sum = sum;
        this.discount = discount;
        this.total = total;
        this.books = books;
    }
}

export { Cart, CartBookView };
