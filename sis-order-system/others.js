// sis-order-system/others.js
document.addEventListener('DOMContentLoaded', () => {
    // Map subcategories to their select element IDs
    const subcategoryToSelectId = {
        '熟食': 'cookedFoodSelect',
        '加工食品': 'processedFoodSelect',
        '豆麵類': 'tofuNoodleSelect',
        '其他': 'otherSelect'
    };

    // Map items to their subcategories
    const itemToSubcategory = {
        '肉羹': '熟食',
        '肉鬆': '熟食',
        '素肉鬆': '熟食',
        '滷蛋': '熟食',
        '三色蛋': '熟食',
        '甜不辣': '熟食',
        '米血糕': '熟食',
        '素獅子頭': '熟食',
        '米腸': '熟食',
        '糯米腸': '熟食',
        '士林大香腸': '熟食',
        '蒜味香腸': '熟食',
        '雞米花': '熟食',
        '芋籤': '熟食',
        '洪牌豬血糕': '熟食',
        '白魚丸': '熟食',
        '花枝丸': '熟食',
        '新竹貢丸': '熟食',
        '大貢丸': '熟食',
        '福茂大貢': '加工食品',
        '純瑪琳': '加工食品',
        '玉米粒': '加工食品',
        '大茂黑瓜': '加工食品',
        '番茄鲭魚': '加工食品',
        '鳗魚缶頭': '加工食品',
        '土豆麵筋': '加工食品',
        '辣筍絲': '加工食品',
        '脆筍絲': '加工食品',
        '月亮蝦餅': '加工食品',
        '薯條': '加工食品',
        '山藥卷': '加工食品',
        '春捲皮': '加工食品',
        '泡菜': '加工食品',
        '豆漿': '豆麵類',
        '豆乾': '豆麵類',
        '四角油豆腐': '豆麵類',
        '中華豆腐': '豆麵類',
        '板豆腐': '豆麵類',
        '雞蛋豆腐': '豆麵類',
        '五香豆乾': '豆麵類',
        '豆乾絲': '豆麵類',
        '油豆腐': '豆麵類',
        '豆皮': '豆麵類',
        '白豆乾': '豆麵類',
        '炸豆皮': '豆麵類',
        '豆腐': '豆麵類',
        '芙蓉豆腐': '豆麵類',
        '麵': '豆麵類',
        '涼麵': '豆麵類',
        '油麵': '豆麵類',
        '意麵': '豆麵類',
        '陽春麵': '豆麵類',
        '新竹米粉': '豆麵類',
        '台灣啤酒 330ml': '其他',
        '可口可樂 330ml': '其他',
        '礦泉水': '其他',
        '紅油蔥': '其他',
        '蒜花生': '其他',
        '白大蛋': '其他',
        '皮蛋': '其他',
        '鳥蛋': '其他',
        '碎菜脯': '其他',
        '沙拉': '其他',
        '杏仁粉粿': '其他',
        '仙草': '其他',
        '珍珠圓': '其他',
        '椰子絲': '其他',
        '愛玉': '其他',
        '香椿醬': '其他',
        '黑胡椒醬': '其他',
        '龜甲萬醬油 (商業)': '其他',
        '牛頭牌沙茶醬': '其他',
        '味噌': '其他',
        '台糖白砂糖': '其他',
        '海味味精': '其他',
        '鹽巴': '其他',
        '太白粉': '其他',
        'egg': '其他'  // Alias for compatibility
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
        } else {
            console.error(`Select element for ${selectId} not found`);
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