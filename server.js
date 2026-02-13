const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // Untuk development, ubah ke domain spesifik di production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Pi Network API Config
const PI_API_URL = 'https://api.minepi.com';
const API_KEY = process.env.PI_API_KEY;

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Tasbih Backend API Running',
    timestamp: new Date().toISOString(),
    endpoints: {
      approve: 'POST /api/pi/approve',
      complete: 'POST /api/pi/complete',
      cancel: 'POST /api/pi/cancel',
      getPayment: 'GET /api/pi/payment/:paymentId'
    }
  });
});

// Approve Payment
app.post('/api/pi/approve', async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({ 
        success: false,
        error: 'Payment ID required' 
      });
    }

    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'PI_API_KEY not configured'
      });
    }

    console.log('📝 Approving payment:', paymentId);

    // Call Pi Network API to approve
    const response = await axios.post(
      `${PI_API_URL}/v2/payments/${paymentId}/approve`,
      {},
      {
        headers: {
          'Authorization': `Key ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Payment approved:', response.data);

    res.json({ 
      success: true, 
      message: 'Payment approved successfully',
      paymentId: paymentId,
      data: response.data 
    });

  } catch (error) {
    console.error('❌ Approve error:', error.response?.data || error.message);
    
    res.status(error.response?.status || 500).json({ 
      success: false,
      error: 'Failed to approve payment',
      details: error.response?.data || error.message,
      paymentId: req.body.paymentId
    });
  }
});

// Complete Payment
app.post('/api/pi/complete', async (req, res) => {
  try {
    const { paymentId, txid } = req.body;
    
    if (!paymentId || !txid) {
      return res.status(400).json({ 
        success: false,
        error: 'Payment ID and txid required' 
      });
    }

    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'PI_API_KEY not configured'
      });
    }

    console.log('📝 Completing payment:', paymentId, txid);

    // Call Pi Network API to complete
    const response = await axios.post(
      `${PI_API_URL}/v2/payments/${paymentId}/complete`,
      { txid },
      {
        headers: {
          'Authorization': `Key ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Payment completed:', response.data);

    // TODO: Simpan ke database (opsional)
    // await savePaymentToDatabase(paymentId, txid, response.data);

    res.json({ 
      success: true, 
      message: 'Payment completed successfully',
      paymentId: paymentId,
      txid: txid,
      data: response.data 
    });

  } catch (error) {
    console.error('❌ Complete error:', error.response?.data || error.message);
    
    res.status(error.response?.status || 500).json({ 
      success: false,
      error: 'Failed to complete payment',
      details: error.response?.data || error.message,
      paymentId: req.body.paymentId
    });
  }
});

// Cancel Payment (opsional)
app.post('/api/pi/cancel', async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({ 
        success: false,
        error: 'Payment ID required' 
      });
    }

    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'PI_API_KEY not configured'
      });
    }

    console.log('📝 Cancelling payment:', paymentId);

    const response = await axios.post(
      `${PI_API_URL}/v2/payments/${paymentId}/cancel`,
      {},
      {
        headers: {
          'Authorization': `Key ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Payment cancelled:', response.data);

    res.json({ 
      success: true, 
      message: 'Payment cancelled successfully',
      paymentId: paymentId,
      data: response.data 
    });

  } catch (error) {
    console.error('❌ Cancel error:', error.response?.data || error.message);
    
    res.status(error.response?.status || 500).json({ 
      success: false,
      error: 'Failed to cancel payment',
      details: error.response?.data || error.message,
      paymentId: req.body.paymentId
    });
  }
});

// Get Payment Info (opsional, untuk debugging)
app.get('/api/pi/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'PI_API_KEY not configured'
      });
    }

    console.log('📝 Getting payment info:', paymentId);

    const response = await axios.get(
      `${PI_API_URL}/v2/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Key ${API_KEY}`
        }
      }
    );

    console.log('✅ Payment info retrieved');

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('❌ Get payment error:', error.response?.data || error.message);
    
    res.status(error.response?.status || 500).json({ 
      success: false,
      error: 'Failed to get payment info',
      details: error.response?.data || error.message,
      paymentId: req.params.paymentId
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log('🚀 Tasbih Backend API Server');
  console.log('🚀 ========================================');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📡 Status: Ready to handle Pi Network payments`);
  console.log(`🔑 API Key: ${API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log('🚀 ========================================');
});

module.exports = app;