const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/appquiz',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
    origin: true,  // Allow all origins temporarily for debugging
    credentials: true
}));
app.use(express.json());

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

        console.log('Database initialized');
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
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
    console.log('Admin check - req.user:', req.user); // Debug log
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Routes
app.get('/api/health', (req, res) => {
    console.log('Health check called from:', req.get('origin'));
    res.json({ status: 'OK', message: 'Server is running' });
});

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
    console.log('Test endpoint called from:', req.get('origin'));
    res.json({ message: 'CORS test successful', timestamp: new Date().toISOString() });
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
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: result.rows[0].id,
                email: result.rows[0].email,
                name: result.rows[0].name,
                isAdmin: result.rows[0].isAdmin || false
            },
            token
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

        console.log('User from DB:', user); // Debug log
        console.log('isAdmin value:', user.isAdmin); // Debug log

        const token = jwt.sign(
            { userId: user.id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        const userResponse = {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin || false
        };

        console.log('User response:', userResponse); // Debug log

        res.json({
            message: 'Login successful',
            user: userResponse,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
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

// Get question counts by user
app.get('/api/questions/stats', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.id,
                u.name,
                u.email,
                COUNT(q.id) as question_count
            FROM users u
            LEFT JOIN questions q ON u.id = q.created_by
            GROUP BY u.id, u.name, u.email
            ORDER BY question_count DESC, u.name ASC
        `);

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
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

// Get all questions for game (random order) - Admin only
app.get('/api/game/questions', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        q.id,
        q.question_text,
        u_addressee.name as addressee_name
      FROM questions q
      LEFT JOIN users u_addressee ON q.addressee_id = u_addressee.id
      ORDER BY RANDOM()
    `);

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
    console.log(`Server is running on port ${PORT}`);
}); 