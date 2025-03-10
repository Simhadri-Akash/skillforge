import express from 'express';
import auth from '../middleware/auth.js';
import VideoProgress from '../models/VideoProgress.js';
import Video from '../models/Video.js';

const router = express.Router();

// Update video progress
router.post('/:videoId/progress', auth, async (req, res) => {
  try {
    const { watchedSeconds, completed } = req.body;
    
    let progress = await VideoProgress.findOne({
      userId: req.userId,
      videoId: req.params.videoId
    });

    if (progress) {
      progress.watchedSeconds = watchedSeconds;
      progress.completed = completed;
      progress.lastWatched = new Date();
    } else {
      progress = new VideoProgress({
        userId: req.userId,
        videoId: req.params.videoId,
        watchedSeconds,
        completed
      });
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get video progress
router.get('/:videoId/progress', auth, async (req, res) => {
  try {
    const progress = await VideoProgress.findOne({
      userId: req.userId,
      videoId: req.params.videoId
    });
    res.json(progress || { watchedSeconds: 0, completed: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get total watched time for user
router.get('/total-time', auth, async (req, res) => {
  try {
    const progresses = await VideoProgress.find({ userId: req.userId });
    const totalSeconds = progresses.reduce((acc, curr) => acc + curr.watchedSeconds, 0);
    res.json({ totalSeconds });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all videos for a course with progress
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const videos = await Video.find({ courseId: req.params.courseId }).sort('order');
    const progresses = await VideoProgress.find({ 
      userId: req.userId,
      videoId: { $in: videos.map(v => v._id) }
    });

    const videosWithProgress = videos.map(video => {
      const progress = progresses.find(p => p.videoId.toString() === video._id.toString());
      return {
        ...video.toObject(),
        progress: progress ? {
          watchedSeconds: progress.watchedSeconds,
          completed: progress.completed,
          lastWatched: progress.lastWatched
        } : null
      };
    });

    res.json(videosWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;