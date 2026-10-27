import sys
import os
import json
import argparse
import pickle
import re
import numpy as np
from scipy.sparse import hstack, csr_matrix

# Get absolute path to this script's directory for loading pickles reliably
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "sentiment_model.pkl")
VECTORIZER_PATH = os.path.join(SCRIPT_DIR, "vectorizer.pkl")

# ==========================================
# SENTIMENT VOCABULARY (From trained model)
# ==========================================
positive_words = {
    "amazing", "excellent", "wonderful", "great", "fantastic", "awesome",
    "good", "enjoyable", "enjoyed", "happy", "helpful", "impressive",
    "perfect", "perfectly", "memorable", "interesting", "successful",
    "professional", "welcoming", "convenient", "tasty", "fun", "best",
    "love", "liked", "smooth", "quick"
}

negative_words = {
    "bad", "worst", "terrible", "horrible", "awful", "poor", "boring",
    "disappointing", "disappointed", "unfair", "chaotic", "unpleasant",
    "confusing", "failed", "failure", "regretted", "regret", "slow",
    "difficult", "problem", "problems", "waste", "worse", "hate",
    "hated", "useless", "mess", "messy", "crowded"
}

negation_words = {
    "not", "no", "never", "don't", "dont", "didn't", "didnt",
    "isn't", "isnt", "wasn't", "wasnt", "can't", "cant",
    "couldn't", "couldnt", "wouldn't", "wouldnt", "shouldn't", "shouldnt"
}

def preprocess_text(text: str) -> str:
    text = text.lower()
    words = re.findall(r"[a-z']+", text)
    result = []
    i = 0
    auxiliaries = {
        "did", "do", "does", "is", "was", "are", "were", "can", "could", "would", "should"
    }

    while i < len(words):
        if (i + 2 < len(words) and words[i] in auxiliaries and words[i + 1] == "not"):
            result.append(f"{words[i]}_not_{words[i + 2]}")
            i += 3
        elif words[i] in negation_words and i + 1 < len(words):
            result.append(f"{words[i]}_{words[i + 1]}")
            i += 2
        else:
            result.append(words[i])
            i += 1

    return " ".join(result)

def get_lexicon_features(text: str):
    text = text.lower()
    words = re.findall(r"[a-z']+", text)
    positive_count = 0
    negative_count = 0
    i = 0

    while i < len(words):
        word = words[i]
        # NOT + NEGATIVE = POSITIVE
        if word in negation_words and i + 1 < len(words):
            next_word = words[i + 1]
            if next_word in negative_words:
                positive_count += 1
                i += 2
                continue
            if next_word in positive_words:
                negative_count += 1
                i += 2
                continue

        if word in positive_words:
            positive_count += 1
        elif word in negative_words:
            negative_count += 1

        i += 1

    sentiment_score = positive_count - negative_count
    return [positive_count, negative_count, sentiment_score]

_model = None
_vectorizer = None

def load_models():
    global _model, _vectorizer
    if _model is None or _vectorizer is None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
            raise FileNotFoundError(f"Model or vectorizer not found in {SCRIPT_DIR}")
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        with open(VECTORIZER_PATH, "rb") as f:
            _vectorizer = pickle.load(f)
    return _model, _vectorizer

def predict_sentiment(feedback: str):
    model, vectorizer = load_models()
    processed = preprocess_text(feedback)
    tfidf = vectorizer.transform([processed])
    lex_features = np.array([get_lexicon_features(feedback)])
    lex_csr = csr_matrix(lex_features)
    final_features = hstack([tfidf, lex_csr])

    prediction = model.predict(final_features)[0]
    probabilities = model.predict_proba(final_features)[0]
    classes = list(model.classes_)

    pred_idx = np.argmax(probabilities)
    confidence = float(probabilities[pred_idx] * 100)

    prob_dict = {
        cls: round(float(prob), 4)
        for cls, prob in zip(classes, probabilities)
    }

    lexicon_vals = lex_features[0]

    return {
        "status": "success",
        "feedback": feedback,
        "processed_feedback": processed,
        "sentiment": str(prediction),
        "confidence": round(confidence, 2),
        "probabilities": prob_dict,
        "lexicon": {
            "positive_words": int(lexicon_vals[0]),
            "negative_words": int(lexicon_vals[1]),
            "sentiment_score": int(lexicon_vals[2])
        },
        "model_type": "TF-IDF + Negation-Aware Logistic Regression"
    }

def main():
    parser = argparse.ArgumentParser(description="Predict sentiment for campus feedback")
    parser.add_argument("--text", type=str, help="Feedback text to analyze")
    parser.add_argument("--stdin", action="store_true", help="Read input from stdin JSON")
    args = parser.parse_args()

    text_to_analyze = ""
    if args.text:
        text_to_analyze = args.text
    elif args.stdin or not sys.stdin.isatty():
        try:
            raw = sys.stdin.read().strip()
            if raw:
                try:
                    data = json.loads(raw)
                    text_to_analyze = data.get("text", raw)
                except Exception:
                    text_to_analyze = raw
        except Exception as e:
            print(json.dumps({"status": "error", "message": f"Stdin read error: {str(e)}"}), file=sys.stderr)
            sys.exit(1)

    if not text_to_analyze.strip():
        print(json.dumps({"status": "error", "message": "No text provided for analysis"}), file=sys.stderr)
        sys.exit(1)

    try:
        result = predict_sentiment(text_to_analyze)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
