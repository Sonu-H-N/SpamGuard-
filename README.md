# 🛡️ SpamGuard — Client-Side Email Spam Classifier

> Multinomial Naive Bayes spam detection running **100% in your browser**.  
> No server. No API. No data leaves your device. Ever.

---

## 🚀 How to Run

**Just open `index.html` in any browser. That's it.**

```
Double-click index.html
```

Works offline. No install. No build step. No dependencies.

---

## 📁 Files

```
spamguard/
├── index.html       ← Full SPA — 5 views, all UI markup
├── style.css        ← Complete dark theme design system
├── classifier.js    ← Naive Bayes engine + 200+ training docs
├── app.js           ← All UI logic, gauge, particles, views
└── README.md
```

---

## ✨ Features

### 🔍 Classify View
- Paste subject, sender, and body — classifier analyses all three
- **Live classification** as you type (400ms debounce)
- **Radar sweep gauge** — animated arc fills with spam probability
- Real-time probability bars (Spam % vs Ham %)
- Colour-coded verdict cards with confidence levels
- **Signal word chips** — top words driving the decision
- Full classification breakdown (log-scores, priors, token count)
- Load spam / ham example emails
- Copy classification report to clipboard
- **Feedback buttons** — mark correct or teach the model

### 🧠 Train View
- Add any labelled email (spam or ham) to improve accuracy
- **Bulk import CSV** — `label,subject,body` format
- View all custom additions in session
- Export training set as CSV
- Reset custom data (built-in data preserved)

### 📊 Stats View
- Live vocabulary size, doc counts, session stats
- **Word clouds** for top spam and ham words
- **Confusion matrix** — TP, FP, FN, TN from your session
- Prior probability bars
- Most discriminative words with spam/ham ratios

### 📋 History View
- Every email classified this session
- Filter by spam/ham, search by text
- Click any item to reload it in the classifier
- Export full history as CSV

### 📖 How It Works View
- Full explanation of Naive Bayes with math
- Laplace smoothing formula
- Log-probability explanation
- Text preprocessing pipeline
- Privacy guarantee

---

## 🧮 The Algorithm

### Multinomial Naive Bayes

Given an email with words w₁, w₂, …, wₙ:

```
P(Spam | Email) ∝ P(Spam) × ∏ P(wᵢ | Spam)
P(Ham  | Email) ∝ P(Ham)  × ∏ P(wᵢ | Ham)
```

The class with the higher posterior probability wins.

### Laplace Smoothing (α = 1)

Prevents zero-probability for unseen words:

```
P(wᵢ | class) = (count(wᵢ, class) + 1) / (N_class + |V|)
```

### Log Probabilities

Prevents numerical underflow from multiplying tiny numbers:

```
log P(class | Email) = log P(class) + Σ log P(wᵢ | class)
```

Converted back to probabilities via softmax.

---

## 📦 Training Data

Built-in dataset covers:

| Category | Examples |
|----------|----------|
| Prize / Lottery spam | "You've won $1,000,000!" |
| Pharma spam | Cheap meds, weight loss |
| Phishing | Bank/PayPal/Apple alerts |
| Nigerian advance-fee | Transfer funds |
| Crypto / Investment | Bitcoin giveaways |
| Work-from-home MLM | Earn money fast |
| Professional Ham | Meeting notes, reports |
| Personal Ham | Friends, family |
| Transactional Ham | Order confirmations |
| System Ham | CI/CD, server alerts |

**~200 built-in emails** + unlimited custom training.

---

## 🔒 Privacy

- **Zero server communication** — classifier runs in JS
- **No tracking, no analytics, no cookies**
- Custom training data stored in `localStorage` only
- Works fully offline after first load (fonts may not load)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Classify email |
| `Ctrl + K` | Clear input |

---

## 🛠 Extending

### Add more training data
Edit `BUILTIN_TRAINING` in `classifier.js`:
```javascript
[1, "spam email text here"],   // 1 = spam
[0, "legitimate email here"],  // 0 = ham
```

### Change smoothing parameter
In `classifier.js`, find `this.alpha = 1` and adjust.

### Add new preprocessing
Edit the `tokenise()` function in `classifier.js`.

---

*SpamGuard · Pure HTML + CSS + Vanilla JS · No framework · No build tools*
