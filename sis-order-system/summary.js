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
        const isValid = await supabase.rpc('verify_password', {
            provided_password: password,
            stored_hash: data.password_hash
        });
        if (isValid) return true;

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

    const tableBody = document.querySelector('#orderSummary tbody');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    const statsBody = document.querySelector('#itemStats tbody');
    const noStatsMessage = document.getElementById('noStatsMessage');

    if (!tableBody || !noOrdersMessage || !statsBody || !noStatsMessage) {
        console.error('Required elements missing:', { tableBody, noOrdersMessage, statsBody, noStatsMessage });
        alert('頁面載入錯誤：缺少必要的表格或訊息元素。');
        return;
    }

    try {
        console.log('Fetching orders with filters:', { startDate, endDate, categoryFilter });
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

        // Default to last 3 days if no date range selected
        if (!startDate && !endDate) {
            const today = new Date();
            today.setHours(today.getHours() + 8); // Adjust to UTC+8
            const threeDaysAgo = new Date(today);
            threeDaysAgo.setDate(today.getDate() - 3);
            startDate = threeDaysAgo.toISOString().split('T')[0] + 'T00:00:00Z';
            endDate = today.toISOString().split('T')[0] + 'T23:59:59Z';
        } else if (startDate || endDate) {
            startDate = startDate ? new Date(startDate).toISOString().split('T')[0] + 'T00:00:00Z' : '';
            endDate = endDate ? new Date(endDate).toISOString().split('T')[0] + 'T23:59:59Z' : '';
        }

        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);

        const { data: orders, error } = await query;
        if (error) {
            console.error('Supabase query error:', error);
            throw new Error(`Supabase query failed: ${error.message}`);
        }

        console.log('Fetched orders:', orders);

        tableBody.innerHTML = '';
        noOrdersMessage.classList.add('hidden');
        statsBody.innerHTML = '';
        noStatsMessage.classList.add('hidden');

        const itemTotals = {};
        if (orders && orders.length > 0) {
            orders.forEach(order => {
                if (!order.items || !Array.isArray(order.items)) {
                    console.warn('Invalid items format for order:', order);
                    return;
                }

                const filteredItems = categoryFilter
                    ? order.items.filter(item => getItemCategory(item.name) === categoryFilter)
                    : order.items;

                if (filteredItems.length === 0) return;

                let isFirstItem = true;

                filteredItems.forEach(item => {
                    const submitTime = isFirstItem
                        ? new Date(order.created_at).toLocaleTimeString('zh-TW', {
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        : '';
                    const remark = isFirstItem ? (order.remark || '(無)') : '';
                    const quotationValue = isFirstItem ? (order.quotation ? `$${order.quotation.toFixed(2)}` : '') : '';
                    const quotationInput = isFirstItem
                        ? `<input type="text" class="quotation-input border p-1 rounded" value="${quotationValue}" data-order-id="${order.id}" placeholder="$0.00" style="width: 80px;">`
                        : '';
                    const printButton = isFirstItem
                        ? '<button class="print-btn bg-green-500 text-white px-2 py-1 rounded hover:bg-green-700">列印估價單</button>'
                        : '';

                    console.log('Generating row for order:', order.id, 'isFirstItem:', isFirstItem, 'printButton:', printButton);

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="border p-3">${isFirstItem ? order.created_at.split('T')[0] : ''}</td>
                        <td class="border p-3">${item.name}</td>
                        <td class="border p-3">${item.qty}</td>
                        <td class="border p-3">${item.unit || '無單位'}</td>
                        <td class="border p-3">${isFirstItem ? order.customer_name : ''}</td>
                        <td class="border p-3">${submitTime}</td>
                        <td class="border p-3">${remark}</td>
                        <td class="border p-3">${quotationInput}</td>
                        <td class="border p-3">${printButton}</td>
                    `;
                    tableBody.appendChild(row);

                    if (isFirstItem) {
                        const input = row.querySelector('.quotation-input');
                        input.addEventListener('change', async (e) => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            const formattedValue = value ? parseFloat(value).toFixed(2) : null;
                            e.target.value = formattedValue ? `$${formattedValue}` : '';
                            const orderId = e.target.getAttribute('data-order-id');
                            const { error } = await supabase
                                .from('orders')
                                .update({ quotation: formattedValue })
                                .eq('id', orderId);
                            if (error) console.error('Update quotation error:', error);
                        });

                        const printBtn = row.querySelector('.print-btn');
                        console.log('Print button found:', printBtn);
                        printBtn.addEventListener('click', () => printQuotation(order.id)); // Pass order ID
                    }

                    const key = `${item.name}_${item.unit || '無單位'}`;
                    if (!itemTotals[key]) {
                        itemTotals[key] = { name: item.name, unit: item.unit || '無單位', totalQty: 0 };
                    }
                    itemTotals[key].totalQty += item.qty;

                    isFirstItem = false;
                });
            });

            Object.values(itemTotals).forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border p-3">${item.name}</td>
                    <td class="border p-3">${item.unit}</td>
                    <td class="border p-3">${item.totalQty}</td>
                `;
                statsBody.appendChild(row);
            });
        }

        if (!orders || orders.length === 0 || Object.keys(itemTotals).length === 0) {
            noOrdersMessage.classList.remove('hidden');
            noStatsMessage.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Fetch orders error:', error, error.stack);
        alert('載入訂單時發生錯誤：' + error.message);
    }
}

function getItemCategory(itemName) {
    const vegItems = ['麻糬茄子', '大陸妹', '薑', '薑絲', '薑片', '九層塔'];
    const meatItems = ['牛肉', '豬肉', '雞肉', '雞頭骨', '絞肉', '肉絲'];
    const seafoodItems = ['吳郭魚', '虱目魚', '鯧魚', '秋刀魚'];
    const otherItems = ['台灣啤酒', '台灣啤酒 330ml', '可口可樂 330ml', '豆干', '豆漿'];

    if (vegItems.includes(itemName)) return '蔬果類';
    if (meatItems.includes(itemName)) return '鮮肉類';
    if (seafoodItems.includes(itemName)) return '海鮮類';
    if (otherItems.includes(itemName)) return '其他類';
    return '其他類';
}

async function printQuotation(orderId) {
    // Fetch latest order data
    const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
    if (error) {
        alert('載入訂單資料時發生錯誤：' + error.message);
        return;
    }

    // Create narrow print container
    const printContainer = document.createElement('div');
    printContainer.id = 'printContainer';
    printContainer.style.width = '48mm';
    printContainer.style.padding = '2mm';
    printContainer.style.fontFamily = 'monospace';
    printContainer.style.fontSize = '12px';
    printContainer.style.lineHeight = '1.2';
    printContainer.style.boxSizing = 'border-box';
    printContainer.style.whiteSpace = 'pre';
    printContainer.style.wordWrap = 'break-word';

    // Title
    const title = document.createElement('div');
    title.style.textAlign = 'center';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '4px';
    title.textContent = '二姐叫菜 - 估價單';
    printContainer.appendChild(title);

    // Order info
    const infoLines = [
        `日期: ${order.created_at.split('T')[0]}`,
        `時間: ${new Date(order.created_at).toLocaleTimeString('zh-TW',{hour12:false})}`,
        `客戶: ${order.customer_name || '(無)'}`,
        `電話: ${order.customer_contact || '(無)'}`,
        `備註: ${order.remark || '(無)'}`,
        `報價: ${order.quotation ? `$${order.quotation.toFixed(2)}` : '(無)'}`
    ];
    infoLines.forEach(line => {
        const p = document.createElement('div');
        p.textContent = line;
        printContainer.appendChild(p);
    });

    // Separator
    const sep = document.createElement('div');
    sep.style.borderTop = '1px dashed black';
    sep.style.margin = '4px 0';
    printContainer.appendChild(sep);

    // Column headers (centered)
    const headerLine = `品名        數量  單位`;
    const headerDiv = document.createElement('div');
    headerDiv.style.textAlign = 'center';
    headerDiv.textContent = headerLine;
    printContainer.appendChild(headerDiv);

    const headerSep = document.createElement('div');
    headerSep.style.borderTop = '1px solid black';
    headerSep.style.margin = '2px 0';
    printContainer.appendChild(headerSep);

    // Items aligned in columns
    order.items.forEach(item => {
        const name = (item.name || '').padEnd(8, ' ').slice(0, 8); // max 8 chars
        const qty = String(item.qty).padStart(3, ' ');
        const unit = (item.unit || '').padEnd(3, ' ').slice(0, 3);
        const line = `${name}  ${qty}  ${unit}`;

        const itemDiv = document.createElement('div');
        itemDiv.textContent = line;
        printContainer.appendChild(itemDiv);
    });

    // Print style
    const style = document.createElement('style');
    style.textContent = `
        @media print {
            body * { display: none !important; }
            #printContainer { display: block !important; }
            @page { size: 58mm auto; margin: 0; }
        }
    `;
    document.head.appendChild(style);

    // Append and print
    document.body.appendChild(printContainer);
    await new Promise(r => setTimeout(r, 200)); // allow DOM to render
    window.print();

    // Cleanup
    document.head.removeChild(style);
    document.body.removeChild(printContainer);
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
});
