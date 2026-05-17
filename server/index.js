import express from 'express';
import cors from 'cors';
import chatRoute from './routes/chat.js';

console.log('=== 🚀 SERVER STARTING ===');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/chat', chatRoute);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// ✅ Render uses process.env.PORT - this is important!
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 API endpoint: /api/chat`);
    console.log(`📍 Health check: /api/health`);
});