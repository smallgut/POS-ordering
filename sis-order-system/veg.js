document.addEventListener('DOMContentLoaded', () => {
    // Map subcategories to their select element IDs
    const subcategoryToSelectId = {
        '蔬菜': 'vegetableSelect',
        '水果': 'fruitSelect',
        '菇類': 'mushroomSelect',
        '配料類': 'seasoningSelect',
        '根莖類': 'rootVegetableSelect',
        '瓜類': 'melonSelect'
    };

    // Map items to their subcategories
    const itemLocations = {
        '麻糬茄子': '蔬菜', '茄子': '蔬菜', '芹菜': '蔬菜', '西洋芹': '蔬菜', '洋蔥 (進口)': '蔬菜', '洋蔥(台灣)': '蔬菜', '紫洋蔥': '蔬菜', '荷蘭豆': '蔬菜', '四季豆': '蔬菜', '乾豆菜': '蔬菜', '扁豆': '蔬菜', '敏豆': '蔬菜', '甜豆': '蔬菜', '火豆': '蔬菜', '長江豆': '蔬菜', '紅椒': '蔬菜', '黃椒': '蔬菜', '青椒': '蔬菜', '蕃茄': '蔬菜', '牛蕃茄': '蔬菜', '青江菜': '蔬菜', '蚵白菜': '蔬菜', '青豆仁': '蔬菜', '大陸妹 (生菜)': '蔬菜', '菠菜': '蔬菜', '青花菜 (花椰菜)': '蔬菜', '白花菜': '蔬菜', '青菜': '蔬菜', '水蓮': '蔬菜', '小松菜': '蔬菜', '美生菜': '蔬菜', '芥藍菜': '蔬菜', '地瓜葉': '蔬菜', '羅曼葉': '蔬菜', '空心菜': '蔬菜', '白菜': '蔬菜', '水菜': '蔬菜', '玉米筍': '蔬菜', '竹筍': '蔬菜', '紅菜': '蔬菜', '娃娃菜': '蔬菜', '龍鬚菜': '蔬菜', '高山高麗菜': '蔬菜', '梨山高麗菜': '蔬菜', '高麗菜': '蔬菜', '紫高麗': '蔬菜', '山東白菜': '蔬菜', '小豆苗': '蔬菜', '韭菜': '蔬菜', '蘆筍 (進口)': '蔬菜', '蘆筍 (台灣)': '蔬菜', '埔里晈白筍': '蔬菜', '筊白筍': '蔬菜',
        '檸檬': '水果', '柳丁': '水果', '香蕉': '水果', '蘋果': '水果', '金桔': '水果', '鳳梨': '水果', '木瓜': '水果', '奇異果': '水果', '芭樂': '水果', '葡萄柚': '水果', '巨峰葡萄': '水果',
        '香菇': '菇類', '杏鮑菇': '菇類', '鴻禧菇': '菇類', '秀珍菇': '菇類', '金針菇': '菇類', '白精靈菇': '菇類', '美白菇': '菇類',
        '薑': '配料類', '老薑': '配料類', '嫩薑': '配料類', '薑絲': '配料類', '蒜頭': '配料類', '蒜仁': '配料類', '蒜末': '配料類', '蒜中': '配料類', '蒜泥 (蒜膏)': '配料類', '蒜碎': '配料類', '蒜苗': '配料類', '蒜頭仁': '配料類', '蒜': '配料類', '辣椒': '配料類', '辣椒絲': '配料類', '綠辣椒': '配料類', '小辣椒': '配料類', '大辣椒': '配料類', '香菜 (巴西利)': '配料類', '九層塔': '配料類', '蔥': '配料類', '蔥花': '配料類', '木耳': '配料類', '海茸': '配料類', '打結海帶': '配料類', '豆芽 (銀芽)': '配料類', '苜蓿芽': '配料類', '酸菜': '配料類', '熟白芝麻': '配料類', '紅棗': '配料類', '枸杞': '配料類', '山藥': '配料類', '牛蒡': '配料類', '牛蒡絲': '配料類', '蓮子': '配料類', '山葵 (哇沙米)': '配料類',
        '馬鈴薯': '根莖類', '刈薯': '根莖類', '甜薯': '根莖類', '紅蘿蔔': '根莖類', '白蘿蔔': '根莖類', '山藥': '根莖類', '地瓜': '根莖類', '小條地瓜': '根莖類', '芋頭': '根莖類', '紅地瓜': '根莖類', '馬蹄': '根莖類',
        '小黃瓜': '瓜類', '青苦瓜': '瓜類', '白苦瓜': '瓜類', '山苦瓜': '瓜類', '絲瓜': '瓜類', '大黃瓜': '瓜類', '青木瓜': '瓜類', '菜瓜': '瓜類', '佛手瓜': '瓜類', '絝瓜 (蒲仔)': '瓜類'
    };

    // Get the item from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const item = urlParams.get('item');

    if (item && itemLocations[item]) {
        const subcategory = itemLocations[item];
        const selectElement = document.getElementById(subcategoryToSelectId[subcategory]);
        if (selectElement) {
            selectElement.value = item;
        } else {
            console.error(`Select element for subcategory ${subcategory} not found`);
        }
    }

    // Cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const subcategory = button.getAttribute('data-item');
            const selectElement = document.getElementById(subcategoryToSelectId[subcategory]);
            const item = selectElement ? selectElement.value : '';
            const qtyInput = document.querySelector(`.qty-input[data-item="${subcategory}"]`);
            const unitSelect = document.querySelector(`.unit-select[data-item="${subcategory}"]`);
            const qty = parseFloat(qtyInput.value) || 0;
            const unit = unitSelect.value || '無單位';

            if (!item) {
                alert('請選擇商品！');
                return;
            }
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
