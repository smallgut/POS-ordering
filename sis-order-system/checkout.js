// sis-order-system/checkout.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase configuration missing:', { SUPABASE_URL, SUPABASE_ANON_KEY });
    alert('伺服器配置錯誤：環境變數 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY 缺失。請聯繫管理員檢查 Netlify 設置。');
    throw new Error('Missing Supabase configuration');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartBody = document.getElementById('cartBody');
    const emptyCartMessage = document.getElementById('emptyCartMessage');

    if (!cartBody || !emptyCartMessage) {
        console.error('Required elements missing:', { cartBody, emptyCartMessage });
        alert('頁面載入錯誤：缺少必要的表格或訊息元素。');
        return;
    }

    cartBody.innerHTML = '';

    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        return;
    }

    emptyCartMessage.classList.add('hidden');
    cart.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border p-3">${item.name}</td>
            <td class="border p-3" id="qty-${index}">${item.qty}</td>
            <td class="border p-3">${item.unit || '無單位'}</td>
            <td class="border p-3">
                <button data-index="${index}" class="adjust-button text-primary hover:underline">Adjust</button>
                <button data-index="${index}" class="remove-button text-red-600 hover:underline ml-4">Remove</button>
            </td>
        `;
        cartBody.appendChild(row);
    });

    // Attach event listeners to buttons
    document.querySelectorAll('.adjust-button').forEach(button => {
        button.addEventListener('click', () => adjustItem(parseInt(button.dataset.index)));
    });
    document.querySelectorAll('.remove-button').forEach(button => {
        button.addEventListener('click', () => removeItem(parseInt(button.dataset.index)));
    });
}

function adjustItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const row = document.getElementById(`qty-${index}`).parentElement;
    const originalQty = cart[index].qty;
    row.cells[1].innerHTML = `
        <input type="number" id="adjust-qty-${index}" value="${originalQty}" min="0.5" step="0.5" class="w-20 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary">
    `;
    row.cells[3].innerHTML = `
        <button data-index="${index}" class="save-button text-primary hover:underline">Save</button>
        <button data-index="${index}" class="cancel-button text-gray-600 hover:underline ml-4">Cancel</button>
    `;
    document.querySelector(`.save-button[data-index="${index}"]`).addEventListener('click', () => saveAdjustment(index));
    document.querySelector(`.cancel-button[data-index="${index}"]`).addEventListener('click', () => cancelAdjustment(index));
}

function saveAdjustment(index) {
    const qtyInput = document.getElementById(`adjust-qty-${index}`);
    const qty = qtyInput.value ? parseFloat(qtyInput.value) : NaN;
    if (isNaN(qty) || qty < 0.5) {
        alert('請輸入有效的數量 (至少0.5)');
        return;
    }
    if (qty % 1 !== 0 && qty % 1 !== 0.5) {
        alert('數量必須是整數或整數加0.5（如0.5、1、1.5、2）');
        return;
    }
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].qty = qty;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function cancelAdjustment(index) {
    loadCart();
}

function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

async function submitOrder() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const customerName = document.getElementById('customerName').value.trim();
    const customerContact = document.getElementById('customerContact').value.trim();
    const customerRemark = document.getElementById('customerRemark').value.trim() || null;

    if (cart.length === 0) {
        alert('購物車是空的，請先添加商品');
        return;
    }
    if (!customerName || !customerContact) {
        alert('請輸入姓名和聯絡電話');
        return;
    }

    const orderData = {
        customer_name: customerName,
        customer_contact: customerContact,
        remark: customerRemark,
        items: cart,
        quotation: null,
        created_at: new Date().toISOString()
    };

    try {
        console.log('Sending order data:', orderData); // Debug log
        const { error } = await supabase.from('orders').insert([orderData]);
        if (error) throw error;

        alert('訂單已成功提交！');
        localStorage.removeItem('cart');
        document.getElementById('customerName').value = '';
        document.getElementById('customerContact').value = '';
        document.getElementById('customerRemark').value = '';
        loadCart();
    } catch (error) {
        console.error('Submit order error:', {
            message: error.message,
            details: error.details,
            stack: error.stack,
            status: error.status, // May not be available
        });
        if (error.message.includes('Failed to fetch')) {
            alert('提交訂單失敗：網絡錯誤，請檢查連接或聯繫管理員。');
        } else {
            alert('提交訂單時發生錯誤：' + error.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    document.getElementById('submitButton').addEventListener('click', submitOrder);
});
