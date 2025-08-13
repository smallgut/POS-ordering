// sis-order-system/summary.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase configuration missing:', { SUPABASE_URL, SUPABASE_ANON_KEY });
    alert('伺服器配置錯誤：環境變數 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY 缺失。');
    throw new Error('Missing Supabase configuration');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUsername = ''; // Store the current username after login

async function checkLogin() {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        const username = prompt('請輸入用戶名:');
        if (username === null) return false; // User canceled
        const password = prompt('請輸入密碼:');
        if (password === null) return false; // User canceled

        const { data, error } = await supabase
            .from('authorized_users')
            .select('username, password_hash')
            .eq('username', username)
            .single();

        if (error || !data) {
            attempts++;
            alert(`用戶信息錯誤，剩餘嘗試次數: ${maxAttempts - attempts}`);
            if (attempts === maxAttempts) {
                alert('嘗試次數超過限制，返回首頁。');
                window.location.href = 'index.html';
                return false;
            }
            continue;
        }

        // Verify password using crypt
        const { data: isValid, error: verifyError } = await supabase.rpc('verify_password', {
            provided_password: password,
            stored_hash: data.password_hash
        });
        if (verifyError) {
            console.error('Password verification error:', verifyError);
            alert('密碼驗證失敗：' + verifyError.message);
            attempts++;
            if (attempts === maxAttempts) {
                alert('嘗試次數超過限制，返回首頁。');
                window.location.href = 'index.html';
                return false;
            }
            continue;
        }
        if (isValid) {
            currentUsername = username; // Store the current username
            return true;
        }

        attempts++;
        alert(`用戶信息錯誤，剩餘嘗試次數: ${maxAttempts - attempts}`);
        if (attempts === maxAttempts) {
            alert('嘗試次數超過限制，返回首頁。');
            window.location.href = 'index.html';
            return false;
        }
    }
    return false;
}

async function loadOrders(startDate = '', endDate = '', categoryFilter = '') {
    if (!(await checkLogin())) return;

    const tableBody = document.querySelector('#ordersTableBody');
    const noDataMessage = document.querySelector('#noDataMessage');
    const statsTableBody = document.querySelector('#statisticsTableBody');
    const noStatsMessage = document.querySelector('#noStatsMessage');

    if (!tableBody || !noDataMessage || !statsTableBody || !noStatsMessage) {
        console.error('Required elements missing');
        alert('頁面載入錯誤：缺少必要的表格或訊息元素。');
        return;
    }

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (startDate) query = query.gte('created_at', `${startDate}T00:00:00Z`);
    if (endDate) query = query.lte('created_at', `${endDate}T23:59:59Z`);

    const { data: orders, error } = await query;

    if (error) {
        console.error('Load orders error:', error);
        alert('載入訂單時發生錯誤：' + error.message);
        return;
    }

    tableBody.innerHTML = '';
    statsTableBody.innerHTML = '';

    if (orders.length === 0) {
        noDataMessage.classList.remove('hidden');
        noStatsMessage.classList.remove('hidden');
        return;
    }

    noDataMessage.classList.add('hidden');
    noStatsMessage.classList.add('hidden');

    // Category mapping for filtering
    const categoryMap = {
        '蔬果類': ['麻糬茄子', '茄子', '芹菜', '西洋芹', '洋蔥 (進口)', '洋蔥(台灣)', '紫洋蔥', '荷蘭豆', '四季豆', '乾豆菜', '扁豆', '敏豆', '甜豆', '火豆', '長江豆', '紅椒', '黃椒', '青椒', '蕃茄', '牛蕃茄', '青江菜', '蚵白菜', '青豆仁', '大陸妹 (生菜)', '菠菜', '青花菜 (花椰菜)', '白花菜', '青菜', '水蓮', '小松菜', '美生菜', '芥藍菜', '地瓜葉', '羅曼葉', '空心菜', '白菜', '水菜', '玉米筍', '竹筍', '紅菜', '娃娃菜', '龍鬚菜', '高山高麗菜', '梨山高麗菜', '高麗菜', '紫高麗', '山東白菜', '小豆苗', '韭菜', '蘆筍 (進口)', '蘆筍 (台灣)', '埔里晈白筍', '筊白筍', '檸檬', '柳丁', '香蕉', '蘋果', '金桔', '鳳梨', '木瓜', '奇異果', '芭樂', '葡萄柚', '巨峰葡萄', '香菇', '杏鮑菇', '鴻禧菇', '秀珍菇', '金針菇', '白精靈菇', '美白菇', '薑', '老薑', '嫩薑', '薑絲', '蒜頭', '蒜仁', '蒜末', '蒜中', '蒜泥 (蒜膏)', '蒜碎', '蒜苗', '蒜頭仁', '蒜', '辣椒', '辣椒絲', '綠辣椒', '小辣椒', '大辣椒', '香菜 (巴西利)', '九層塔', '蔥', '蔥花', '木耳', '海茸', '打結海帶', '豆芽 (銀芽)', '苜蓿芽', '酸菜', '熟白芝麻', '紅棗', '枸杞', '山藥', '牛蒡', '牛蒡絲', '蓮子', '山葵 (哇沙米)', '馬鈴薯', '刈薯', '甜薯', '紅蘿蔔', '白蘿蔔', '地瓜', '小條地瓜', '芋頭', '紅地瓜', '馬蹄', '小黃瓜', '青苦瓜', '白苦瓜', '山苦瓜', '絲瓜', '大黃瓜', '青木瓜', '菜瓜', '佛手瓜', '絝瓜 (蒲仔)'],
        '鮮肉類': ['豬絞肉', '梅花豬', '里肌', '五花肉', '火鍋肉片', '牛絞肉', '牛腱', '牛腩', '牛筋', '牛小排', '羊肉', '雞腿', '雞胸', '雞翅', '雞爪'],
        '海鮮類': ['白蝦', '草蝦', '明蝦', '泰國蝦', '大頭蝦', '鮮魚', '鱈魚', '鮭魚', '鯖魚', '虱目魚', '吳郭魚', '鱸魚', '鯛魚', '沙丁魚', '秋刀魚', '文蛤', '蛤蜊', '淡菜', '鮮蚵', '干貝', '花枝', '透抽', '軟絲', '魷魚'],
        '其他類': ['肉羹', '肉鬆', '素肉鬆', '滷蛋', '三色蛋', '甜不辣', '米血糕', '素獅子頭', '米腸', '糯米腸', '士林大香腸', '蒜味香腸', '雞米花', '芋籤', '洪牌豬血糕', '白魚丸', '花枝丸', '新竹貢丸', '大貢丸', '福茂大貢', '純瑪琳', '玉米粒', '大茂黑瓜', '番茄鲭魚', '鳗魚缶頭', '土豆麵筋', '辣筍絲', '脆筍絲', '月亮蝦餅', '薯條', '山藥卷', '春捲皮', '泡菜', '豆漿', '豆乾', '四角油豆腐', '中華豆腐', '板豆腐', '雞蛋豆腐', '五香豆乾', '豆乾絲', '油豆腐', '豆皮', '白豆乾', '炸豆皮', '豆腐', '芙蓉豆腐', '麵', '涼麵', '油麵', '意麵', '陽春麵', '新竹米粉', '台灣啤酒 330ml', '可口可樂 330ml', '礦泉水', '紅油蔥', '蒜花生', '白大蛋', '皮蛋', '鳥蛋', '碎菜脯', '沙拉', '杏仁粉粿', '仙草', '珍珠圓', '椰子絲', '愛玉', '香椿醬', '黑胡椒醬', '龜甲萬醬油 (商業)', '牛頭牌沙茶醬', '味噌', '台糖白砂糖', '海味味精', '鹽巴', '太白粉', 'egg']
    };

    // Filter orders by category if specified
    let filteredOrders = orders;
    if (categoryFilter) {
        filteredOrders = orders.filter(order =>
            order.items.some(item => categoryMap[categoryFilter]?.includes(item.name))
        );
    }

    // Display orders
    filteredOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border p-3">${order.created_at.split('T')[0]}</td>
            <td class="border p-3">${order.items.map(item => item.name).join('<br>')}</td>
            <td class="border p-3">${order.items.map(item => item.qty).join('<br>')}</td>
            <td class="border p-3">${order.items.map(item => item.unit || '無單位').join('<br>')}</td>
            <td class="border p-3">${order.customer_name || '(無)'}</td>
            <td class="border p-3">${new Date(order.created_at).toLocaleTimeString('zh-TW', { hour12: false })}</td>
            <td class="border p-3">${order.remark || '(無)'}</td>
            <td class="border p-3">${order.quotation ? `$${order.quotation.toFixed(2)}` : '(無)'}</td>
            <td class="border p-3">
                <button data-id="${order.id}" class="quote-button text-primary hover:underline">報價</button>
                <button data-id="${order.id}" class="print-button text-green-600 hover:underline ml-4">列印</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Calculate statistics
    const stats = {};
    filteredOrders.forEach(order => {
        order.items.forEach(item => {
            const key = `${item.name}|${item.unit || '無單位'}`;
            if (!stats[key]) {
                stats[key] = { name: item.name, unit: item.unit || '無單位', totalQty: 0 };
            }
            stats[key].totalQty += parseFloat(item.qty) || 0;
        });
    });

    Object.values(stats).forEach(stat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border p-3">${stat.name}</td>
            <td class="border p-3">${stat.unit}</td>
            <td class="border p-3">${stat.totalQty.toFixed(2)}</td>
        `;
        statsTableBody.appendChild(row);
    });

    // Attach event listeners for quote and print buttons
    document.querySelectorAll('.quote-button').forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.getAttribute('data-id');
            const quotation = prompt('輸入報價:');
            if (quotation && !isNaN(quotation) && parseFloat(quotation) >= 0) {
                const { error } = await supabase
                    .from('orders')
                    .update({ quotation: parseFloat(quotation) })
                    .eq('id', id);
                if (error) {
                    console.error('Update quotation error:', error);
                    alert('更新報價失敗：' + error.message);
                } else {
                    alert('報價已更新');
                    loadOrders(startDate, endDate, categoryFilter);
                }
            } else {
                alert('請輸入有效的報價數值');
            }
        });
    });

    document.querySelectorAll('.print-button').forEach(button => {
        button.addEventListener('click', async () => {
            const id = button.getAttribute('data-id');
            const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single();
            if (error) {
                console.error('Fetch order for print error:', error);
                alert('載入訂單失敗：' + error.message);
                return;
            }
            if (order) printOrder(order);
        });
    });
}

function printOrder(order) {
    const printWindow = window.open('', '_blank');
    const content = `
        <!DOCTYPE html>
        <html lang="zh-Hant">
        <head>
            <meta charset="UTF-8">
            <title>二姐叫菜 - 估價單</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .center { text-align: center; }
                .bold { font-weight: bold; }
                .line { border-top: 1px solid black; margin: 10px 0; }
                .item-line { display: flex; justify-content: space-between; margin: 5px 0; }
                .left { width: 50%; }
                .mid { width: 25%; text-align: center; }
                .right { width: 25%; text-align: right; }
            </style>
        </head>
        <body>
            <div class="center bold">二姐叫菜 - 估價單</div>
            <div>日期: ${order.created_at.split('T')[0]}</div>
            <div>時間: ${new Date(order.created_at).toLocaleTimeString('zh-TW', { hour12: false })}</div>
            <div>客戶: ${order.customer_name || '(無)'}</div>
            <div>電話: ${order.customer_contact || '(無)'}</div>
            <div>備註: ${order.remark || '(無)'}</div>
            <div>報價: ${order.quotation ? `$${order.quotation.toFixed(2)}` : '(無)'}</div>
            <div class="line"></div>
            <div class="item-line bold">
                <div class="left">商品</div>
                <div class="mid">數量</div>
                <div class="right">單位</div>
            </div>
            <div class="line"></div>
            ${order.items.map(item => `
                <div class="item-line">
                    <div class="left">${item.name || ''}</div>
                    <div class="mid">${item.qty}</div>
                    <div class="right">${item.unit || '無單位'}</div>
                </div>
            `).join('')}
            <div class="line"></div>
            <div class="center">感謝您的惠顧</div>
        </body>
        </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

async function updateCredentials() {
    const newUsername = prompt('輸入新用戶名:');
    if (newUsername === null) return; // User canceled
    if (!newUsername.trim()) {
        alert('新用戶名不能為空');
        return;
    }

    const newPassword = prompt('輸入新密碼:');
    if (newPassword === null) return; // User canceled
    if (!newPassword.trim()) {
        alert('新密碼不能為空');
        return;
    }

    try {
        // Hash the new password
        const { data: hashData, error: hashError } = await supabase.rpc('hash_password', { password: newPassword });
        if (hashError) throw hashError;

        const newHash = hashData; // Assuming RPC returns the hash directly

        // Update the user row in Supabase
        const { error: updateError } = await supabase
            .from('authorized_users')
            .update({ username: newUsername.trim(), password_hash: newHash })
            .eq('username', currentUsername);

        if (updateError) throw updateError;

        alert('用戶名和密碼已成功更新！請重新登入。');
        currentUsername = newUsername.trim(); // Update stored username
        window.location.href = 'summary.html'; // Force re-login
    } catch (error) {
        console.error('Update credentials error:', error);
        alert('更新失敗：' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Summary page loaded, initializing...');
    loadOrders();
    document.getElementById('searchButton').addEventListener('click', () => {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        console.log('Search button clicked with filters:', { startDate, endDate, categoryFilter });
        loadOrders(startDate, endDate, categoryFilter);
    });
    document.getElementById('updateCredentials').addEventListener('click', updateCredentials);
});
