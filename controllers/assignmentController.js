const Groq = require('groq-sdk'); // Import Groq SDK
const Assignment = require('../models/Assignment');
const PDFDocument = require('pdfkit');
const shortid = require('shortid'); // Import shortid for unique link generation
const logger = require('../utils/logger'); // Import Winston logger

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // Initialize Groq SDK with API Key

// 1. Generate Assignment Using Groq SDK
exports.createAssignment = async (req, res, next) => {
  const { subTopic, university } = req.body;

  try {
    logger.info(`Starting assignment creation for subTopic: ${subTopic}, University: ${university || 'None'}`);

    // Create the prompt for Groq API
    const prompt = `Create 3 MCQs and 2 descriptive questions on the topic "${subTopic}". ${
      university ? `Tailor the questions for ${university}.` : ''
    } Provide questions in JSON format, with MCQs including options and correct answers.`;

    // Call the Groq API
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-8b-8192', // Specify the model
      temperature: 0.7, // Adjust creativity level
      max_tokens: 1000, // Set token limit
    });

    // Process the response
    const generatedQuestions = response.choices[0]?.message?.content.trim();
    if (!generatedQuestions) {
      throw new Error('Failed to generate questions from Groq API.');
    }

    // Parse the generated questions (assuming it's returned in JSON format)
    const parsedQuestions = JSON.parse(generatedQuestions);

    // Generate a shareable link
    const shareableLink = `https://your-app-url.com/assignments/${shortid.generate()}`;

    // Save the assignment in MongoDB
    const assignment = new Assignment({
      userId: req.user.userId,
      subTopic,
      university,
      questions: parsedQuestions,
      shareableLink,
    });

    await assignment.save();
    logger.info(`Assignment created successfully for subTopic: ${subTopic}, Assignment ID: ${assignment._id}`);
    res.status(201).json({ message: 'Assignment created successfully', assignment });
  } catch (err) {
    logger.error(`Error creating assignment for subTopic: ${subTopic} - ${err.message}`);
    next(err);
  }
};

// 2. Edit Existing Assignment
exports.editAssignment = async (req, res, next) => {
  const { id } = req.params;
  const { questions } = req.body;

  try {
    logger.info(`Editing assignment with ID: ${id}`);
    const assignment = await Assignment.findByIdAndUpdate(id, { questions }, { new: true });

    if (!assignment) {
      logger.error(`Assignment not found with ID: ${id}`);
      const error = new Error('Assignment not found');
      error.status = 404;
      throw error;
    }

    logger.info(`Assignment updated successfully, Assignment ID: ${id}`);
    res.status(200).json({ message: 'Assignment updated successfully', assignment });
  } catch (err) {
    logger.error(`Error editing assignment with ID: ${id} - ${err.message}`);
    next(err);
  }
};

// 3. Download Assignment as PDF
exports.downloadAssignmentAsPDF = async (req, res, next) => {
  const { id } = req.params;

  try {
    logger.info(`Generating PDF for assignment with ID: ${id}`);
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      logger.error(`Assignment not found with ID: ${id}`);
      const error = new Error('Assignment not found');
      error.status = 404;
      throw error;
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${assignment.subTopic}_assignment.pdf`);
    doc.pipe(res);

    doc.fontSize(16).text(`Assignment: ${assignment.subTopic}`, { align: 'center' }).moveDown(2);

    assignment.questions.forEach((question, index) => {
      doc.fontSize(14).text(`Question ${index + 1}:`, { underline: true }).moveDown(0.5);
      doc.fontSize(12).text(question.question).moveDown(1);

      if (question.type === 'MCQ') {
        doc.fontSize(12).text(`Options: ${question.options.join(', ')}`).moveDown(1);
      }

      doc.fontSize(12).text(`Answer: ${question.answer || 'N/A'}`).moveDown(2);
    });

    doc.end();
    logger.info(`PDF generated successfully for assignment with ID: ${id}`);
  } catch (err) {
    logger.error(`Error generating PDF for assignment with ID: ${id} - ${err.message}`);
    next(err);
  }
};

// 4. Save a New Version
exports.saveAssignmentVersion = async (req, res, next) => {
  const { id } = req.params;

  try {
    logger.info(`Saving a new version for assignment with ID: ${id}`);
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      logger.error(`Assignment not found with ID: ${id}`);
      const error = new Error('Assignment not found');
      error.status = 404;
      throw error;
    }

    const newVersion = {
      versionNumber: assignment.versions.length + 1,
      questions: assignment.questions,
      savedAt: new Date(),
    };

    assignment.versions.push(newVersion);
    await assignment.save();

    logger.info(`Version saved successfully for assignment with ID: ${id}`);
    res.status(200).json({ message: 'Version saved successfully', versions: assignment.versions });
  } catch (err) {
    logger.error(`Error saving version for assignment with ID: ${id} - ${err.message}`);
    next(err);
  }
};

// 5. Retrieve All Versions
exports.getAssignmentVersions = async (req, res, next) => {
  const { id } = req.params;

  try {
    logger.info(`Retrieving all versions for assignment with ID: ${id}`);
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      logger.error(`Assignment not found with ID: ${id}`);
      const error = new Error('Assignment not found');
      error.status = 404;
      throw error;
    }

    logger.info(`Versions retrieved successfully for assignment with ID: ${id}`);
    res.status(200).json({ message: 'Versions retrieved successfully', versions: assignment.versions });
  } catch (err) {
    logger.error(`Error retrieving versions for assignment with ID: ${id} - ${err.message}`);
    next(err);
  }
};

// 6. Add Tags to Assignments
exports.addTagsToAssignment = async (req, res, next) => {
  const { id } = req.params;
  const { tags } = req.body;

  try {
    logger.info(`Adding tags to assignment with ID: ${id}`);
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      logger.error(`Assignment not found with ID: ${id}`);
      const error = new Error('Assignment not found');
      error.status = 404;
      throw error;
    }

    assignment.tags = [...new Set([...assignment.tags, ...tags])];
    await assignment.save();

    logger.info(`Tags added successfully to assignment with ID: ${id}`);
    res.status(200).json({ message: 'Tags added successfully', assignment });
  } catch (err) {
    logger.error(`Error adding tags to assignment with ID: ${id} - ${err.message}`);
    next(err);
  }
};

// 7. Search Assignments by Tags
exports.searchAssignmentsByTags = async (req, res, next) => {
  const { tags } = req.body;

  try {
    logger.info(`Searching for assignments with tags: ${tags.join(', ')}`);
    const assignments = await Assignment.find({ tags: { $all: tags } });
    logger.info(`Found ${assignments.length} assignments matching tags: ${tags.join(', ')}`);
    res.status(200).json({ assignments });
  } catch (err) {
    logger.error(`Error searching assignments by tags: ${tags.join(', ')} - ${err.message}`);
    next(err);
  }
};

// 8. Retrieve Assignment by Shareable Link
exports.getAssignmentByLink = async (req, res, next) => {
  const { link } = req.params;

  try {
    logger.info(`Retrieving assignment by shareable link: ${link}`);
    const assignment = await Assignment.findOne({ shareableLink: `https://your-app-url.com/assignments/${link}` });
    if (!assignment) {
      logger.error(`Assignment not found for shareable link: ${link}`);
      const error = new Error('Assignment not found');
      error.status = 404;
      throw error;
    }

    logger.info(`Assignment retrieved successfully for shareable link: ${link}`);
    res.status(200).json({ assignment });
  } catch (err) {
    logger.error(`Error retrieving assignment for shareable link: ${link} - ${err.message}`);
    next(err);
  }
};
