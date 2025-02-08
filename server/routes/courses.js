import express from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Video from '../models/Video.js';
import Section from '../models/Section.js';

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single course with sections and videos
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get sections for the course
    const sections = await Section.find({ courseId: req.params.id }).sort('order');
    
    // Get videos for the course
    const videos = await Video.find({ courseId: req.params.id });

    res.json({
      course,
      sections,
      videos
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get enrolled students count for a course
router.get('/:courseId/enrollments/count', async (req, res) => {
  try {
    const count = await Enrollment.countDocuments({
      courseId: req.params.courseId,
      status: 'active'
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a course
router.post('/', async (req, res) => {
  const course = new Course({
    _id: req.body._id,
    title: req.body.title,
    description: req.body.description,
    instructor: req.body.instructor,
    duration: req.body.duration,
    rating: req.body.rating,
    image: req.body.image,
    topics: req.body.topics,
    price: req.body.price,
    createdAt: req.body.createdAt
  });

  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;