// DOM
const userNameInput = document.getElementById('userName');
const attendeesCountSelect = document.getElementById('attendeesCount');
const guestInputsContainer = document.getElementById('guestInputs');
const submitBtn = document.getElementById('submitBtn');
const modifyBtn = document.getElementById('modifyBtn');
const cancelBtn = document.getElementById('cancelBtn');
const checkStatsBtn = document.getElementById('checkStatsBtn');
const statusMessage = document.getElementById('statusMessage');

let userId = '未取得 LIFF ID';
let currentEventId = 'EVENT_ID'; // 當前活動 EventID
const GAS_WEB_APP_URL = 'YOUR_GAS_WEB_APP_URL';
const LIFF_ID = 'YOUR_LIFF_ID';

// 生成來賓姓名輸入框
function updateGuestInputs() {
    const totalCount = parseInt(attendeesCountSelect.value, 10);
    const guestCount = totalCount-1;
    guestInputsContainer.innerHTML = '';
    for(let i=1;i<=guestCount;i++){
        const input = document.createElement('input');
        input.type='text';
        input.placeholder=`來賓 ${i} 姓名`;
        input.className='guest-name-input';
        guestInputsContainer.appendChild(input);
    }
}

// 收集表單資料
function collectFormData(action){
    const guests = Array.from(document.querySelectorAll('.guest-name-input')).map(i=>i.value);
    return {
        action: action,
        lineUserId: userId,
        lineName: userNameInput.value,
        eventId: currentEventId,
        count: attendeesCountSelect.value,
        guests: guests.join(', ')
    };
}

// 發送報名/修改/取消
async function sendData(action){
    const formData = collectFormData(action);
    try{
        const res = await fetch(GAS_WEB_APP_URL,{
            method:'POST',
            body: JSON.stringify(formData)
        });
        const result = await res.json();
        if(result.status==='success'){
            statusMessage.textContent = action==='cancel'?'已取消報名':'操作成功';
        }else{
            statusMessage.textContent = '失敗:'+result.message;
        }
    }catch(err){
        statusMessage.textContent = '網路錯誤';
        console.error(err);
    }
}

// 查詢報名統計
async function checkStats(){
    try{
        const res = await fetch(`${GAS_WEB_APP_URL}?action=getStats&eventId=${currentEventId}`);
        const data = await res.json();
        statusMessage.textContent = `目前總人數: ${data.totalCount}\n報名人員: ${data.attendeeNames.join(', ')}`;
    }catch(err){
        console.error(err);
        statusMessage.textContent = '查詢失敗';
    }
}

// LIFF 初始化
async function initializeLiff(){
    await liff.init({liffId: LIFF_ID});
    if(!liff.isLoggedIn()) liff.login();
    else {
        const profile = await liff.getProfile();
        userId = profile.userId;
        userNameInput.value = profile.displayName;
    }
}

// 事件綁定
attendeesCountSelect.addEventListener('change', updateGuestInputs);
submitBtn.addEventListener('click',()=>sendData('signup'));
modifyBtn.addEventListener('click',()=>sendData('update'));
cancelBtn.addEventListener('click',()=>sendData('cancel'));
checkStatsBtn.addEventListener('click', checkStats);

window.onload = ()=>{
    initializeLiff();
    updateGuestInputs();
};
