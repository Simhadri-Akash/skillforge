import mongoose from 'mongoose';
const videoSchema = new mongoose.Schema({
  courseId: {
    type: Number,
    required: true,
    ref: 'Course'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    trim: true,
    maxLength: 1000
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number, // in seconds
    required: true,
    min: 1,
    max: 3600, // Maximum 1 hour (3600 seconds)
    validate: {
      validator: function(v) {
        return Number.isInteger(v) && v > 0 && v <= 3600;
      },
      message: 'Duration must be between 1 second and 1 hour (3600 seconds)'
    }
  },
  resolution: {
    type: String,
    enum: ['720p', '1080p', '1440p', '2160p'],
    default: '1080p'
  },
  order: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Format duration for display (converts seconds to HH:MM:SS)
videoSchema.methods.formatDuration = function() {
  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;
  
  return [
    hours > 0 ? hours.toString().padStart(2, '0') : null,
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].filter(Boolean).join(':');
};

// Ensure videos are ordered within a course
videoSchema.index({ courseId: 1, order: 1 });

export default mongoose.model('Video', videoSchema);