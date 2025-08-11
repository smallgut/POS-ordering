// sis-order-system/seafood.js
document.addEventListener('DOMContentLoaded', () => {
    // Map subcategories to their select element IDs
    const subcategoryToSelectId = {
        '海鮮類': 'seafoodSelect'
    };

    // Map items to their subcategories
    const itemToSubcategory = {
        '蚵仔': '海鮮類',
        '蝦米': '海鮮類',
        '鮭魚片': '海鮮類',
        '小魚干': '海鮮類',
        '小石斑': '海鮮類',
        '軟絲': '海鮮類',
        '蛤仔 (蛤蜊)': '海鮮類',
        '圓鱈': '海鮮類',
        '鯛魚片': '海鮮類'
    };

    // Pre-select the item from query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const item = urlParams.get('item');

    if (item && itemToSubcategory[item]) {
        const subcategory = itemToSubcategory[item];
        const selectId = subcategoryToSelectId[subcategory];
        const selectElement = document.getElementById(selectId);
        if (selectElement) {
            selectElement.value = item;
        }
    }

    // Add to cart logic (updated to use selected item from dropdown)
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const subcategory = button.getAttribute('data-item');
            const selectId = subcategoryToSelectId[subcategory];
            const selectElement = document.getElementById(selectId);
            const item = selectElement ? selectElement.value : '';
            const qtyInput = document.querySelector(`.qty-input[data-item="${subcategory}"]`);
            const unitSelect = document.querySelector(`.unit-select[data-item="${subcategory}"]`);
            const qty = parseFloat(qtyInput.value) || 0;
            const unit = unitSelect.value || '無單位';
            if (item && qty >= 0.5) {
                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                cart.push({ name: item, qty, unit });
                localStorage.setItem('cart', JSON.stringify(cart));
                alert(`${item} (${qty} ${unit}) 已加入購物車！`);
            } else if (!item) {
                alert('請選擇商品！');
            } else {
                alert('數量必須至少0.5');
            }
        });
    });
});