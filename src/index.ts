import express from 'express';
import dotenv from 'dotenv';
import { StreamChat } from 'stream-chat';
import { genSaltSync, hashSync } from 'bcrypt';

// Load environment variables from the .env file
dotenv.config();

// Destructure the required environment variables
const { PORT, STREAM_API_KEY, STREAM_API_SECRET } = process.env;

// Create an instance of the Stream Chat client
const client = StreamChat.getInstance(STREAM_API_KEY!, STREAM_API_SECRET);

// Create an instance of the Express application
const app = express();

// Generate a salt for password hashing
const salt = genSaltSync(10);

// Middleware to parse JSON request bodies
app.use(express.json());


//Interface for the User object
interface User {
  id: string;
  email: string;
  hashed_password: string;
}

// In-memory array to store user data
const USERS: User[] = [];

// Route handler for user registration
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = USERS.find((user) => user.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists.' });
    }

    try {
        const hashed_password = hashSync(password, salt);
        const id = Math.random().toString(36).slice(2);
        //console.log(' ~ file: index.ts ~ line 50 ~ app.get ~ id', id)
        const newUser = { 
            id,
            email,
            hashed_password
         };
        USERS.push(newUser);

        await client.upsertUser({
            id,
            email,
            name: email,
        });

        const token = client.createToken(id);
        res.status(201).json({
             token,
             user: {
                    id,
                    email,
                },
             });

        
        
    } catch (error) {
        res.status(500).json({ error: 'User already exists.' });
    }
  // ... (register route handler)
});

// Route handler for user login (POST request)
app.get('/login', (req, res) => {
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}   );