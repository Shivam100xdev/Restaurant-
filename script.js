// Global Variables
let cart = [];
let currentCurrency = 'USD';
let exchangeRates = {
    USD: 1,
    EUR: 0.91,
    AED: 3.67,
    INR: 83.12
};

let currencySymbols = {
    USD: '$',
    EUR: '€',
    AED: 'د.إ',
    INR: '₹'
};

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeMenuTabs();
    initializeForms();
    initializeModals();
    setMinDate();
    loadCartFromStorage();
    updateCartDisplay();
});

// Navigation Functions
function initializeNavigation() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.98)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        }
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// Menu Tab Functions
function initializeMenuTabs() {
    showMenuCategory('starters');
}

function showMenuCategory(category) {
    // Hide all categories
    document.querySelectorAll('.menu-category').forEach(cat => {
        cat.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected category
    document.getElementById(category).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// Currency Functions
function changeCurrency() {
    currentCurrency = document.getElementById('currency').value;
    updatePrices();
    updateCartDisplay();
    saveCartToStorage();
}

function updatePrices() {
    const priceElements = document.querySelectorAll('.price');
    priceElements.forEach(element => {
        const usdPrice = parseFloat(element.getAttribute('data-usd'));
        const convertedPrice = convertCurrency(usdPrice, currentCurrency);
        element.textContent = formatPrice(convertedPrice, currentCurrency);
    });
}

function convertCurrency(amount, currency) {
    return (amount * exchangeRates[currency]).toFixed(2);
}

function formatPrice(amount, currency) {
    return `${currencySymbols[currency]}${amount}`;
}

// Cart Functions
function addToCart(name, price, category) {
    const convertedPrice = parseFloat(convertCurrency(price, currentCurrency));
    
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: convertedPrice,
            originalPrice: price,
            category: category,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    showAddToCartAnimation(event.target);
}

function showAddToCartAnimation(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Added!';
    button.classList.add('added');
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('added');
    }, 2000);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
    saveCartToStorage();
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    updateCartDisplay();
    saveCartToStorage();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartFooter = document.getElementById('cart-footer');
    const cartTotal = document.getElementById('cart-total');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        cartItems.innerHTML = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartItems.innerHTML += `
                <div class="cart-item">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>${formatPrice(item.price, currentCurrency)} each</p>
                    </div>
                    <div class="item-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="remove-item" onclick="removeFromCart(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        cartTotal.textContent = formatPrice(total.toFixed(2), currentCurrency);
        cartFooter.style.display = 'block';
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.toggle('open');
}

function clearCart() {
    cart = [];
    updateCartDisplay();
    saveCartToStorage();
}

function saveCartToStorage() {
    const cartData = {
        items: cart,
        currency: currentCurrency
    };
    localStorage.setItem('restaurantCart', JSON.stringify(cartData));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('restaurantCart');
    if (savedCart) {
        const cartData = JSON.parse(savedCart);
        cart = cartData.items || [];
        if (cartData.currency) {
            currentCurrency = cartData.currency;
            document.getElementById('currency').value = currentCurrency;
        }
        updatePrices();
    }
}

// Checkout Functions
function showCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const modal = document.getElementById('checkout-modal');
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    let total = 0;
    checkoutItems.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        checkoutItems.innerHTML += `
            <div class="summary-item">
                <div>
                    <strong>${item.name}</strong><br>
                    <small>${formatPrice(item.price, currentCurrency)} × ${item.quantity}</small>
                </div>
                <div>${formatPrice(itemTotal.toFixed(2), currentCurrency)}</div>
            </div>
        `;
    });
    
    checkoutTotal.textContent = formatPrice(total.toFixed(2), currentCurrency);
    showModal(modal);
}

function closeCheckout() {
    hideModal(document.getElementById('checkout-modal'));
}

function placeOrder() {
    const form = document.getElementById('customer-form');
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    if (!paymentMethod) {
        alert('Please select a payment method');
        return;
    }
    
    // Simulate order processing
    const customerName = document.getElementById('customer-name').value;
    const orderNumber = 'ORD' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const orderTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Show success modal
    showOrderSuccess(orderNumber, customerName, orderTotal);
    
    // Clear cart and close checkout
    clearCart();
    closeCheckout();
    toggleCart();
}

function showOrderSuccess(orderNumber, customerName, total) {
    const modal = document.getElementById('success-modal');
    const title = document.getElementById('success-title');
    const message = document.getElementById('success-message');
    const details = document.getElementById('order-details');
    
    title.textContent = 'Order Placed Successfully!';
    message.textContent = `Thank you ${customerName}! Your order is being prepared.`;
    details.innerHTML = `
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Total Amount:</strong> ${formatPrice(total.toFixed(2), currentCurrency)}</p>
        <p><strong>Estimated Delivery:</strong> 30-45 minutes</p>
    `;
    
    showModal(modal);
}

function closeSuccessModal() {
    hideModal(document.getElementById('success-modal'));
}

// Modal Functions
function initializeModals() {
    // Payment method change handler
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const cardDetails = document.getElementById('card-details');
            if (this.value === 'card') {
                cardDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
            }
        });
    });
    
    // Card number formatting
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\s/g, '').replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            this.value = value;
        });
    }
    
    // Expiry date formatting
    const expiryInput = document.getElementById('expiry-date');
    if (expiryInput) {
        expiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }
}

function showModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Form Functions
function initializeForms() {
    // Reservation form
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservation);
    }
    
    // Review form
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmission);
    }
    
    // Refund form
    const refundForm = document.getElementById('refund-form');
    if (refundForm) {
        refundForm.addEventListener('submit', handleRefundRequest);
    }
}

function handleReservation(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('res-name').value,
        email: document.getElementById('res-email').value,
        phone: document.getElementById('res-phone').value,
        guests: document.getElementById('res-guests').value,
        date: document.getElementById('res-date').value,
        time: document.getElementById('res-time').value,
        special: document.getElementById('res-special').value
    };
    
    // Simulate reservation processing
    const confirmationNumber = 'RES' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    alert(`Reservation Confirmed!\n\nConfirmation Number: ${confirmationNumber}\nName: ${formData.name}\nDate: ${formData.date}\nTime: ${formData.time}\nGuests: ${formData.guests}\n\nWe look forward to serving you!`);
    
    // Reset form
    e.target.reset();
}

function handleReviewSubmission(e) {
    e.preventDefault();
    
    const rating = document.querySelector('input[name="rating"]:checked');
    const name = document.getElementById('reviewer-name').value;
    const text = document.getElementById('review-text').value;
    
    if (!rating) {
        alert('Please select a rating');
        return;
    }
    
    // Add review to the reviews container
    addReviewToPage(name, rating.value, text);
    
    // Reset form
    e.target.reset();
    
    alert('Thank you for your review! It has been submitted successfully.');
}

function addReviewToPage(name, rating, text) {
    const reviewsContainer = document.querySelector('.reviews-container');
    const newReview = document.createElement('div');
    newReview.className = 'review-card';
    
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    
    newReview.innerHTML = `
        <div class="review-header">
            <div class="reviewer-info">
                <div class="reviewer-avatar">👤</div>
                <div class="reviewer-details">
                    <h4>${name}</h4>
                    <div class="review-rating">
                        ${stars}
                    </div>
                </div>
            </div>
            <div class="review-date">Just now</div>
        </div>
        <p class="review-text">${text}</p>
    `;
    
    reviewsContainer.insertBefore(newReview, reviewsContainer.firstChild);
}

function handleRefundRequest(e) {
    e.preventDefault();
    
    const orderId = document.getElementById('order-id').value;
    const reason = document.getElementById('refund-reason').value;
    const details = document.getElementById('refund-details').value;
    
    const refundNumber = 'REF' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    alert(`Refund Request Submitted!\n\nRefund Number: ${refundNumber}\nOrder ID: ${orderId}\nReason: ${reason}\n\nWe will process your refund within 24-48 hours.`);
    
    closeRefundForm();
    e.target.reset();
}

// Support Functions
function openChat() {
    const modal = document.getElementById('chat-modal');
    showModal(modal);
}

function closeChat() {
    hideModal(document.getElementById('chat-modal'));
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatMessages = document.getElementById('chat-messages');
    
    // Add user message
    addChatMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Simulate bot response
    setTimeout(() => {
        const botResponse = generateBotResponse(message);
        addChatMessage(botResponse, 'bot');
    }, 1000);
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = sender === 'user' ? '👤' : '🤖';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateBotResponse(userMessage) {
    const responses = {
        'order-issue': 'I understand you have an issue with your order. Can you please provide your order number so I can help you?',
        'refund': 'I can help you with a refund request. Please provide your order details and the reason for the refund.',
        'menu-inquiry': 'I\'d be happy to help you with menu questions! What would you like to know about our dishes?',
        'default': 'Thank you for your message. Our support team will get back to you shortly. Is there anything specific I can help you with right now?'
    };
    
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('order') || lowerMessage.includes('delivery')) {
        return responses['order-issue'];
    } else if (lowerMessage.includes('refund') || lowerMessage.includes('money')) {
        return responses['refund'];
    } else if (lowerMessage.includes('menu') || lowerMessage.includes('food')) {
        return responses['menu-inquiry'];
    } else {
        return responses['default'];
    }
}

function selectQuery(queryType) {
    const input = document.getElementById('chat-input');
    const queries = {
        'order-issue': 'I have an issue with my order',
        'refund': 'I need to request a refund',
        'menu-inquiry': 'I have a question about the menu'
    };
    
    input.value = queries[queryType];
    sendMessage();
}

function openRefundForm() {
    const modal = document.getElementById('refund-modal');
    showModal(modal);
}

function closeRefundForm() {
    hideModal(document.getElementById('refund-modal'));
}

function openOrderTracking() {
    const modal = document.getElementById('tracking-modal');
    showModal(modal);
}

function closeOrderTracking() {
    hideModal(document.getElementById('tracking-modal'));
}

function trackOrder() {
    const orderId = document.getElementById('tracking-id').value.trim();
    const result = document.getElementById('tracking-result');
    
    if (!orderId) {
        alert('Please enter an order ID');
        return;
    }
    
    // Simulate order tracking
    const statuses = [
        { status: 'Order Received', time: '10:30 AM', completed: true },
        { status: 'Preparing', time: '10:45 AM', completed: true },
        { status: 'Ready for Pickup', time: '11:15 AM', completed: true },
        { status: 'Out for Delivery', time: '11:30 AM', completed: true },
        { status: 'Delivered', time: 'Estimated: 12:00 PM', completed: false }
    ];
    
    result.innerHTML = `
        <div class="tracking-info">
            <h4>Order Status for: ${orderId}</h4>
            <div class="status-timeline">
                ${statuses.map(item => `
                    <div class="status-item ${item.completed ? 'completed' : ''}">
                        <div class="status-icon">
                            <i class="fas ${item.completed ? 'fa-check' : 'fa-clock'}"></i>
                        </div>
                        <div class="status-details">
                            <h5>${item.status}</h5>
                            <p>${item.time}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Utility Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function setMinDate() {
    const dateInput = document.getElementById('res-date');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }
}

// Event Listeners for keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => hideModal(modal));
        
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar.classList.contains('open')) {
            toggleCart();
        }
    }
    
    // Enter key in chat input
    if (e.key === 'Enter' && e.target.id === 'chat-input') {
        e.preventDefault();
        sendMessage();
    }
});

// Click outside to close modals
document.addEventListener('click', function(e) {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        if (e.target === modal) {
            hideModal(modal);
        }
    });
    
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar.classList.contains('open') && !cartSidebar.contains(e.target) && !e.target.closest('.cart-btn')) {
        toggleCart();
    }
});

// Animation on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.menu-item, .event-card, .support-card, .review-card');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Initialize animations
window.addEventListener('scroll', animateOnScroll);

// Add initial styles for animation
document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.menu-item, .event-card, .support-card, .review-card');
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Trigger initial animation check
    setTimeout(animateOnScroll, 100);
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
window.addEventListener('scroll', debounce(animateOnScroll, 10));

// Print receipt function
function printReceipt(orderData) {
    const printWindow = window.open('', '_blank');
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Order Receipt</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .receipt { max-width: 400px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; }
                .item { display: flex; justify-content: space-between; margin: 10px 0; }
                .total { border-top: 2px solid #000; padding-top: 10px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h2>Saveur Restaurant</h2>
                    <p>Order Receipt</p>
                </div>
                <!-- Receipt content would be generated here -->
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
}

// Export functions for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleCart,
        showCheckout,
        placeOrder,
        changeCurrency,
        formatPrice
    };
}