const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3005;
const coursesData = require('./courses.json');

// Define the course schema
const coursesSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  tags: [String]
});

// Define the Course model using the schema
const courses = mongoose.model('courses', coursesSchema);
module.exports = courses;

// Retrieve all BSIS courses
app.get('/api/courses/bsis', (req, res) => {
  try {
    const bsisCourses = coursesData.map(year => year['1st Year'].concat(year['2nd Year'], year['3rd Year'], year['4th Year'])).flat().filter(course => course.tags.includes('BSIS'));
    res.json(bsisCourses);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve all BSIT courses
app.get('/api/courses/bsit', (req, res) => {
  try {
    const bsitCourses = coursesData.map(year => year['1st Year'].concat(year['2nd Year'], year['3rd Year'], year['4th Year'])).flat().filter(course => course.tags.includes('BSIT'));
    res.json(bsitCourses);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to check if a course belongs to a backend course based on its tags
function isBackendCourse(course) {
  const backendTags = ['Database', 'System', 'Software', 'Enterprise', 'Web', 'Information'];
  return course.tags.some(tag => backendTags.includes(tag));
}

// Retrieve all backend courses alphabetically
app.get('/api/backend-courses', (req, res) => {
  try {
    const filteredCourses = coursesData.filter(year => Object.values(year).some(courseList => courseList.some(course => isBackendCourse(course))));

    let allCourses = [];
    filteredCourses.forEach(year => {
      Object.values(year).forEach(courseList => {
        allCourses = allCourses.concat(courseList.filter(course => isBackendCourse(course)));
      });
    });
    allCourses.sort((a, b) => a.description.localeCompare(b.description));

    res.json(allCourses);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define the endpoint name and specialization
app.get('/api/course-details', (req, res) => {
  try {
    const courseDetails = [];

    // Extract course name and specialization and add to courseDetails array
    coursesData.forEach(year => {
      Object.values(year).forEach(courseList => {
        courseList.forEach(course => {
          const { description, tags } = course;
          const name = tags[0];
          const specialization = tags[1];
          console.log(`Description: ${description}, Tags: ${tags}, Name: ${name}, Specialization: ${specialization}`);
          courseDetails.push({ name, specialization });
        });
      });
    });

    res.json(courseDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mongo-test')
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.error('Connection failed...', err));

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
