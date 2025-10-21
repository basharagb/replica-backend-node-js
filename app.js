// ============================================================
// 📦 Imports
// ============================================================
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { pool } from './src/infrastructure/database/db.js';
import siloRoutes from './src/presentation/routes/siloRoutes.js';
import readingRoutes from './src/presentation/routes/readingRoutes.js';
import alertRoutes from './src/presentation/routes/alertRoutes.js';
import userRoutes from './src/presentation/routes/userRoutes.js';
import smsRoutes from './src/presentation/routes/smsRoutes.js';
import environmentRoutes from './src/presentation/routes/environmentRoutes.js';
import siloLevelRoutes from './src/presentation/routes/siloLevelRoutes.js';
import { responseFormatter } from './src/infrastructure/utils/responseFormatter.js';
import { UserController } from './src/presentation/controllers/userController.js';

// ============================================================
// ⚙️ Environment Configuration
// ============================================================
dotenv.config();

// ============================================================
// 🚀 Initialize Express App
// ============================================================
const app = express();

// Middleware setup
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// 🩺 Health Check Endpoint
// ============================================================
app.get('/health', async (req, res) => {
  try {
    console.log('✅ /health endpoint hit');

    const [rows] = await pool.query('SELECT 1 AS result');

    res.status(200).json(
      responseFormatter.success(
        {
          system: 'Silo Monitoring API',
          database: true,
          result: rows[0],
        },
        'System healthy'
      )
    );
  } catch (err) {
    console.error('❌ Database connection error:', err);
    res.status(500).json(
      responseFormatter.error(`Database error: ${err.message}`, 500)
    );
  }
});

// ============================================================
// 🌾 API Routes - مسارات واجهة برمجة التطبيقات
// ============================================================
app.use('/api/silos', siloRoutes);
app.use('/readings', readingRoutes);
app.use('/alerts', alertRoutes);
app.use('/sms', smsRoutes);
app.use('/env_temp', environmentRoutes);
app.use('/silos/level-estimate', siloLevelRoutes);
app.use('/api/users', userRoutes);

// 🔹 Direct login endpoint for Postman compatibility
const userController = new UserController();
app.post('/login', userController.login.bind(userController));

// ============================================================
// 🧭 Root Endpoint (Landing Page)
// ============================================================
app.get('/', (req, res) => {
  res.type('html').send(`
    <style>
      body { font-family: 'Segoe UI', sans-serif; text-align: center; padding-top: 60px; background-color: #fafafa; color: #333; }
      h1 { color: #2E8B57; margin-bottom: 8px; }
      h3 { color: #555; margin-bottom: 30px; }
      a {
        color: #2E8B57;
        text-decoration: none;
        border: 1px solid #2E8B57;
        padding: 8px 16px;
        border-radius: 8px;
        background-color: #e6f4ea;
        transition: 0.2s;
      }
      a:hover { background-color: #2E8B57; color: #fff; }
    </style>

    <h1>🌾 Silo Monitoring API</h1>
    <h3>Backend Service is Running Successfully</h3>
    <p>✅ <strong>Database:</strong> Connected</p>
    <p>
      Try: 
      <a href="/health">/health</a> &nbsp; | &nbsp;
      <a href="/api/silos">/api/silos</a>
    </p>
  `);
});

// ============================================================
// ⚠️ Global Error Handler (Fallback)
// ============================================================
app.use((err, req, res, next) => {
  console.error('🔥 Uncaught Error:', err);
  res
    .status(500)
    .json(responseFormatter.error('Internal Server Error', 500));
});

// ============================================================
// 🌍 Start Server
// ============================================================
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running at: http://${HOST}:${PORT}`);
});

// ============================================================
// 🧹 Graceful Shutdown (CTRL + C handler)
// ============================================================
process.on('SIGINT', async () => {
  console.log('\n🧹 Closing MySQL pool and exiting gracefully...');
  try {
    await pool.end();
    console.log('✅ MySQL pool closed successfully.');
  } catch (err) {
    console.error('❌ Error closing MySQL pool:', err.message);
  } finally {
    process.exit(0);
  }
});