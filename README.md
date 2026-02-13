# 🔧 Tasbih Backend API

Backend API untuk menangani Pi Network payment flow pada aplikasi Tasbih Digital.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit `.env` dan isi dengan API Key Anda:

```env
PI_API_KEY=your_actual_api_key_here
PORT=3000
```

**Cara Mendapatkan API Key:**
1. Buka https://develop.pi/
2. Login dengan akun Pi Network Anda
3. Create new app atau pilih app yang sudah ada
4. Copy API Key dari dashboard

### 3. Run Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server akan berjalan di: `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /
```

Response:
```json
{
  "status": "ok",
  "message": "Tasbih Backend API Running",
  "timestamp": "2026-02-13T12:00:00.000Z",
  "endpoints": {
    "approve": "POST /api/pi/approve",
    "complete": "POST /api/pi/complete",
    "cancel": "POST /api/pi/cancel",
    "getPayment": "GET /api/pi/payment/:paymentId"
  }
}
```

### Approve Payment
```
POST /api/pi/approve
Content-Type: application/json

{
  "paymentId": "payment_id_from_frontend"
}
```

Response:
```json
{
  "success": true,
  "message": "Payment approved successfully",
  "paymentId": "payment_id",
  "data": { ... }
}
```

### Complete Payment
```
POST /api/pi/complete
Content-Type: application/json

{
  "paymentId": "payment_id_from_frontend",
  "txid": "transaction_id_from_pi"
}
```

Response:
```json
{
  "success": true,
  "message": "Payment completed successfully",
  "paymentId": "payment_id",
  "txid": "transaction_id",
  "data": { ... }
}
```

### Cancel Payment
```
POST /api/pi/cancel
Content-Type: application/json

{
  "paymentId": "payment_id_from_frontend"
}
```

### Get Payment Info
```
GET /api/pi/payment/:paymentId
```

## 🌐 Deploy ke Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

Ikuti prompt:
- Set up and deploy? **Y**
- Which scope? *pilih account Anda*
- Link to existing project? **N**
- Project name? **tasbih-backend**
- In which directory? **./backend** (atau `.` jika di root)

### 4. Set Environment Variable

```bash
vercel env add PI_API_KEY
```

Masukkan API Key Anda saat diminta.

### 5. Deploy Production

```bash
vercel --prod
```

Anda akan dapat URL seperti: `https://tasbih-backend.vercel.app`

## 🔗 Connect Frontend ke Backend

Setelah backend deploy, update frontend `index.html`:

```javascript
// Tambahkan di bagian atas script
const BACKEND_URL = 'https://tasbih-backend.vercel.app'; // Ganti dengan URL Anda

// Update payment callbacks:
onReadyForServerApproval: async function(paymentId) {
    const response = await fetch(`${BACKEND_URL}/api/pi/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId })
    });
    const data = await response.json();
    console.log('Approved:', data);
},

onReadyForServerCompletion: async function(paymentId, txid) {
    const response = await fetch(`${BACKEND_URL}/api/pi/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, txid })
    });
    const data = await response.json();
    if (data.success) {
        showStatus('✅ Donasi berhasil!', 'success');
    }
}
```

## 🧪 Testing

### Test Health Check

```bash
curl http://localhost:3000/
```

### Test Approve (mock)

```bash
curl -X POST http://localhost:3000/api/pi/approve \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "test-payment-123"}'
```

### Test Complete (mock)

```bash
curl -X POST http://localhost:3000/api/pi/complete \
  -H "Content-Type: application/json" \
  -d '{"paymentId": "test-payment-123", "txid": "test-tx-456"}'
```

## 📊 Logs

Backend akan log semua aktivitas:

```
2026-02-13T12:00:00.000Z - POST /api/pi/approve
📝 Approving payment: abc123...
✅ Payment approved: {...}
```

## 🔒 Security Notes

1. **NEVER** commit `.env` file
2. **ALWAYS** use environment variables for sensitive data
3. **Enable** CORS only for your frontend domain in production
4. **Implement** rate limiting for production
5. **Add** authentication if needed

## 🐛 Troubleshooting

### Error: PI_API_KEY not configured
- Pastikan file `.env` ada dan berisi API Key yang valid
- Restart server setelah edit `.env`

### Error: CORS
- Pastikan frontend URL sudah di-allow di CORS config
- Untuk production, ganti `origin: '*'` dengan domain spesifik

### Error: Payment approval failed
- Check API Key valid dan belum expired
- Check payment ID benar
- Check Pi Network API status

## 📞 Support

Untuk pertanyaan atau issue:
1. Check logs di console
2. Test dengan cURL untuk isolate masalah
3. Baca Pi Network API docs: https://developers.minepi.com

## 📝 License

MIT