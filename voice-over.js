const fs = require('fs');
const { AudioConfig, SpeechSynthesizer, SpeechConfig, ResultReason } = require('microsoft-cognitiveservices-speech-sdk');
const { Configuration, OpenAIApi } = require("openai");
const { getAudioDurationInSeconds } = require('get-audio-duration');
const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' });
dotenv.config();

// Replace with your OpenAI API key
const openaiApiKey = process.env.OPENAI_API_KEY;

// Replace with your Azure Cognitive Services subscription key and region
const subscriptionKey = process.env.AZURE_SUBSCRIPTION_KEY;
const region = process.env.AZURE_REGION;

// Path to the audio file in any language
const audioFilePath = 'original-audio-de.mp3';

// Path to save the transcript
const transcriptFilePath = './voice-over/transcript.txt';


// Set up OpenAI API client
const openaiConfig = new Configuration({
    apiKey: openaiApiKey,
});
const openai = new OpenAIApi(openaiConfig);

// Configure Azure Speech Services
const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);
speechConfig.speechSynthesisLanguage = 'en-US';

async function generateAudio(text) {
    const trsn = fs.readFileSync(text, 'utf8');
  
    // Set up the text-to-speech client
    let speechSynthesizer = new SpeechSynthesizer(speechConfig, AudioConfig.fromAudioFileOutput('./voice-over/output-audio.mp3'));
  
    // Synthesize the text into audio
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='en-US-JessaNeural'>${trsn}</voice></speak>`;
    fs.writeFileSync('./voice-over/ssml.txt', ssml);
    // speechSynthesizer.speakSsmlAsync(ssml);
  
    // console.log('Audio generated and saved to output-audio.mp3');


    speechSynthesizer.speakSsmlAsync(ssml,
        function (result) {
      if (result.reason === ResultReason.SynthesizingAudioCompleted) {
        console.log("synthesis finished.");
      } else {
        console.error("Speech synthesis canceled, " + result.errorDetails +
            "\nDid you update the subscription info?");
      }
      speechSynthesizer.close();
      speechSynthesizer = undefined;
    },
        function (err) {
      console.trace("err - " + err);
      speechSynthesizer.close();
      speechSynthesizer = undefined;
    });
    

}

async function transcribeAndSynthesize() {
  // Get the duration of the original audio file
  const audioDuration = await getAudioDurationInSeconds(audioFilePath);

  // Set up the transcription request
  const resp = await openai.createTranslation(
    fs.createReadStream(audioFilePath),
    "whisper-1"
  );

  // Send the transcription request to OpenAI API
  const text = resp.data.text;

  // Save the transcript to a text file
  fs.writeFileSync(transcriptFilePath, text);

  console.log(`Transcript saved to ${transcriptFilePath}`);

  generateAudio(transcriptFilePath);
}


transcribeAndSynthesize();
