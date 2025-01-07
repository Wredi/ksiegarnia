import Category from '../models/Category.mjs';
import Language from '../models/Language.mjs';
import State from '../models/State.mjs';
import Series from '../models/Series.mjs';
import Book from '../models/Book.mjs';
import BookOption from '../models/BookOption.mjs';

async function insertData() {
    const series = await Series.create({ name: 'II wojna światowa.' });

    const languages = await Language.insertMany([
        { name: 'Angielski' },
        { name: 'Polski' }
    ]);

    const states = await State.insertMany([
        { name: 'Nowy' },
        { name: 'Bardzo dobry' },
        { name: 'Dobry' },
        { name: 'Zniszczone' }
    ]);

    const preCategory = await Category.create({ name: 'Wojny', parentCategory: null });

    const categories = await Category.insertMany([
        { name: 'Podręczniki', parentCategory: null },
        { name: 'Katalogi', parentCategory: null },
        { name: 'Informatory', parentCategory: null },
        { name: 'Przewodniki', parentCategory: null },
        { name: 'Atlasy', parentCategory: null },
        { name: 'Albumy', parentCategory: null },
        { name: 'Beletrystyka', parentCategory: null },
        { name: 'Historia', parentCategory: null },
        { name: 'I wojna światowa', parentCategory: preCategory._id },
        { name: 'II wojna światowa', parentCategory: preCategory._id },
        { name: 'Czasy starożytne', parentCategory: null }
    ]);

    const books = await Book.insertMany([
        {
            title: 'W pustyni i w puszczy',
            description: 'Przygody polskiego chłopca i afrykańskiej dziewczynki w Afryce.',
            language: languages[1]._id,
            category: categories[6]._id,
            series: null,
            volume: null,
            year: 1911,
            publisher: 'Gebethner i Wolff',
            authors: 'Henryk Sienkiewicz',
            imagePath: 'example1.jpg'
        },
        {
            title: 'Krzyżacy',
            description: 'Opowieść o wojnie Polski z Zakonem Krzyżackim.',
            language: languages[1]._id,
            category: categories[6]._id,
            series: null,
            volume: null,
            year: 1900,
            publisher: 'Gebethner i Wolff',
            authors: 'Henryk Sienkiewicz',
            imagePath: 'example2.jpg'
        },
        {
            title: 'Przewodnik po Paryżu',
            description: 'Praktyczny przewodnik po atrakcjach i kulturze Paryża.',
            language: languages[1]._id,
            category: categories[3]._id,
            series: null,
            volume: null,
            year: 2021,
            publisher: 'Pascal',
            authors: 'Piotr Kowalski',
            imagePath: 'example3.jpg'
        },
        {
            title: 'Atlas geograficzny',
            description: 'Zbiór map świata, kontynentów i państw.',
            language: languages[1]._id,
            category: categories[4]._id,
            series: null,
            volume: null,
            year: 2019,
            publisher: 'Demart',
            authors: 'Jan Nowak',
            imagePath: 'example4.jpg'
        },
        {
            title: 'Historia starożytna',
            description: 'Książka opisująca starożytne cywilizacje, takie jak Egipt i Mezopotamia.',
            language: languages[1]._id,
            category: categories[10]._id,
            series: null,
            volume: null,
            year: 2015,
            publisher: 'Wydawnictwo Literackie',
            authors: 'Tadeusz Zieliński',
            imagePath: 'example5.jpg'
        },
        {
            title: 'Bitwa pod Verdun',
            description: 'Opowieść o jednej z najważniejszych bitew I wojny światowej.',
            language: languages[1]._id,
            category: categories[8]._id,
            series: null,
            volume: null,
            year: 2017,
            publisher: 'Znak',
            authors: 'Jacek Kaczmarek',
            imagePath: 'example6.jpg'
        },
        {
            title: 'II wojna światowa. Tom 1',
            description: 'Kompleksowa historia drugiej wojny światowej.',
            language: languages[1]._id,
            category: categories[9]._id,
            series: series._id,
            volume: 1,
            year: 2005,
            publisher: 'Zysk i S-ka',
            authors: 'Norman Davies',
            imagePath: 'example7.jpg'
        },
        {
            title: 'II wojna światowa. Tom 2',
            description: 'Jeszcze więcej wojny.',
            language: languages[1]._id,
            category: categories[9]._id,
            series: series._id,
            volume: 2,
            year: 2008,
            publisher: 'Zysk i S-ka',
            authors: 'Norman Davies',
            imagePath: 'example7.jpg'
        },
        {
            title: 'Przewodnik po Włoszech',
            description: 'Wszystko, co trzeba wiedzieć o podróży po Włoszech.',
            language: languages[1]._id,
            category: categories[3]._id,
            series: null,
            volume: null,
            year: 2019,
            publisher: 'Pascal',
            authors: 'Anna Nowak',
            imagePath: 'example8.jpg'
        },
        {
            title: 'Album Sztuki Renesansowej',
            description: 'Piękne ilustracje i historie dzieł sztuki renesansowej.',
            language: languages[1]._id,
            category: categories[5]._id,
            series: null,
            volume: null,
            year: 2018,
            publisher: 'Arkady',
            authors: 'Jan Kowalski',
            imagePath: 'example9.jpg'
        },
        {
            title: 'Angielskie idiomy',
            description: 'Zbiór najczęściej używanych angielskich idiomów.',
            language: languages[0]._id,
            category: categories[2]._id,
            series: null,
            volume: null,
            year: 2020,
            publisher: 'Oxford University Press',
            authors: 'John Smith',
            imagePath: 'example10.jpg'
        }
    ]);

    await BookOption.insertMany([
        { book: books[0]._id, state: states[0]._id, price: 15.99, count: 10 },
        { book: books[0]._id, state: states[2]._id, price: 10.99, count: 0 },
        { book: books[1]._id, state: states[0]._id, price: 18.99, count: 0 },
        { book: books[2]._id, state: states[0]._id, price: 19.50, count: 15 },
        { book: books[3]._id, state: states[1]._id, price: 25.00, count: 7 },
        { book: books[4]._id, state: states[0]._id, price: 22.00, count: 12 },
        { book: books[4]._id, state: states[1]._id, price: 12.00, count: 12 },
        { book: books[4]._id, state: states[2]._id, price: 10.00, count: 15 },
        { book: books[5]._id, state: states[2]._id, price: 9.99, count: 6 },
        { book: books[6]._id, state: states[1]._id, price: 30.00, count: 8 },
        { book: books[6]._id, state: states[2]._id, price: 12.00, count: 0 },
        { book: books[7]._id, state: states[0]._id, price: 17.99, count: 10 },
        { book: books[8]._id, state: states[0]._id, price: 34.99, count: 5 },
        { book: books[9]._id, state: states[0]._id, price: 12.99, count: 20 },
        { book: books[10]._id, state: states[0]._id, price: 20.99, count: 0 }
    ]);
}

export { insertData };
