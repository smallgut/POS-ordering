// checkout.js
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartBody = document.getElementById('cartBody');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
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
                <button onclick="adjustItem(${index})" class="text-primary hover:underline">Adjust</button>
                <button onclick="removeItem(${index})" class="text-red-600 hover:underline ml-4">Remove</button>
            </td>
        `;
        cartBody.appendChild(row);
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
        <button onclick="saveAdjustment(${index})" class="text-primary hover:underline">Save</button>
        <button onclick="cancelAdjustment(${index})" class="text-gray-600 hover:underline ml-4">Cancel</button>
    `;
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
        items: { items: cart },
        category: '蔬果類',
        submit_time: new Date().toISOString()
    };

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error('提交訂單失敗');
        }

        alert('訂單已成功提交！');
        localStorage.removeItem('cart');
        document.getElementById('customerName').value = '';
        document.getElementById('customerContact').value = '';
        document.getElementById('customerRemark').value = '';
        loadCart();
    } catch (error) {
        alert('提交訂單時發生錯誤：' + error.message);
    }
}

window.onload = loadCart;
