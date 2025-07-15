// sis-order-system/summary.js
document.addEventListener('DOMContentLoaded', () => {
    // Placeholder: Sample order data (replace with Supabase fetch later)
    const orderSummary = [
        { date: '2025-07-15', item: '香菜', qty: 1.5, unit: '袋', customer: '張先生' },
        { date: '2025-07-14', item: '麻糬茄子', qty: 0.5, unit: '斤', customer: '李小姐' }
    ];
    const tableBody = document.querySelector('#orderSummary tbody');
    if (tableBody) {
        orderSummary.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.date}</td>
                <td>${order.item}</td>
                <td>${order.qty}</td>
                <td>${order.unit}</td>
                <td>${order.customer}</td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        console.error('Order summary table not found');
    }
});
