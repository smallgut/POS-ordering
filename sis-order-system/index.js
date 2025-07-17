// sis-order-system/index.js
document.addEventListener('DOMContentLoaded', () => {
    const cartButton = document.querySelector('.cart-button');
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            if (cart.length === 0) {
                alert('購物車是空的，請先添加商品！');
            } else {
                alert('前往結帳頁面！');
                window.location.href = 'checkout.html';
            }
        });
    } else {
        console.error('Cart button not found');
    }
});
