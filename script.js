const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzqW4Ru1mpRyUEaLioTmXMojq2QSw1x5hIelktSv40RvT-4Vm5GpkvoCyQIpQUcvUY/exec'; // GAS 網址
let userId = '未取得 LIFF ID'; // 用於儲存 LIFF 使用者 ID

// DOM 元素
const userNameInput = document.getElementById('userName');
const attendeesCountSelect = document.getElementById('attendeesCount');
const guestSection = document.getElementById('guestSection');
const guestInputsContainer = document.getElementById('guestInputs');
const submitBtn = document.getElementById('submitBtn');
const modifyBtn = document.getElementById('modifyBtn');
const cancelBtn = document.getElementById('cancelBtn');
const statusMessage = document.getElementById('statusMessage');
const showMapBtn = document.getElementById('showMapBtn');

/**
 * 處理 LIFF 初始化、登入並取得使用者資訊
 */
async function initializeLiff() {
    try {
        await liff.init({ liffId: '2008678090-b1Up4o0J' }); // 您的 LIFF ID

        if (!liff.isLoggedIn()) {
            liff.login();
        } else {
            const profile = await liff.getProfile();
            userId = profile.userId;
            userNameInput.value = userId;

            checkRegistrationStatus(userId);
        }
    } catch (err) {
        console.error('LIFF 初始化失敗', err);
        userNameInput.value = 'LIFF 錯誤：請在 LINE 內開啟';
        statusMessage.textContent = '初始化失敗，請確認 LIFF ID 設定是否正確。';
        statusMessage.style.backgroundColor = '#ffe6e6'; 
        statusMessage.style.borderColor = '#ff4d4d';
        statusMessage.style.color = '#ff4d4d';
    }
}

/**
 * 根據報名人數動態生成來賓姓名輸入框
 */
function updateGuestInputs() {
    const totalCount = parseInt(attendeesCountSelect.value, 10);
    const guestCount = totalCount - 1; 
    
    guestInputsContainer.innerHTML = ''; 

    if (guestCount > 0) {
        guestSection.style.display = 'block';
        for (let i = 1; i <= guestCount; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'guest-name-input';
            input.id = `guestName${i}`;
            input.placeholder = `來賓 ${i} 姓名`;
            input.required = true;
            guestInputsContainer.appendChild(input);
        }
    } else {
        guestSection.style.display = 'none';
    }
}

/**
 * 收集報名表單所有資料
 */
function collectFormData(action) {
    const guests = Array.from(document.querySelectorAll('.guest-name-input')).map(input => input.value);
    
    return {
        action: action,
        timestamp: new Date().toLocaleString('zh-TW'),
        userId: userId,
        eventSubject: document.getElementById('eventSubject').value,
        eventTime: document.getElementById('eventTime').value,
        eventLocation: document.getElementById('eventLocation').value,
        attendeesCount: attendeesCountSelect.value,
        guestNames: guests.join(', ')
    };
}

/**
 * 發送資料到 Google Apps Script (GAS)
 * @param {string} action - 'submit', 'modify', 或 'cancel'
 */
async function sendDataToGas(action) {
    statusMessage.textContent = '正在處理中，請稍候...';
    
    const formData = collectFormData(action);

    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // 保持 no-cors
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData).toString() 
        });

        // 由於 no-cors 模式限制，我們假設網路請求成功即為 GAS 接收到資料
        if (action === 'submit') {
            statusMessage.textContent = '✅ 報名已提交！(資料正在寫入 Google Sheet)';
            submitBtn.style.display = 'none';
            modifyBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
        } else if (action === 'modify') {
            statusMessage.textContent = '✅ 報名資料已送出修改請求！';
        } else if (action === 'cancel') {
            statusMessage.textContent = '❌ 報名已送出取消請求！';
            submitBtn.style.display = 'inline-block';
            modifyBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
        }

    } catch (error) {
        console.error('發送資料到 GAS 失敗:', error);
        statusMessage.textContent = '💥 網路或伺服器錯誤，報名失敗。請稍後再試。';
    }
}

/**
 * 檢查報名狀態
 * (優化提示文字)
 */
function checkRegistrationStatus(currentUserId) {
    // 目前先預設顯示 '確認報名'
    submitBtn.style.display = 'inline-block';
    modifyBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    
    // 給予更個人化的提示
    statusMessage.textContent = `歡迎回來！您的 ID ( ${currentUserId.substring(0, 8)}... ) 已載入。請確認或提交報名資訊。`;
}

/**
 * 處理「顯示地圖」按鈕點擊事件 (修正 URL 編碼錯誤)
 */
function handleShowMap() {
    const locationName = document.getElementById('eventLocation').value;
    // *** 修正的地圖 URL 結構 ***
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;

    if (liff.isInClient()) {
        liff.openWindow({
            url: mapUrl,
            external: true
        });
    } else {
        window.open(mapUrl, '_blank');
    }
}

// =======================
// 事件監聽
// =======================

attendeesCountSelect.addEventListener('change', updateGuestInputs);
submitBtn.addEventListener('click', () => sendDataToGas('submit'));
modifyBtn.addEventListener('click', () => sendDataToGas('modify'));
cancelBtn.addEventListener('click', () => sendDataToGas('cancel'));
showMapBtn.addEventListener('click', handleShowMap);

// 頁面載入時執行 LIFF 初始化
window.onload = () => {
    if (typeof liff !== 'undefined') {
        initializeLiff();
    } else {
        statusMessage.textContent = 'LIFF SDK 載入失敗，請檢查網路或腳本。';
    }
    updateGuestInputs(); 
};
