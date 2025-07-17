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

async function loadOrders(dateFilter = '', categoryFilter = '') {
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
        console.log('Fetching orders with filters:', { dateFilter, categoryFilter });
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (dateFilter) {
            // Adjust for Taiwan timezone (UTC+8)
            const date = new Date(dateFilter);
            const start = new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00Z';
            const end = new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T23:59:59Z';
            query = query.gte('created_at', start).lte('created_at', end);
        }

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

                // Filter items by category if specified
                const filteredItems = categoryFilter
                    ? order.items.filter(item => getItemCategory(item.name) === categoryFilter)
                    : order.items;

                if (filteredItems.length === 0) return;

                // Track if this is the first item of the order
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

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="border p-3">${isFirstItem ? order.created_at.split('T')[0] : ''}</td>
                        <td class="border p-3">${item.name}</td>
                        <td class="border p-3">${item.qty}</td>
                        <td class="border p-3">${item.unit || '無單位'}</td>
                        <td class="border p-3">${isFirstItem ? order.customer_name : ''}</td>
                        <td class="border p-3">${submitTime}</td>
                        <td class="border p-3">${remark}</td>
                    `;
                    tableBody.appendChild(row);

                    // Update item totals for statistics table
                    const key = `${item.name}_${item.unit || '無單位'}`;
                    if (!itemTotals[key]) {
                        itemTotals[key] = { name: item.name, unit: item.unit || '無單位', totalQty: 0 };
                    }
                    itemTotals[key].totalQty += item.qty;

                    // Mark as not the first item after the first iteration
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('Summary page loaded, initializing...');
    loadOrders();
    document.getElementById('searchButton').addEventListener('click', () => {
        const dateFilter = document.getElementById('dateFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        console.log('Search button clicked with filters:', { dateFilter, categoryFilter });
        loadOrders(dateFilter, categoryFilter);
    });
});
