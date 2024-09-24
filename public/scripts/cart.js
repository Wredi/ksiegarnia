document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.querySelector('.cart-container');
    const cartItems = document.querySelector('.cart-items');
    const summaryDetails = document.querySelector('.summary-details');
    const loadingOverlay = document.querySelector('.loading-overlay');

    const showLoading = () => {
        loadingOverlay.style.display = 'block';
    };

    const hideLoading = () => {
        loadingOverlay.style.display = 'none';
    };

    const updateCart = (cart) => {
        cartItems.innerHTML = '';
        cart.books.forEach(book => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <div class="book-info">
                    <img src="/images/magic_world.jpg" alt="Book Cover" class="book-image" />
                    <div class="book-details">
                        <p>${book.title}</p>
                        <p class="authors">${book.authors}</p>
                        <p class="authors">Stan: ${book.state}</p>
                    </div>
                </div>
                <div class="book-price">
                    <p>${book.price} zł</p>
                </div>
                <div class="quantity-control">
                    <button class="decrement quantity-control-button" data-book-id="${book.option_id}">-</button>
                    <input type="number" class="quantity-input" value="${book.quantity}" data-book-id="${book.option_id}" />
                    <button class="increment quantity-control-button" data-book-id="${book.option_id}">+</button>
                </div>
                <div class="total-price">
                    <p>${book.total_price} zł</p>
                </div>
                <button class="delete-button" data-book-id="${book.option_id}"><span class="material-symbols-outlined">close</span></button>
            `;
            cartItems.appendChild(cartItem);
        });

        summaryDetails.innerHTML = `
            <p>Sum: ${cart.sum} zł</p>
            <p>Discount: ${cart.discount} zł</p>
            <p>Total: ${cart.total} zł</p>
        `;
        hideLoading();  
    };

    cartItems.addEventListener('click', async (event) => {
        if (event.target.classList.contains('increment') || event.target.classList.contains('decrement')) {
            const bookId = event.target.dataset.bookId;
            const quantityInput = document.querySelector(`input[data-book-id="${bookId}"]`);
            let newQuantity = parseInt(quantityInput.value);

            if (event.target.classList.contains('increment')) {
                newQuantity += 1;
            } else if (event.target.classList.contains('decrement') && newQuantity > 1) {
                newQuantity -= 1;
            }

            showLoading();

            try {
                const response = await fetch('/cart/update-quantity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookOptionId: bookId, quantity: newQuantity })
                });

                const data = await response.json();
                if (data.success) {
                    updateCart(data.cart);
                } else {
                    alert('Error updating quantity.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error updating quantity.');
            }
        }
    });

    cartItems.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-button') || event.target.closest('.delete-button')) {
            const bookId = event.target.closest('.delete-button').dataset.bookId;

            showLoading();

            try {
                const response = await fetch('/cart/delete-item', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookOptionId: bookId })
                });

                const data = await response.json();
                if (data.success) {
                    updateCart(data.cart);
                } else {
                    alert('Error deleting item.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error deleting item.');
            }
        }
    });
});
