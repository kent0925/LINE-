# sheet_handler.py
import gspread
from datetime import datetime
import pytz

# --- 設定 ---
SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'
# ... 其他設定與初始化 WORKSHEET_INFO, WORKSHEET_REG ...

def setup_sheets():
    # ... 初始化 gspread 連線邏輯 (參見先前回答)
    pass

def get_activity_info():
    """從 ActivityInfo 讀取活動資訊"""
    # ... 讀取邏輯
    pass

def write_registration_to_sheet(user_id, user_name, num_participants, guest_name):
    """將報名資料寫入 Registrations"""
    # ... 寫入邏輯
    pass
    
def cancel_registration(user_id):
    """將 Registrations 中 Active 狀態改為 Cancelled"""
    # ... 取消邏輯
    pass
