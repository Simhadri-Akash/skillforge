import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './server/config/db.js';
import authRoutes from './server/routes/auth.js';
import courseRoutes from './server/routes/courses.js';
import enrollmentRoutes from './server/routes/enrollments.js';
import teacherRoutes from './server/routes/teacher.js';
import deadlineRoutes from './server/routes/deadlines.js';
import assignmentRoutes from './server/routes/assignments.js';
import videoRoutes from './server/routes/videos.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/videos', videoRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});