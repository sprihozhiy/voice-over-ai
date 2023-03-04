const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' });
dotenv.config();


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

// Path to the MP4 video file
const audioFilePath = 'original-audio-de.mp3';

const openai = new OpenAIApi(configuration);

async function getTranscription() {
    const resp = await openai.createTranslation(
        fs.createReadStream(audioFilePath),
        "whisper-1"
    );

    // Get the transcript from the response
    const transcript = resp.data.text;

    // Save the transcript to a text file
    const transcriptFilePath = 'translation.txt';
    fs.writeFileSync(transcriptFilePath, transcript);

    console.log(`Transcription saved to ${transcriptFilePath}`);
}

getTranscription();
