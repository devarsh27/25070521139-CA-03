import pickle
import re
import numpy as np

from scipy.sparse import hstack, csr_matrix


# ==========================================
# SENTIMENT VOCABULARY
# ==========================================

positive_words = {
    "amazing",
    "excellent",
    "wonderful",
    "great",
    "fantastic",
    "awesome",
    "good",
    "enjoyable",
    "enjoyed",
    "happy",
    "helpful",
    "impressive",
    "perfect",
    "perfectly",
    "memorable",
    "interesting",
    "successful",
    "professional",
    "welcoming",
    "convenient",
    "tasty",
    "fun",
    "best",
    "love",
    "liked",
    "smooth",
    "quick"
}


negative_words = {
    "bad",
    "worst",
    "terrible",
    "horrible",
    "awful",
    "poor",
    "boring",
    "disappointing",
    "disappointed",
    "unfair",
    "chaotic",
    "unpleasant",
    "confusing",
    "failed",
    "failure",
    "regretted",
    "regret",
    "slow",
    "difficult",
    "problem",
    "problems",
    "waste",
    "worse",
    "hate",
    "hated",
    "useless",
    "mess",
    "messy",
    "crowded"
}


# ==========================================
# NEGATION WORDS
# ==========================================

negation_words = {
    "not",
    "no",
    "never",
    "don't",
    "dont",
    "didn't",
    "didnt",
    "isn't",
    "isnt",
    "wasn't",
    "wasnt",
    "can't",
    "cant",
    "couldn't",
    "couldnt",
    "wouldn't",
    "wouldnt",
    "shouldn't",
    "shouldnt"
}


# ==========================================
# TEXT PREPROCESSING
# ==========================================

def preprocess_text(text):

    text = text.lower()

    words = re.findall(
        r"[a-z']+",
        text
    )

    result = []

    i = 0

    while i < len(words):

        if (
            i + 2 < len(words)
            and words[i] in {
                "did",
                "do",
                "does",
                "is",
                "was",
                "are",
                "were",
                "can",
                "could",
                "would",
                "should"
            }
            and words[i + 1] == "not"
        ):

            result.append(
                words[i] + "_not_" + words[i + 2]
            )

            i += 3

        elif (
            words[i] in negation_words
            and i + 1 < len(words)
        ):

            result.append(
                words[i] + "_" + words[i + 1]
            )

            i += 2

        else:

            result.append(words[i])

            i += 1

    return " ".join(result)


# ==========================================
# NEGATION-AWARE LEXICON
# ==========================================

def get_lexicon_features(text):

    text = text.lower()

    words = re.findall(
        r"[a-z']+",
        text
    )

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

            # NOT + POSITIVE = NEGATIVE

            if next_word in positive_words:

                negative_count += 1

                i += 2

                continue


        if word in positive_words:

            positive_count += 1

        elif word in negative_words:

            negative_count += 1


        i += 1


    sentiment_score = (
        positive_count - negative_count
    )

    return [
        positive_count,
        negative_count,
        sentiment_score
    ]


# ==========================================
# LOAD MODEL
# ==========================================

with open(
    "sentiment_model.pkl",
    "rb"
) as file:

    model = pickle.load(file)


# ==========================================
# LOAD VECTORIZER
# ==========================================

with open(
    "vectorizer.pkl",
    "rb"
) as file:

    vectorizer = pickle.load(file)


# ==========================================
# HEADER
# ==========================================

print("\n================================")
print("CAMPUS SENTIMENT ANALYZER")
print("================================")


# ==========================================
# INPUT
# ==========================================

feedback = input(
    "\nEnter student feedback: "
)


# ==========================================
# PREPROCESS
# ==========================================

processed_feedback = preprocess_text(
    feedback
)


# ==========================================
# TF-IDF
# ==========================================

feedback_tfidf = vectorizer.transform(
    [processed_feedback]
)


# ==========================================
# LEXICON
# ==========================================

feedback_lexicon = np.array([
    get_lexicon_features(feedback)
])

feedback_lexicon = csr_matrix(
    feedback_lexicon
)


# ==========================================
# COMBINE
# ==========================================

feedback_final = hstack([
    feedback_tfidf,
    feedback_lexicon
])


# ==========================================
# PREDICTION
# ==========================================

prediction = model.predict(
    feedback_final
)


# ==========================================
# PROBABILITIES
# ==========================================

probabilities = model.predict_proba(
    feedback_final
)[0]

classes = model.classes_


predicted_index = np.argmax(
    probabilities
)

confidence = (
    probabilities[predicted_index] * 100
)


# ==========================================
# OUTPUT
# ==========================================

print("\n--------------------------------")
print("ANALYSIS RESULT")
print("--------------------------------")

print("\nOriginal Feedback:")

print(feedback)


print("\nProcessed Feedback:")

print(processed_feedback)


lexicon_values = (
    feedback_lexicon.toarray()[0]
)


print("\nSentiment Word Analysis:")

print(
    "Positive words:",
    int(lexicon_values[0])
)

print(
    "Negative words:",
    int(lexicon_values[1])
)

print(
    "Sentiment score:",
    int(lexicon_values[2])
)


print("\nPredicted Sentiment:")

print(
    prediction[0]
)


print("\nConfidence:")

print(
    round(confidence, 2),
    "%"
)


print("\nSentiment Probabilities:")

for sentiment, probability in zip(
    classes,
    probabilities
):

    print(
        f"{sentiment}: "
        f"{round(probability * 100, 2)}%"
    )


print("\n================================")