// sis-order-system/meat.js
document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const item = button.getAttribute('data-item');
            const qtyInput = document.querySelector(`.qty-input[data-item="${item}"]`);
            const unitSelect = document.querySelector(`.unit-select[data-item="${item}"]`);
            const qty = parseFloat(qtyInput.value) || 0;
            const unit = unitSelect.value || '無單位';
            if (qty >= 0.5) {
                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                cart.push({ name: item, qty, unit });
                localStorage.setItem('cart', JSON.stringify(cart));
                alert(`${item} (${qty} ${unit}) 已加入購物車！`);
            } else {
                alert('數量必須至少0.5');
            }
        });
    });
});
