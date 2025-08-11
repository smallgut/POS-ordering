// sis-order-system/meat.js
document.addEventListener('DOMContentLoaded', () => {
    // Map subcategories to their select element IDs
    const subcategoryToSelectId = {
        '豬牛羊': 'pigCowSheepSelect',
        '雞鴨鵝': 'poultrySelect'
    };

    // Map items to their subcategories
    const itemToSubcategory = {
        '紅燒肉': '豬牛羊',
        '羊肉片': '豬牛羊',
        '鹹牛肉': '豬牛羊',
        '鹹豬肉': '豬牛羊',
        '三層肉': '豬牛羊',
        '豬絞肉': '豬牛羊',
        '培根': '豬牛羊',
        '軟排': '豬牛羊',
        '豬柳': '豬牛羊',
        '茶雞': '雞鴨鵝',
        '雞翅': '雞鴨鵝',
        '雞頭骨': '雞鴨鵝',
        '油雞腿': '雞鴨鵝',
        '雞胸清肉': '雞鴨鵝',
        '雞腿腿肉': '雞鴨鵝',
        '鳳爪 (白)': '雞鴨鵝',
        '烤鴨': '雞鴨鵝',
        '生鴨頭': '雞鴨鵝',
        '煙燻鳳爪': '雞鴨鵝'
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