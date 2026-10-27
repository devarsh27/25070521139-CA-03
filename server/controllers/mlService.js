import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRIPT_PATH = path.resolve(__dirname, '../ml/predict_bridge.py');

/**
 * Transparent fallback lexicon engine matching the trained vocabulary
 * Used only if the Python ML runtime is unavailable on the host machine.
 */
const POSITIVE_WORDS = new Set([
  'amazing', 'excellent', 'wonderful', 'great', 'fantastic', 'awesome',
  'good', 'enjoyable', 'enjoyed', 'happy', 'helpful', 'impressive',
  'perfect', 'perfectly', 'memorable', 'interesting', 'successful',
  'professional', 'welcoming', 'convenient', 'tasty', 'fun', 'best',
  'love', 'liked', 'smooth', 'quick'
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'worst', 'terrible', 'horrible', 'awful', 'poor', 'boring',
  'disappointing', 'disappointed', 'unfair', 'chaotic', 'unpleasant',
  'confusing', 'failed', 'failure', 'regretted', 'regret', 'slow',
  'difficult', 'problem', 'problems', 'waste', 'worse', 'hate',
  'hated', 'useless', 'mess', 'messy', 'crowded'
]);

const NEGATION_WORDS = new Set([
  'not', 'no', 'never', "don't", 'dont', "didn't", 'didnt',
  "isn't", 'isnt', "wasn't", 'wasnt', "can't", 'cant',
  "couldn't", 'couldnt', "wouldn't", 'wouldnt', "shouldn't", 'shouldnt'
]);

function analyzeFallback(text) {
  const words = (text.toLowerCase().match(/[a-z']+/g) || []);
  let positiveCount = 0;
  let negativeCount = 0;
  let i = 0;

  while (i < words.length) {
    const word = words[i];
    if (NEGATION_WORDS.has(word) && i + 1 < words.length) {
      const nextWord = words[i + 1];
      if (NEGATIVE_WORDS.has(nextWord)) {
        positiveCount++;
        i += 2;
        continue;
      }
      if (POSITIVE_WORDS.has(nextWord)) {
        negativeCount++;
        i += 2;
        continue;
      }
    }

    if (POSITIVE_WORDS.has(word)) {
      positiveCount++;
    } else if (NEGATIVE_WORDS.has(word)) {
      negativeCount++;
    }
    i++;
  }

  const score = positiveCount - negativeCount;
  let sentiment = 'Neutral';
  let confidence = 70.0;
  let probabilities = { Positive: 0.2, Neutral: 0.6, Negative: 0.2 };

  if (score > 0) {
    sentiment = 'Positive';
    confidence = Math.min(95, 75 + score * 8);
    const pPos = confidence / 100;
    probabilities = {
      Positive: parseFloat(pPos.toFixed(4)),
      Neutral: parseFloat(((1 - pPos) * 0.7).toFixed(4)),
      Negative: parseFloat(((1 - pPos) * 0.3).toFixed(4)),
    };
  } else if (score < 0) {
    sentiment = 'Negative';
    confidence = Math.min(95, 75 + Math.abs(score) * 8);
    const pNeg = confidence / 100;
    probabilities = {
      Negative: parseFloat(pNeg.toFixed(4)),
      Neutral: parseFloat(((1 - pNeg) * 0.7).toFixed(4)),
      Positive: parseFloat(((1 - pNeg) * 0.3).toFixed(4)),
    };
  }

  return {
    status: 'success',
    feedback: text,
    sentiment,
    confidence: parseFloat(confidence.toFixed(2)),
    probabilities,
    lexicon: {
      positive_words: positiveCount,
      negative_words: negativeCount,
      sentiment_score: score,
    },
    model_type: 'Negation-Aware Lexicon Rule Engine (Transparent Fallback)',
    isFallback: true,
  };
}

/**
 * Predict sentiment by executing predict_bridge.py with Python
 */
export const predictSentiment = (text) => {
  return new Promise((resolve) => {
    if (!text || !text.trim()) {
      return resolve({
        status: 'error',
        message: 'Empty text provided',
      });
    }

    const pythonPath = process.env.PYTHON_PATH || 'python';

    // Spawn python process
    const py = spawn(pythonPath, [SCRIPT_PATH, '--text', text]);

    let stdoutData = '';
    let stderrData = '';

    py.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    py.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    py.on('error', (err) => {
      console.warn(`[ML Bridge Notice] Python process could not be spawned (${err.message}). Using fallback lexicon engine.`);
      resolve(analyzeFallback(text));
    });

    py.on('close', (code) => {
      if (code !== 0) {
        console.warn(`[ML Bridge Notice] Python exited with code ${code}: ${stderrData}. Using fallback lexicon engine.`);
        return resolve(analyzeFallback(text));
      }

      try {
        const parsed = JSON.parse(stdoutData.trim());
        if (parsed.status === 'success') {
          resolve(parsed);
        } else {
          console.warn(`[ML Bridge Notice] Python returned error: ${parsed.message}. Using fallback lexicon engine.`);
          resolve(analyzeFallback(text));
        }
      } catch (parseError) {
        console.warn(`[ML Bridge Notice] Failed to parse Python stdout JSON: ${stdoutData}. Using fallback lexicon engine.`);
        resolve(analyzeFallback(text));
      }
    });
  });
};

export default { predictSentiment };
