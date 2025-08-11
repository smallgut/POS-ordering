// sis-order-system/index.js
document.addEventListener('DOMContentLoaded', () => {
    // Cart button logic (unchanged)
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

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const confirmButton = document.getElementById('confirmButton');

    // Mapping of goods to their locations (category > subcategory)
    const itemLocations = {
        // ... keep your full mapping here (蔬果類, 鮮肉類, etc.) ...
        '紅油蔥': ['其他類', '其他'],
        // ...
    };

    confirmButton.addEventListener('click', () => {
        const query = searchInput.value.trim().toLowerCase();
        searchResults.innerHTML = '';

        if (!query) {
            searchResults.textContent = '請輸入商品名稱！';
            searchResults.className = 'text-red-500';
            return;
        }

        const matches = Object.keys(itemLocations).filter(item =>
            item.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            matches.forEach(item => {
                const [category, subcategory] = itemLocations[item];
                const result = document.createElement('div');
                result.textContent = `${item} 位於 ${category} 中的 ${subcategory}`;
                result.className = 'py-1 text-white cursor-pointer hover:bg-gray-700';

                // Make result clickable
                result.addEventListener('click', () => {
                    // Store in localStorage for target page
                    localStorage.setItem('selectedCategory', category);
                    localStorage.setItem('selectedSubcategory', subcategory);
                    localStorage.setItem('selectedItem', item);

                    // Redirect based on category
                    switch (category) {
                        case '蔬果類':
                            window.location.href = 'veg.html';
                            break;
                        case '鮮肉類':
                            window.location.href = 'meat.html';
                            break;
                        case '海鮮類':
                            window.location.href = 'seafood.html';
                            break;
                        case '其他類':
                            window.location.href = 'others.html';
                            break;
                        default:
                            alert('未知的類別');
                    }
                });

                searchResults.appendChild(result);
            });
        } else {
            searchResults.textContent = '未找到相關商品！';
            searchResults.className = 'text-red-500';
        }
    });
});
