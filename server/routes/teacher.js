import express from 'express';
import auth from '../middleware/auth.js';
import Course from '../models/Course.js';
import Video from '../models/Video.js';
import Deadline from '../models/Deadline.js';
import User from '../models/User.js';
import Section from '../models/Section.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Middleware to check if user is a teacher
const isTeacher = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teachers only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teacher's courses
router.get('/courses', auth, isTeacher, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new course
router.post('/courses', auth, isTeacher, async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      instructor: req.userId
    });
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a course
router.delete('/courses/:courseId', auth, isTeacher, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Delete associated videos
    await Video.deleteMany({ courseId: req.params.courseId });
    
    // Delete associated deadlines
    await Deadline.deleteMany({ courseId: req.params.courseId });
    
    // Delete associated sections
    await Section.deleteMany({ courseId: req.params.courseId });
    
    // Delete the course
    await Course.findByIdAndDelete(req.params.courseId);
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new section
router.post('/courses/:courseId/sections', auth, isTeacher, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get the count of existing sections to set the order
    const sectionCount = await Section.countDocuments({ courseId: req.params.courseId });

    const section = new Section({
      id: uuidv4(), // Generate a unique ID for the section
      title: req.body.title,
      courseId: req.params.courseId,
      order: sectionCount + 1
    });

    const newSection = await section.save();
    res.status(201).json(newSection);
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get course sections
router.get('/courses/:courseId/sections', auth, isTeacher, async (req, res) => {
  try {
    const sections = await Section.find({ courseId: req.params.courseId })
      .sort('order');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a video to a course
router.post('/courses/:courseId/videos', auth, isTeacher, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Verify the section exists if a sectionId is provided
    if (req.body.sectionId) {
      const section = await Section.findOne({ id: req.body.sectionId });
      if (!section) {
        return res.status(404).json({ message: 'Section not found' });
      }
    }

    // Get the count of existing videos to set the order
    const videoCount = await Video.countDocuments({ courseId: req.params.courseId });

    const video = new Video({
      courseId: req.params.courseId,
      title: req.body.title,
      description: req.body.description || '',
      url: req.body.url,
      duration: parseInt(req.body.duration),
      resolution: req.body.resolution,
      sectionId: req.body.sectionId,
      order: videoCount + 1
    });

    const newVideo = await video.save();
    res.status(201).json(newVideo);
  } catch (error) {
    console.error('Error adding video:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get course videos
router.get('/courses/:courseId/videos', auth, isTeacher, async (req, res) => {
  try {
    const videos = await Video.find({ courseId: req.params.courseId })
      .sort('order');
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a deadline to a course
router.post('/courses/:courseId/deadlines', auth, isTeacher, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const deadline = new Deadline({
      courseId: req.params.courseId,
      ...req.body
    });
    const newDeadline = await deadline.save();
    res.status(201).json(newDeadline);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get course deadlines
router.get('/courses/:courseId/deadlines', auth, isTeacher, async (req, res) => {
  try {
    const deadlines = await Deadline.find({ courseId: req.params.courseId })
      .sort('dueDate');
    res.json(deadlines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;