import { ObjectId } from 'mongodb';

async function insertData(db) {
    const series = await db.collection('series').insertOne({
        name: 'II wojna światowa.'
    });

    const languages = await db.collection('language').insertMany([
        {  name: 'Angielski' },
        {  name: 'Polski' }
    ]);

    const states = await db.collection('state').insertMany([
        {  name: 'Nowy' },
        {  name: 'Bardzo dobry' },
        {  name: 'Dobry' },
        {  name: 'Zniszczone' }
    ]);

    const preCategory = await db.collection('category').insertOne(
        {  name: 'Wojny', parent_category: null },
    );

    const categories = await db.collection('category').insertMany([
        {  name: 'Podręczniki', parent_category: null },
        {  name: 'Katalogi', parent_category: null },
        {  name: 'Informatory', parent_category: null },
        {  name: 'Przewodniki', parent_category: null },
        {  name: 'Atlasy', parent_category: null },
        {  name: 'Albumy', parent_category: null },
        {  name: 'Beletrystyka', parent_category: null },
        {  name: 'Historia', parent_category: null },
        {  name: 'I wojna światowa', parent_category: preCategory.insertedId },
        {  name: 'II wojna światowa', parent_category: preCategory.insertedId },
        {  name: 'Czasy starożytne', parent_category: null }
    ]);

    const books = await db.collection('book').insertMany([
        {
            title: 'W pustyni i w puszczy',
            description: 'Przygody polskiego chłopca i afrykańskiej dziewczynki w Afryce.',
            language_id: new ObjectId(languages.insertedIds[1]),
            category_id: new ObjectId(categories.insertedIds[6]),
            series_id: null,
            volume: null,
            year: 1911,
            publisher: 'Gebethner i Wolff',
            authors: 'Henryk Sienkiewicz',
            image_path: 'example1.jpg'
        },
        {
         
            title: 'Krzyżacy',
            description: 'Opowieść o wojnie Polski z Zakonem Krzyżackim.',
            language_id: new ObjectId(languages.insertedIds[1]),
            category_id: new ObjectId(categories.insertedIds[6]),
            series_id: null,
            volume: null,
            year: 1900,
            publisher: 'Gebethner i Wolff',
            authors: 'Henryk Sienkiewicz',
            image_path: 'example2.jpg'
        },
        {
        
            title: 'Przewodnik po Paryżu',
            description: 'Praktyczny przewodnik po atrakcjach i kulturze Paryża.',
            language_id: new ObjectId(languages.insertedIds[1]),
            category_id: new ObjectId(categories.insertedIds[3]),
            series_id: null,
            volume: null,
            year: 2021,
            publisher: 'Pascal',
            authors: 'Piotr Kowalski',
            image_path: 'example3.jpg'
        },
        {
       
            title: 'Atlas geograficzny',
            description: 'Zbiór map świata, kontynentów i państw.',
            language_id: new ObjectId(languages.insertedIds[1]),
            category_id: new ObjectId(categories.insertedIds[4]),
            series_id: null,
            volume: null,
            year: 2019,
            publisher: 'Demart',
            authors: 'Jan Nowak',
            image_path: 'example4.jpg'
        },
        {
      
            title: 'Historia starożytna',
            description: 'Książka opisująca starożytne cywilizacje, takie jak Egipt i Mezopotamia.',
            language_id: new ObjectId(languages.insertedIds[1]),
            category_id: new ObjectId(categories.insertedIds[10]),
            series_id: null,
            volume: null,
            year: 2015,
            publisher: 'Wydawnictwo Literackie',
            authors: 'Tadeusz Zieliński',
            image_path: 'example5.jpg'
        },
        {
     
            title: 'Bitwa pod Verdun',
            description: 'Opowieść o jednej z najważniejszych bitew I wojny światowej.',
            language_id: new ObjectId(languages.insertedIds[1]),
            category_id: new ObjectId(categories.insertedIds[8]),
            series_id: null,
            volume: null,
            year: 2017,
            publisher: 'Znak',
            authors: 'Jacek Kaczmarek',
            image_path: 'example6.jpg'
        },
        {

            title: 'II wojna światowa. Tom 1',
            description: 'Kompleksowa historia drugiej wojny światowej.',
            language_id: new ObjectId(languages.insertedIds[1]),
            category_id: new ObjectId(categories.insertedIds[9]),
            series_id: new ObjectId(series.insertedId),
            volume: 1,
            year: 2005,
            publisher: 'Zysk i S-ka',
            authors: 'Norman Davies',
            image_path: 'example7.jpg'
        },
        {

            title: 'II wojna światowa. Tom 2',
            description: 'Jeszcze więcej wojny.',
            language_id: new ObjectId(languages.insertedIds[1]),
            category_id: new ObjectId(categories.insertedIds[9]),
            series_id: new ObjectId(series.insertedId),
            volume: 2,
            year: 2008,
            publisher: 'Zysk i S-ka',
            authors: 'Norman Davies',
            image_path: 'example7.jpg'
        },
        {

            title: 'Przewodnik po Włoszech',
            description: 'Wszystko, co trzeba wiedzieć o podróży po Włoszech.',
            language_id: new ObjectId(languages.insertedIds[1]),
            category_id: new ObjectId(categories.insertedIds[3]),
            series_id: null,
            volume: null,
            year: 2019,
            publisher: 'Pascal',
            authors: 'Anna Nowak',
            image_path: 'example8.jpg'
        },
        {

            title: 'Album Sztuki Renesansowej',
            description: 'Piękne ilustracje i historie dzieł sztuki renesansowej.',
            language_id: new ObjectId(languages.insertedIds[1]),
            category_id: new ObjectId(categories.insertedIds[5]),
            series_id: null,
            volume: null,
            year: 2018,
            publisher: 'Arkady',
            authors: 'Jan Kowalski',
            image_path: 'example9.jpg'
        },
        {

            title: 'Angielskie idiomy',
            description: 'Zbiór najczęściej używanych angielskich idiomów.',
            language_id: new ObjectId(languages.insertedIds[0]),
            category_id: new ObjectId(categories.insertedIds[2]),
            series_id: null,
            volume: null,
            year: 2020,
            publisher: 'Oxford University Press',
            authors: 'John Smith',
            image_path: 'example10.jpg'
        }
    ]);

    await db.collection('book_option').insertMany([
        { book_id: books.insertedIds[0], state_id: new ObjectId(states.insertedIds[0]), price: 15.99, count: 10 },
        { book_id: books.insertedIds[0], state_id: new ObjectId(states.insertedIds[2]), price: 10.99, count: 0 },
        { book_id: books.insertedIds[1], state_id: new ObjectId(states.insertedIds[0]), price: 18.99, count: 0 },
        { book_id: books.insertedIds[2], state_id: new ObjectId(states.insertedIds[0]), price: 19.50, count: 15 },
        { book_id: books.insertedIds[3], state_id: new ObjectId(states.insertedIds[1]), price: 25.00, count: 7 },
        { book_id: books.insertedIds[4], state_id: new ObjectId(states.insertedIds[0]), price: 22.00, count: 12 },
        { book_id: books.insertedIds[4], state_id: new ObjectId(states.insertedIds[1]), price: 12.00, count: 12 },
        { book_id: books.insertedIds[4], state_id: new ObjectId(states.insertedIds[2]), price: 10.00, count: 15 },
        { book_id: books.insertedIds[5], state_id: new ObjectId(states.insertedIds[2]), price: 9.99, count: 6 },
        { book_id: books.insertedIds[6], state_id: new ObjectId(states.insertedIds[1]), price: 30.00, count: 8 },
        { book_id: books.insertedIds[6], state_id: new ObjectId(states.insertedIds[2]), price: 12.00, count: 0 },
        { book_id: books.insertedIds[7], state_id: new ObjectId(states.insertedIds[0]), price: 17.99, count: 10 },
        { book_id: books.insertedIds[8], state_id: new ObjectId(states.insertedIds[0]), price: 34.99, count: 5 },
        { book_id: books.insertedIds[9], state_id: new ObjectId(states.insertedIds[0]), price: 12.99, count: 20 },
        { book_id: books.insertedIds[10], state_id: new ObjectId(states.insertedIds[0]), price: 20.99, count: 0 }
    ]);
}

export { insertData };
