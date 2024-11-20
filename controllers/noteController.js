const Groq = require('groq-sdk'); // Import Groq SDK
const Note = require('../models/Note');
const PDFDocument = require('pdfkit');
const shortid = require('shortid'); // Import shortid for unique link generation
const logger = require('../utils/logger'); // Import Winston logger

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // Initialize Groq SDK with API Key

// 1. Generate Notes Using llama3-8b-8192
exports.createNote = async (req, res, next) => {
  const { folderName, subTopic } = req.body;

  try {
    logger.info(`Starting note creation for subTopic: ${subTopic}`);

    // Create the prompt for Groq API
    const prompt = `Create a detailed, slide-by-slide explanation of the topic "${subTopic}". Include definition, types, uses, importance, applications, examples, and other relevant points.`;

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
    const generatedSlides = response.choices[0]?.message?.content.split('\n\n') || [];
    if (generatedSlides.length === 0) {
      throw new Error('Failed to generate slides from Groq API.');
    }

    // Generate a shareable link
    const shareableLink = `https://your-app-url.com/notes/${shortid.generate()}`;

    // Save the note in MongoDB
    const note = new Note({
      userId: req.user.userId,
      folderName,
      subTopic,
      content: JSON.stringify(generatedSlides),
      shareableLink,
    });

    await note.save();
    logger.info(`Note created successfully for subTopic: ${subTopic}, Note ID: ${note._id}`);
    res.status(201).json({ message: 'Note created successfully', note });
  } catch (err) {
    logger.error(`Error creating note for subTopic: ${subTopic} - ${err.message}`);
    next(err);
  }
};


// 2. Edit Existing Notes
exports.editNote = async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    logger.info(`Editing note with ID: ${id}`);
    const note = await Note.findByIdAndUpdate(id, { content: JSON.stringify(content) }, { new: true });

    if (!note) {
      logger.error(`Note not found with ID: ${id}`);
      const error = new Error('Note not found');
      error.status = 404;
      throw error;
    }

    logger.info(`Note updated successfully, Note ID: ${id}`);
    res.status(200).json({ message: 'Note updated successfully', note });
  } catch (err) {
    logger.error(`Error editing note with ID: ${id} - ${err.message}`);
    next(err);
  }
};

// 3. Download Notes as PDF
exports.downloadNoteAsPDF = async (req, res, next) => {
  const { id } = req.params;

  try {
    logger.info(`Generating PDF for note with ID: ${id}`);
    const note = await Note.findById(id);
    if (!note) {
      logger.error(`Note not found with ID: ${id}`);
      const error = new Error('Note not found');
      error.status = 404;
      throw error;
    }

    const slides = JSON.parse(note.content);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${note.subTopic}.pdf`);
    doc.pipe(res);

    doc.fontSize(16).text(`Notes on ${note.subTopic}`, { align: 'center' }).moveDown(2);
    slides.forEach((slide, index) => {
      doc.fontSize(14).text(`Slide ${index + 1}:`, { underline: true }).moveDown(0.5);
      doc.fontSize(12).text(slide).moveDown(2);
    });

    doc.end();
    logger.info(`PDF generated successfully for note with ID: ${id}`);
  } catch (err) {
    logger.error(`Error generating PDF for note with ID: ${id} - ${err.message}`);
    next(err);
  }
};

// 4. Save a New Version
exports.saveNoteVersion = async (req, res, next) => {
  const { id } = req.params;

  try {
    logger.info(`Saving a new version for note with ID: ${id}`);
    const note = await Note.findById(id);
    if (!note) {
      logger.error(`Note not found with ID: ${id}`);
      const error = new Error('Note not found');
      error.status = 404;
      throw error;
    }

    const newVersion = {
      versionNumber: note.versions.length + 1,
      content: note.content,
      savedAt: new Date(),
    };

    note.versions.push(newVersion);
    await note.save();

    logger.info(`Version saved successfully for note with ID: ${id}`);
    res.status(200).json({ message: 'Version saved successfully', versions: note.versions });
  } catch (err) {
    logger.error(`Error saving version for note with ID: ${id} - ${err.message}`);
    next(err);
  }
};

// 5. Retrieve All Versions
exports.getNoteVersions = async (req, res, next) => {
  const { id } = req.params;

  try {
    logger.info(`Retrieving all versions for note with ID: ${id}`);
    const note = await Note.findById(id);
    if (!note) {
      logger.error(`Note not found with ID: ${id}`);
      const error = new Error('Note not found');
      error.status = 404;
      throw error;
    }

    logger.info(`Versions retrieved successfully for note with ID: ${id}`);
    res.status(200).json({ message: 'Versions retrieved successfully', versions: note.versions });
  } catch (err) {
    logger.error(`Error retrieving versions for note with ID: ${id} - ${err.message}`);
    next(err);
  }
};

// 6. Add Tags to Notes
exports.addTagsToNote = async (req, res, next) => {
  const { id } = req.params;
  const { tags } = req.body;

  try {
    logger.info(`Adding tags to note with ID: ${id}`);
    const note = await Note.findById(id);
    if (!note) {
      logger.error(`Note not found with ID: ${id}`);
      const error = new Error('Note not found');
      error.status = 404;
      throw error;
    }

    note.tags = [...new Set([...note.tags, ...tags])];
    await note.save();

    logger.info(`Tags added successfully to note with ID: ${id}`);
    res.status(200).json({ message: 'Tags added successfully', note });
  } catch (err) {
    logger.error(`Error adding tags to note with ID: ${id} - ${err.message}`);
    next(err);
  }
};

// 7. Search Notes by Tags
exports.searchNotesByTags = async (req, res, next) => {
  const { tags } = req.body;

  try {
    logger.info(`Searching for notes with tags: ${tags.join(', ')}`);
    const notes = await Note.find({ tags: { $all: tags } });
    logger.info(`Found ${notes.length} notes matching tags: ${tags.join(', ')}`);
    res.status(200).json({ notes });
  } catch (err) {
    logger.error(`Error searching notes by tags: ${tags.join(', ')} - ${err.message}`);
    next(err);
  }
};

// 8. Retrieve Note by Shareable Link
exports.getNoteByLink = async (req, res, next) => {
  const { link } = req.params;

  try {
    logger.info(`Retrieving note by shareable link: ${link}`);
    const note = await Note.findOne({ shareableLink: `https://your-app-url.com/notes/${link}` });
    if (!note) {
      logger.error(`Note not found for shareable link: ${link}`);
      const error = new Error('Note not found');
      error.status = 404;
      throw error;
    }

    logger.info(`Note retrieved successfully for shareable link: ${link}`);
    res.status(200).json({ note });
  } catch (err) {
    logger.error(`Error retrieving note for shareable link: ${link} - ${err.message}`);
    next(err);
  }
};
