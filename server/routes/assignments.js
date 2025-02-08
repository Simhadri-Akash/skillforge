import express from 'express';
import auth from '../middleware/auth.js';
import Assignment from '../models/Assignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import User from '../models/User.js';

const router = express.Router();

// Create assignment (teacher only)
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create assignments' });
    }

    const assignment = new Assignment(req.body);
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get assignments for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ courseId: req.params.courseId });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit assignment
router.post('/:assignmentId/submit', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Calculate score
    const answers = req.body.answers;
    let score = 0;
    answers.forEach((answer, index) => {
      if (answer.selectedOption === assignment.questions[index].correctAnswer) {
        score++;
      }
    });

    const finalScore = (score / assignment.questions.length) * 100;

    const submission = new AssignmentSubmission({
      assignmentId: req.params.assignmentId,
      userId: req.userId,
      answers: answers,
      score: finalScore
    });

    await submission.save();
    res.status(201).json({ score: finalScore, submission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get student's submissions
router.get('/submissions', auth, async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({ userId: req.userId })
      .populate('assignmentId');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;