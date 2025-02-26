from flask import Flask, request, jsonify
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import io

app = Flask(__name__)

# Google Drive API 設置
SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = 'path/to/your/service-account.json'  # 替換為你的服務帳戶密鑰文件路徑

# 加載服務帳戶憑證
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)
drive_service = build('drive', 'v3', credentials=credentials)

# 用於保存結果的 Google Drive 文件夾 ID
DRIVE_FOLDER_ID = 'your-google-drive-folder-id'  # 替換為你的 Google Drive 文件夾 ID

@app.route('/save-result', methods=['POST'])
def save_result():
    # 獲取前端發送的數據
    data = request.json
    mbti = data.get('mbti')
    total_score = data.get('totalScore')

    # 創建文件內容
    file_content = f'MBTI: {mbti}\n總分: {total_score}'
    file_metadata = {
        'name': f'{mbti}_result.txt',
        'parents': [DRIVE_FOLDER_ID],  # 指定保存到哪個文件夾
    }
    media_body = MediaIoBaseUpload(io.BytesIO(file_content.encode('utf-8')),
                                   mimetype='text/plain')

    # 上傳文件到 Google Drive
    try:
        drive_service.files().create(body=file_metadata, media_body=media_body).execute()
        return jsonify({'status': 'success', 'message': '結果已保存到 Google Drive'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
