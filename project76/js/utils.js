function calculateAge(birthday) {
    const birth = new Date(birthday);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    
    if (months < 0) {
        years--;
        months += 12;
    }
    
    if (years === 0) {
        return `${months}个月`;
    } else if (months === 0) {
        return `${years}岁`;
    } else {
        return `${years}岁${months}个月`;
    }
}

function calculateMonths(birthday, date) {
    const birth = new Date(birthday);
    const target = date ? new Date(date) : new Date();
    const years = target.getFullYear() - birth.getFullYear();
    const months = target.getMonth() - birth.getMonth();
    return years * 12 + months;
}

function calculateAgeAtDate(birthday, date) {
    const birth = new Date(birthday);
    const target = new Date(date);
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    
    if (months < 0) {
        years--;
        months += 12;
    }
    
    if (years === 0) {
        return `${months}个月`;
    } else {
        return `${years}岁${months}个月`;
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateCN(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

function getMonthYear(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}年${month}月`;
}

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function showModal(content) {
    const container = document.getElementById('modalContainer');
    container.innerHTML = content;
    container.classList.add('active');
    
    container.addEventListener('click', (e) => {
        if (e.target === container) {
            closeModal();
        }
    });
}

function closeModal() {
    const container = document.getElementById('modalContainer');
    container.classList.remove('active');
    container.innerHTML = '';
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

function interpolateWHO(months, gender, type) {
    const standard = whoStandards[gender][type];
    if (months <= standard.months[0]) {
        return {
            p3: standard.p3[0],
            p50: standard.p50[0],
            p97: standard.p97[0]
        };
    }
    if (months >= standard.months[standard.months.length - 1]) {
        return {
            p3: standard.p3[standard.p3.length - 1],
            p50: standard.p50[standard.p50.length - 1],
            p97: standard.p97[standard.p97.length - 1]
        };
    }
    
    for (let i = 0; i < standard.months.length - 1; i++) {
        if (months >= standard.months[i] && months <= standard.months[i + 1]) {
            const ratio = (months - standard.months[i]) / (standard.months[i + 1] - standard.months[i]);
            return {
                p3: standard.p3[i] + (standard.p3[i + 1] - standard.p3[i]) * ratio,
                p50: standard.p50[i] + (standard.p50[i + 1] - standard.p50[i]) * ratio,
                p97: standard.p97[i] + (standard.p97[i + 1] - standard.p97[i]) * ratio
            };
        }
    }
    return { p3: 0, p50: 0, p97: 0 };
}

function getGrowthPercentile(value, months, gender, type) {
    const standard = interpolateWHO(months, gender, type);
    if (value < standard.p3) return '< P3';
    if (value < standard.p50) return 'P3-P50';
    if (value < standard.p97) return 'P50-P97';
    return '> P97';
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star ${i <= rating ? 'filled' : ''}">★</span>`;
    }
    return stars;
}

function getImageUrl(prompt, size = 'square') {
    const encoded = encodeURIComponent(prompt);
    return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encoded}&image_size=${size}`;
}

function exportToCSV(data, filename) {
    const csvContent = "data:text/csv;charset=utf-8," 
        + data.map(row => row.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
