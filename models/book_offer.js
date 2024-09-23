class BookOffer {
    constructor(id, title, desc, language, year, publisher, authors, image_path, price_options) {
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.language = language;
        this.year = year;
        this.publisher = publisher;
        this.authors = authors;
        this.image_path = image_path;
        this.price_options = price_options;
    }
}

class BookPriceOption {
    constructor(state, price) {
        this.state = state;
        this.price = price;
    }
}
