class BookOffer {
    constructor(id, title, desc, language, year, publisher, authors, series_id, series_name, volume, image_path, price_options) {
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.language = language;
        this.year = year;
        this.publisher = publisher;
        this.authors = authors;
        this.series_id = series_id;
        this.series_name = series_name;
        this.volume = volume;
        this.image_path = image_path;
        this.price_options = price_options;
    }
}

class BookPriceOption {
    constructor(id, state, price, count) {
        this.id = id;
        this.state = state;
        this.price = price;
        this.count = count;
    }
}

class BookOfferView {
    constructor(id, title, authors, image_path, min_price, total_count) {
        this.id = id;
        this.image_path = image_path;
        this.title= title;
        this.authors= authors;
        this.min_price= min_price;
        this.total_count= total_count;
    }

}

class BookFilter {
    constructor(filter_name, filter_display_name, items) {
        this.filter_name = filter_name;
        this.filter_display_name = filter_display_name;
        this.items = items;
    }
}

class BookFilterItem {
    constructor(id, name, child_items) {
        this.id = id;
        this.name = name;
        this.child_items = child_items;
    }
}

export { BookOffer, BookPriceOption, BookFilter, BookFilterItem, BookOfferView };
