const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection with optimized settings
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/appquiz',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    query_timeout: 5000, // Query timeout after 5 seconds
});

// Middleware
app.use(cors({
    origin: true,  // Allow all origins temporarily for debugging
    credentials: true
}));
app.use(express.json());

// Request timing middleware (disabled for cleaner output)
// app.use((req, res, next) => {
//     const start = Date.now();
//     res.on('finish', () => {
//         const duration = Date.now() - start;
//         if (duration > 1000) {
//             console.log(`🐌 SLOW REQUEST: ${req.method} ${req.path} - ${duration}ms`);
//         }
//     });
//     next();
// });

// Initialize database tables
const initDB = async () => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        "isAdmin" BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Add isAdmin column if it doesn't exist (for existing databases)
        await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT FALSE
    `);

        // console.log('Database initialized');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
};

initDB();

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) {
            // console.log('🚫 Token verification failed:', err.message);
            return res.sendStatus(401);
        }
        req.user = user;
        next();
    });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
    // console.log('Admin check - req.user:', req.user);
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Routes
app.get('/api/health', (req, res) => {
    // console.log('Health check called from:', req.get('origin'));
    res.json({ status: 'OK', message: 'Server is running' });
});

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
    // console.log('Test endpoint called from:', req.get('origin'));
    res.json({ message: 'CORS test successful', timestamp: new Date().toISOString() });
});

// Test endpoint that requires authentication (to trigger 401 when token expires)
app.get('/api/test-auth', authenticateToken, (req, res) => {
    // console.log('🔐 Authenticated test endpoint called by user:', req.user.email);
    res.json({
        message: 'Authentication test successful',
        user: req.user.email,
        timestamp: new Date().toISOString()
    });
});

// Register user
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, "isAdmin"',
            [email, hashedPassword, name]
        );

        const token = jwt.sign(
            { userId: result.rows[0].id, email: result.rows[0].email, isAdmin: result.rows[0].isAdmin },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { userId: result.rows[0].id, type: 'refresh' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: result.rows[0].id,
                email: result.rows[0].email,
                name: result.rows[0].name,
                isAdmin: result.rows[0].isAdmin || false
            },
            token,
            refreshToken
        });
    } catch (error) {
        if (error.code === '23505') {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // console.log('User from DB:', user);
        // console.log('isAdmin value:', user.isAdmin);

        const token = jwt.sign(
            { userId: user.id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id, type: 'refresh' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        const userResponse = {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin || false
        };

        // console.log('User response:', userResponse);

        res.json({
            message: 'Login successful',
            user: userResponse,
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Refresh token
app.post('/api/refresh', async (req, res) => {
    // console.log('🔄 Token refresh request received');
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' });
        }

        jwt.verify(refreshToken, process.env.JWT_SECRET || 'secret', async (err, decoded) => {
            if (err || decoded.type !== 'refresh') {
                return res.status(403).json({ error: 'Invalid refresh token' });
            }

            // Get user data
            const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = result.rows[0];

            // Generate new tokens
            const newToken = jwt.sign(
                { userId: user.id, email: user.email, isAdmin: user.isAdmin },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '1m' }
            );

            const newRefreshToken = jwt.sign(
                { userId: user.id, type: 'refresh' },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '7d' }
            );

            // console.log('✅ Token refresh successful for user:', user.email);
            res.json({
                token: newToken,
                refreshToken: newRefreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    isAdmin: user.isAdmin || false
                }
            });
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save user data
app.post('/api/user/data', authenticateToken, async (req, res) => {
    try {
        const { data } = req.body;
        const userId = req.user.userId;

        // Create user_data table if it doesn't exist
        await pool.query(`
      CREATE TABLE IF NOT EXISTS user_data (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // First check if user data exists
        const existingData = await pool.query('SELECT id FROM user_data WHERE user_id = $1', [userId]);

        let result;
        if (existingData.rows.length > 0) {
            // Update existing data
            result = await pool.query(`
        UPDATE user_data 
        SET data = $2, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = $1 
        RETURNING *
      `, [userId, JSON.stringify(data)]);
        } else {
            // Insert new data
            result = await pool.query(`
        INSERT INTO user_data (user_id, data) 
        VALUES ($1, $2) 
        RETURNING *
      `, [userId, JSON.stringify(data)]);
        }

        res.json({
            message: 'User data saved successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Save data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user data
app.get('/api/user/data', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query('SELECT * FROM user_data WHERE user_id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.json({ data: null });
        }

        res.json({
            data: result.rows[0].data,
            updated_at: result.rows[0].updated_at
        });
    } catch (error) {
        console.error('Get data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all users (for dropdown)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email FROM users ORDER BY name');
        res.json({ users: result.rows });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get question counts by addressee for current user's created questions
app.get('/api/questions/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(`
            SELECT 
                u.id,
                u.name,
                u.email,
                COUNT(q.id) as question_count
            FROM users u
            LEFT JOIN questions q ON (u.id = q.addressee_id AND q.created_by = $1)
            GROUP BY u.id, u.name, u.email
            HAVING COUNT(q.id) > 0
            ORDER BY question_count DESC, u.name ASC
        `, [userId]);

        res.json({ stats: result.rows });
    } catch (error) {
        console.error('Get question stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save questions
app.post('/api/questions', authenticateToken, async (req, res) => {
    try {
        const { questions } = req.body;
        const createdById = req.user.userId;

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: 'Questions array is required' });
        }

        // Create questions table if it doesn't exist
        await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question_text TEXT NOT NULL,
        addressee_id INTEGER REFERENCES users(id),
        created_by INTEGER REFERENCES users(id),
        included_in_game BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Add included_in_game column if it doesn't exist (for existing databases)
        await pool.query(`
      ALTER TABLE questions 
      ADD COLUMN IF NOT EXISTS included_in_game BOOLEAN DEFAULT TRUE
    `);

        // Insert all questions
        const insertPromises = questions.map(q => {
            return pool.query(
                'INSERT INTO questions (question_text, addressee_id, created_by) VALUES ($1, $2, $3) RETURNING *',
                [q.text, q.addresseeId, createdById]
            );
        });

        const results = await Promise.all(insertPromises);
        const savedQuestions = results.map(r => r.rows[0]);

        res.json({
            message: 'Questions saved successfully',
            questions: savedQuestions
        });
    } catch (error) {
        console.error('Save questions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get questions (only user's own questions)
app.get('/api/questions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(`
      SELECT 
        q.id,
        q.question_text,
        q.created_at,
        q.addressee_id,
        q.included_in_game,
        u_addressee.name as addressee_name,
        u_addressee.email as addressee_email,
        u_creator.name as creator_name
      FROM questions q
      LEFT JOIN users u_addressee ON q.addressee_id = u_addressee.id
      LEFT JOIN users u_creator ON q.created_by = u_creator.id
      WHERE q.created_by = $1
      ORDER BY q.created_at DESC
    `, [userId]);

        res.json({ questions: result.rows });
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get game questions (random order, filtered by room if specified)
app.get('/api/game/questions', authenticateToken, async (req, res) => {
    try {
        const { room_id } = req.query;
        const userId = req.user.userId;

        let query;
        let params;

        if (room_id) {
            // Verify user is in the room
            const memberCheck = await pool.query(
                'SELECT id FROM room_members WHERE room_id = $1 AND user_id = $2',
                [room_id, userId]
            );

            if (memberCheck.rows.length === 0) {
                return res.status(403).json({ error: 'You are not a member of this room' });
            }

            // Get questions from users in the room, addressed to users in the room
            query = `
                SELECT 
                    q.id,
                    q.question_text,
                    q.addressee_id,
                    u.name as addressee_name,
                    u.email as addressee_email
                FROM questions q
                LEFT JOIN users u ON q.addressee_id = u.id
                WHERE q.included_in_game = TRUE
                AND q.created_by IN (
                    SELECT user_id FROM room_members WHERE room_id = $1
                )
                AND q.addressee_id IN (
                    SELECT user_id FROM room_members WHERE room_id = $1
                )
                ORDER BY RANDOM()
            `;
            params = [room_id];
        } else {
            // Original behavior - all questions
            query = `
                SELECT 
                    q.id,
                    q.question_text,
                    q.addressee_id,
                    u.name as addressee_name,
                    u.email as addressee_email
                FROM questions q
                LEFT JOIN users u ON q.addressee_id = u.id
                WHERE q.included_in_game = TRUE
                ORDER BY RANDOM()
            `;
            params = [];
        }

        const result = await pool.query(query, params);

        res.json({ questions: result.rows });
    } catch (error) {
        console.error('Get game questions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update question
app.put('/api/questions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { question_text, addressee_id } = req.body;
        const userId = req.user.userId;

        if (!question_text || !addressee_id) {
            return res.status(400).json({ error: 'Question text and addressee are required' });
        }

        // Check if user owns this question
        const checkOwnership = await pool.query(
            'SELECT created_by FROM questions WHERE id = $1',
            [id]
        );

        if (checkOwnership.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        if (checkOwnership.rows[0].created_by !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this question' });
        }

        const result = await pool.query(
            'UPDATE questions SET question_text = $1, addressee_id = $2 WHERE id = $3 RETURNING *',
            [question_text, addressee_id, id]
        );

        res.json({
            message: 'Question updated successfully',
            question: result.rows[0]
        });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Toggle question inclusion in game
app.patch('/api/questions/:id/toggle-game', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Check if user owns this question
        const checkOwnership = await pool.query(
            'SELECT created_by, included_in_game FROM questions WHERE id = $1',
            [id]
        );

        if (checkOwnership.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        if (checkOwnership.rows[0].created_by !== userId) {
            return res.status(403).json({ error: 'Not authorized to modify this question' });
        }

        // Toggle the included_in_game status
        const currentStatus = checkOwnership.rows[0].included_in_game;
        const newStatus = !currentStatus;

        const result = await pool.query(
            'UPDATE questions SET included_in_game = $1 WHERE id = $2 RETURNING *',
            [newStatus, id]
        );

        res.json({
            message: `Question ${newStatus ? 'included in' : 'excluded from'} game`,
            question: result.rows[0],
            included_in_game: newStatus
        });
    } catch (error) {
        console.error('Toggle game inclusion error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete question
app.delete('/api/questions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Check if user owns this question
        const checkOwnership = await pool.query(
            'SELECT created_by FROM questions WHERE id = $1',
            [id]
        );

        if (checkOwnership.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        if (checkOwnership.rows[0].created_by !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this question' });
        }

        await pool.query('DELETE FROM questions WHERE id = $1', [id]);

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Generate random 3-digit room number
const generateRoomNumber = async () => {
    let roomNumber;
    let isUnique = false;

    while (!isUnique) {
        roomNumber = Math.floor(100 + Math.random() * 900).toString();
        const existing = await pool.query('SELECT id FROM rooms WHERE room_number = $1', [roomNumber]);
        isUnique = existing.rows.length === 0;
    }

    return roomNumber;
};

// Create room
app.post('/api/rooms', authenticateToken, async (req, res) => {
    try {
        const { name, password } = req.body;
        const createdBy = req.user.userId;

        if (!name || !password) {
            return res.status(400).json({ error: 'Room name and password are required' });
        }

        if (password.length < 3) {
            return res.status(400).json({ error: 'Password must be at least 3 characters long' });
        }

        const roomNumber = await generateRoomNumber();
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO rooms (room_number, name, password, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
            [roomNumber, name, hashedPassword, createdBy]
        );

        // Add creator as first member
        await pool.query(
            'INSERT INTO room_members (room_id, user_id) VALUES ($1, $2)',
            [result.rows[0].id, createdBy]
        );

        res.status(201).json({
            message: 'Room created successfully',
            room: {
                id: result.rows[0].id,
                room_number: result.rows[0].room_number,
                name: result.rows[0].name,
                created_by: result.rows[0].created_by,
                created_at: result.rows[0].created_at
            }
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Join room
app.post('/api/rooms/join', authenticateToken, async (req, res) => {
    try {
        const { room_number, password } = req.body;
        const userId = req.user.userId;

        if (!room_number || !password) {
            return res.status(400).json({ error: 'Room number and password are required' });
        }

        // Find room
        const roomResult = await pool.query('SELECT * FROM rooms WHERE room_number = $1', [room_number]);

        if (roomResult.rows.length === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const room = roomResult.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, room.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // Check if user is already a member
        const existingMember = await pool.query(
            'SELECT id FROM room_members WHERE room_id = $1 AND user_id = $2',
            [room.id, userId]
        );

        if (existingMember.rows.length === 0) {
            // Add user to room
            await pool.query(
                'INSERT INTO room_members (room_id, user_id) VALUES ($1, $2)',
                [room.id, userId]
            );
        }

        res.json({
            message: 'Successfully joined room',
            room: {
                id: room.id,
                room_number: room.room_number,
                name: room.name,
                created_by: room.created_by
            }
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user statistics (admin only)
app.get('/api/admin/user-stats', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const result = await pool.query(`
            SELECT 
                u.name as creator_name,
                addressee.name as addressee_name,
                COUNT(q.id) as question_count
            FROM users u
            LEFT JOIN questions q ON u.id = q.created_by
            LEFT JOIN users addressee ON q.addressee_id = addressee.id
            WHERE q.id IS NOT NULL
            GROUP BY u.id, u.name, addressee.id, addressee.name
            ORDER BY u.name, addressee.name
        `);

        // Group by creator
        const stats = {};
        result.rows.forEach(row => {
            if (!stats[row.creator_name]) {
                stats[row.creator_name] = {
                    creator_name: row.creator_name,
                    total_questions: 0,
                    by_addressee: []
                };
            }
            stats[row.creator_name].total_questions += parseInt(row.question_count);
            stats[row.creator_name].by_addressee.push({
                addressee_name: row.addressee_name,
                question_count: parseInt(row.question_count)
            });
        });

        res.json({ stats: Object.values(stats) });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all available rooms (for discovery)
app.get('/api/rooms/available', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                r.id,
                r.room_number,
                r.name,
                r.created_by,
                r.created_at,
                u.name as creator_name,
                COUNT(rm.user_id) as member_count
            FROM rooms r
            LEFT JOIN users u ON r.created_by = u.id
            LEFT JOIN room_members rm ON r.id = rm.room_id
            GROUP BY r.id, r.room_number, r.name, r.created_by, r.created_at, u.name
            ORDER BY r.created_at DESC
        `);

        res.json({ rooms: result.rows });
    } catch (error) {
        console.error('Get available rooms error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's rooms
app.get('/api/rooms/my-rooms', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(`
            SELECT 
                r.id,
                r.room_number,
                r.name,
                r.created_by,
                r.created_at,
                u.name as creator_name,
                COUNT(rm.user_id) as member_count
            FROM rooms r
            LEFT JOIN users u ON r.created_by = u.id
            LEFT JOIN room_members rm ON r.id = rm.room_id
            WHERE r.id IN (
                SELECT room_id FROM room_members WHERE user_id = $1
            )
            GROUP BY r.id, r.room_number, r.name, r.created_by, r.created_at, u.name
            ORDER BY r.created_at DESC
        `, [userId]);

        res.json({ rooms: result.rows });
    } catch (error) {
        console.error('Get user rooms error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Leave room
app.post('/api/rooms/:id/leave', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Check if user is a member of the room
        const memberCheck = await pool.query(
            'SELECT id FROM room_members WHERE room_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(404).json({ error: 'You are not a member of this room' });
        }

        // Remove user from room
        await pool.query(
            'DELETE FROM room_members WHERE room_id = $1 AND user_id = $2',
            [id, userId]
        );

        res.json({ message: 'Successfully left the room' });
    } catch (error) {
        console.error('Leave room error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete room (only creator can delete)
app.delete('/api/rooms/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Check if user is the creator
        const roomResult = await pool.query('SELECT created_by FROM rooms WHERE id = $1', [id]);

        if (roomResult.rows.length === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }

        if (roomResult.rows[0].created_by !== userId) {
            return res.status(403).json({ error: 'Only the room creator can delete the room' });
        }

        // Delete room (cascade will delete room_members)
        await pool.query('DELETE FROM rooms WHERE id = $1', [id]);

        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.userId;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const result = await pool.query(
            'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, email, name, "isAdmin"',
            [name.trim(), userId]
        );

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: result.rows[0].id,
                email: result.rows[0].email,
                name: result.rows[0].name,
                isAdmin: result.rows[0].isAdmin || false
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    // console.log(`Server is running on port ${PORT}`);
}); 