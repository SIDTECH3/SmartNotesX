const { Configuration, OpenAIApi } = require('openai');
const Note = require('../models/Note');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Add your OpenAI API key to .env
});

const openai = new OpenAIApi(configuration);

exports.createNote = async (req, res) => {
  const { folderName, subTopic } = req.body;
  try {
    // Use OpenAI to generate notes
    const prompt = `Create a detailed, slide-by-slide explanation of the topic "${subTopic}". Include definition, types, uses, importance, applications, examples, and other relevant points. Each slide should be concise and well-structured.`;

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 1000,
    });

    const generatedSlides = response.data.choices[0].text.split('\n\n'); // Split slides

    const note = new Note({
      userId: req.user.userId,
      folderName,
      subTopic,
      content: JSON.stringify(generatedSlides), // Save slides as JSON
    });

    await note.save();
    res.status(201).json({ message: 'Note created successfully', slides: generatedSlides });
  } catch (err) {
    res.status(500).json({ message: 'Error generating notes', error: err.message });
  }
};
