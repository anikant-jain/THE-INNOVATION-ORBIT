/* ===== NEXAVERSE INVOICE MAKER JAVASCRIPT ===== */
/* Modern animations, smooth transitions, and interactive features */
/* Author: Jain Mobile Invoice Maker */
/* License: Free to use */

// ===== GLOBAL VARIABLES =====
let allInvoices = JSON.parse(localStorage.getItem('jmInvoices')) || [];
let isTransitioning = false;

// ===== INITIALIZE APP =====
window.addEventListener('load', () => {
    initializeApp();
});

function initializeApp() {
    console.log('🚀 Initializing Invoice Maker...');
    document.getElementById('invoiceDate').valueAsDate = new Date();
    setupEventListeners();
    calculateAmounts();
    addEnterKeySupport();
    console.log('✅ App initialized successfully');
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    // Invoice details listeners
    document.getElementById('invoiceNo').addEventListener('change', updatePreview);
    document.getElementById('invoiceDate').addEventListener('change', updatePreview);
    document.getElementById('dueDate').addEventListener('change', updatePreview);
    
    // Client details listeners
    document.getElementById('clientName').addEventListener('input', updatePreview);
    document.getElementById('clientEmail').addEventListener('input', updatePreview);
    document.getElementById('clientAddress').addEventListener('input', updatePreview);
    document.getElementById('clientCity').addEventListener('input', updatePreview);
    document.getElementById('clientPhone').addEventListener('input', updatePreview);
    
    console.log('📌 Event listeners attached');
}

// ===== KEYBOARD SHORTCUTS =====
function addEnterKeySupport() {
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            addItem();
            e.preventDefault();
        }
    });
}

document.addEventListener('keydown', (e) => {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveInvoice();
    }
    // Ctrl+P to print
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        printInvoice();
    }
});

// ===== NAVIGATION & ANIMATIONS =====
function showSection(sectionId) {
    if (isTransitioning) return;
    isTransitioning = true;

    const homeSection = document.getElementById('homeSection');
    const targetSection = document.getElementById(sectionId);

    console.log('🔄 Transitioning to:', sectionId);

    // Fade out home section
    homeSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    homeSection.style.opacity = '0';
    homeSection.style.transform = 'translateY(-20px)';

    setTimeout(() => {
        homeSection.classList.remove('active');
        targetSection.classList.add('active');
        
        // Fade in target section
        targetSection.style.opacity = '0';
        targetSection.style.transform = 'translateY(20px)';
        
        // Force reflow
        void targetSection.offsetWidth;
        
        targetSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        targetSection.style.opacity = '1';
        targetSection.style.transform = 'translateY(0)';

        window.scrollTo(0, 0);
        isTransitioning = false;
    }, 500);
}

// ===== BACK TO MENU =====
function backToMenu() {
    if (isTransitioning) return;
    isTransitioning = true;

    const activeSection = document.querySelector('.content-section.active');
    const homeSection = document.getElementById('homeSection');

    if (activeSection) {
        console.log('🔙 Going back to menu');

        // Fade out active section
        activeSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        activeSection.style.opacity = '0';
        activeSection.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            activeSection.classList.remove('active');
            homeSection.classList.add('active');
            
            // Fade in home section
            homeSection.style.opacity = '0';
            homeSection.style.transform = 'translateY(20px)';
            
            // Force reflow
            void homeSection.offsetWidth;
            
            homeSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            homeSection.style.opacity = '1';
            homeSection.style.transform = 'translateY(0)';

            window.scrollTo(0, 0);
            isTransitioning = false;
        }, 500);
    }
}

// Override back button click
document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', backToMenu);
    }
});

// ===== INVOICE ITEM MANAGEMENT =====
function addItem() {
    const tbody = document.getElementById('itemsTableBody');
    const newRow = document.createElement('tr');
    newRow.className = 'item-row';
    newRow.style.animation = 'slideDown 0.3s ease-out';
    
    newRow.innerHTML = `
        <td><input type="text" class="item-description" placeholder="Item description"></td>
        <td><input type="number" class="item-price" placeholder="0.00" value="0" step="0.01" oninput="calculateAmounts()"></td>
        <td><input type="number" class="item-qty" placeholder="1" value="1" min="1" oninput="calculateAmounts()"></td>
        <td><input type="number" class="item-discount" placeholder="0" value="0" min="0" max="100" oninput="calculateAmounts()"></td>
        <td><input type="number" class="item-tax" placeholder="0" value="0" min="0" max="100" oninput="calculateAmounts()"></td>
        <td><input type="text" class="item-amount" value="0.00" readonly></td>
        <td><button type="button" class="btn-remove" onclick="removeItem(this)">Remove</button></td>
    `;
    
    tbody.appendChild(newRow);
    
    // Focus on the first input
    newRow.querySelector('.item-description').focus();
    calculateAmounts();
    
    console.log('➕ New item added');
}

function removeItem(btn) {
    const row = btn.closest('tr');
    row.style.animation = 'slideUp 0.3s ease-out forwards';
    
    setTimeout(() => {
        row.remove();
        calculateAmounts();
        console.log('🗑️ Item removed');
    }, 300);
}

// ===== CALCULATIONS =====
function calculateAmounts() {
    const rows = document.querySelectorAll('.item-row');
    let subtotal = 0, totalDiscount = 0, totalTax = 0;

    rows.forEach(row => {
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const discountPct = parseFloat(row.querySelector('.item-discount').value) || 0;
        const taxPct = parseFloat(row.querySelector('.item-tax').value) || 0;

        const lineTotal = price * qty;
        const discount = (lineTotal * discountPct) / 100;
        const afterDiscount = lineTotal - discount;
        const tax = (afterDiscount * taxPct) / 100;
        const amount = afterDiscount + tax;

        row.querySelector('.item-amount').value = amount.toFixed(2);
        subtotal += lineTotal;
        totalDiscount += discount;
        totalTax += tax;
    });

    const total = subtotal - totalDiscount + totalTax;

    // Animate total change
    animateValue('subtotal', '₹' + subtotal.toFixed(2));
    animateValue('totalDiscount', '₹' + totalDiscount.toFixed(2));
    animateValue('totalTax', '₹' + totalTax.toFixed(2));
    animateValue('invoiceTotal', '₹' + total.toFixed(2));

    updatePreview();
}

function animateValue(elementId, newValue) {
    const element = document.getElementById(elementId);
    element.style.opacity = '0.7';
    element.textContent = newValue;
    
    setTimeout(() => {
        element.style.opacity = '1';
    }, 10);
}

// ===== PREVIEW =====
function updatePreview() {
    const invoiceNo = document.getElementById('invoiceNo').value || 'INV-001';
    const invoiceDate = document.getElementById('invoiceDate').value;
    const dueDate = document.getElementById('dueDate').value;
    const clientName = document.getElementById('clientName').value || 'Client Name';
    const clientEmail = document.getElementById('clientEmail').value || '';
    const clientAddress = document.getElementById('clientAddress').value || '';
    const clientCity = document.getElementById('clientCity').value || '';
    const clientPhone = document.getElementById('clientPhone').value || '';

    let itemsHTML = '';
    const rows = document.querySelectorAll('.item-row');
    
    rows.forEach(row => {
        const desc = row.querySelector('.item-description').value || 'Item';
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const discount = parseFloat(row.querySelector('.item-discount').value) || 0;
        const tax = parseFloat(row.querySelector('.item-tax').value) || 0;
        const amount = row.querySelector('.item-amount').value;

        itemsHTML += `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <td style="padding: 10px;">${desc}</td>
                <td style="padding: 10px; text-align: right;">₹${price.toFixed(2)}</td>
                <td style="padding: 10px; text-align: right;">${qty}</td>
                <td style="padding: 10px; text-align: right;">${discount}%</td>
                <td style="padding: 10px; text-align: right;">${tax}%</td>
                <td style="padding: 10px; text-align: right;"><strong>₹${amount}</strong></td>
            </tr>
        `;
    });

    const preview = `
        <div style="margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid var(--primary);">
            <h4 style="color: var(--primary); margin-bottom: 10px; font-size: 20px;">🏪 Jain Mobile Pachore</h4>
            <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px;">
                Boda Road, Rajgarh | Pachore, MP 465683<br>
                📱 8109758044 | ✉️ jshreyansh36@gmail.com
            </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
                <p style="color: rgba(255, 255, 255, 0.5); font-size: 11px; text-transform: uppercase; margin-bottom: 5px;">Bill To:</p>
                <p style="color: #ffffff; font-weight: 600;">${clientName}</p>
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px;">
                    ${clientAddress}<br>${clientCity}<br>${clientPhone ? '📱 ' + clientPhone : ''}
                </p>
            </div>
            <div style="text-align: right;">
                <p style="color: rgba(255, 255, 255, 0.5); font-size: 11px;">Invoice #</p>
                <p style="color: var(--primary); font-size: 18px; font-weight: 700;">${invoiceNo}</p>
                <p style="color: rgba(255, 255, 255, 0.5); font-size: 11px; margin-top: 8px;">
                    Issue Date: ${invoiceDate}<br>Due Date: ${dueDate}
                </p>
            </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background: rgba(0, 240, 255, 0.1);">
                    <th style="padding: 12px; text-align: left; color: var(--primary); border-bottom: 2px solid var(--primary);">Description</th>
                    <th style="padding: 12px; text-align: right; color: var(--primary); border-bottom: 2px solid var(--primary);">Price</th>
                    <th style="padding: 12px; text-align: right; color: var(--primary); border-bottom: 2px solid var(--primary);">Qty</th>
                    <th style="padding: 12px; text-align: right; color: var(--primary); border-bottom: 2px solid var(--primary);">Discount</th>
                    <th style="padding: 12px; text-align: right; color: var(--primary); border-bottom: 2px solid var(--primary);">Tax</th>
                    <th style="padding: 12px; text-align: right; color: var(--primary); border-bottom: 2px solid var(--primary);">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end; margin: 30px 0;">
            <div style="width: 300px;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--glass-border); color: rgba(255, 255, 255, 0.7);">
                    <span>Subtotal:</span>
                    <span>${document.getElementById('subtotal').textContent}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--glass-border); color: rgba(255, 255, 255, 0.7);">
                    <span>Discount:</span>
                    <span>${document.getElementById('totalDiscount').textContent}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--glass-border); color: rgba(255, 255, 255, 0.7);">
                    <span>Tax:</span>
                    <span>${document.getElementById('totalTax').textContent}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 15px 0; font-size: 16px; font-weight: 700; background: linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    <span>TOTAL:</span>
                    <span>${document.getElementById('invoiceTotal').textContent}</span>
                </div>
            </div>
        </div>

        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--glass-border); color: rgba(255, 255, 255, 0.5); font-size: 11px;">
            <p><strong>Terms:</strong> Payment due within 30 days. Thank you for your business!</p>
        </div>
    `;

    document.getElementById('invoicePreview').innerHTML = preview;
}

// ===== SAVE & EXPORT =====
function saveInvoice() {
    const invoiceNo = document.getElementById('invoiceNo').value;
    
    if (!invoiceNo || invoiceNo === 'INV-') {
        showAlert('❌ Please enter an invoice number', 'error');
        return;
    }

    const rows = document.querySelectorAll('.item-row');
    if (rows.length === 0 || !rows[0].querySelector('.item-description').value) {
        showAlert('❌ Please add at least one item', 'error');
        return;
    }

    const invoice = {
        id: Date.now(),
        invoiceNo: invoiceNo,
        clientName: document.getElementById('clientName').value,
        total: document.getElementById('invoiceTotal').textContent,
        date: new Date().toLocaleDateString()
    };

    allInvoices.push(invoice);
    localStorage.setItem('jmInvoices', JSON.stringify(allInvoices));

    showAlert('✓ Invoice saved successfully!', 'success');
    console.log('💾 Invoice saved:', invoiceNo);
}

function downloadPDF() {
    const invoiceNo = document.getElementById('invoiceNo').value || 'Invoice';
    const element = document.getElementById('invoicePreview');
    
    if (!element.innerHTML.includes('Jain Mobile')) {
        showAlert('⚠️ Please fill in invoice details first', 'warning');
        return;
    }

    const opt = {
        margin: 10,
        filename: `${invoiceNo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
    showAlert('✓ PDF downloaded successfully!', 'success');
    console.log('📥 PDF Downloaded:', invoiceNo);
}

function printInvoice() {
    const element = document.getElementById('invoicePreview');
    
    if (!element.innerHTML.includes('Jain Mobile')) {
        showAlert('⚠️ Please fill in invoice details first', 'warning');
        return;
    }

    window.print();
    console.log('🖨️ Print dialog opened');
}

function clearForm() {
    if (confirm('Are you sure you want to clear the form? This action cannot be undone.')) {
        document.getElementById('invoiceNo').value = 'INV-';
        document.getElementById('invoiceDate').valueAsDate = new Date();
        document.getElementById('dueDate').value = '';
        document.getElementById('clientName').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientAddress').value = '';
        document.getElementById('clientCity').value = '';
        document.getElementById('clientPhone').value = '';

        const tbody = document.getElementById('itemsTableBody');
        tbody.innerHTML = `
            <tr class="item-row">
                <td><input type="text" class="item-description" placeholder="Item description"></td>
                <td><input type="number" class="item-price" placeholder="0.00" value="0" step="0.01" oninput="calculateAmounts()"></td>
                <td><input type="number" class="item-qty" placeholder="1" value="1" min="1" oninput="calculateAmounts()"></td>
                <td><input type="number" class="item-discount" placeholder="0" value="0" min="0" max="100" oninput="calculateAmounts()"></td>
                <td><input type="number" class="item-tax" placeholder="0" value="0" min="0" max="100" oninput="calculateAmounts()"></td>
                <td><input type="text" class="item-amount" value="0.00" readonly></td>
                <td><button type="button" class="btn-remove" onclick="removeItem(this)">Remove</button></td>
            </tr>
        `;

        calculateAmounts();
        showAlert('✓ Form cleared!', 'success');
        console.log('🔄 Form cleared');
    }
}

// ===== ALERT NOTIFICATIONS =====
function showAlert(message, type = 'success') {
    const msg = document.getElementById('successMsg');
    msg.textContent = message;
    
    // Set colors based on type
    const colorMap = {
        'success': {
            bg: 'rgba(0, 240, 255, 0.1)',
            border: 'rgba(0, 240, 255, 0.5)',
            text: 'rgba(0, 240, 255, 0.9)'
        },
        'error': {
            bg: 'rgba(255, 0, 0, 0.1)',
            border: 'rgba(255, 0, 0, 0.5)',
            text: 'rgba(255, 0, 0, 0.9)'
        },
        'warning': {
            bg: 'rgba(255, 165, 0, 0.1)',
            border: 'rgba(255, 165, 0, 0.5)',
            text: 'rgba(255, 165, 0, 0.9)'
        }
    };
    
    const colors = colorMap[type] || colorMap['success'];
    msg.style.background = colors.bg;
    msg.style.borderColor = colors.border;
    msg.style.color = colors.text;
    msg.classList.add('show');
    
    setTimeout(() => msg.classList.remove('show'), 3500);
}

// ===== LOG STARTUP =====
console.log('%c🚀 Jain Mobile Invoice Maker v1.0', 'font-size: 16px; color: #00f0ff; font-weight: bold;');
console.log('%c✨ Modern Nexaverse Design', 'font-size: 12px; color: #ff00d4;');
console.log('%c📝 Ready to create invoices!', 'font-size: 12px; color: #9d4edd;');

// Export functions for global access (if needed)
window.initializeApp = initializeApp;
window.showSection = showSection;
window.backToMenu = backToMenu;
window.addItem = addItem;
window.removeItem = removeItem;
window.calculateAmounts = calculateAmounts;
window.updatePreview = updatePreview;
window.saveInvoice = saveInvoice;
window.downloadPDF = downloadPDF;
window.printInvoice = printInvoice;
window.clearForm = clearForm;
window.showAlert = showAlert;

console.log('✅ All functions exported successfully');
