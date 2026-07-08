# 🛡️ SpamGuard

**SpamGuard** is a client-side email spam classification web application that uses the **Naive Bayes algorithm** to identify whether a given email or message is **Spam** or **Not Spam (Ham)**.

The application performs spam classification directly in the user's browser, providing a fast, lightweight, and privacy-friendly experience without requiring a backend server.

---

## 📌 Project Overview

Spam emails are one of the most common problems in digital communication. They may contain advertisements, misleading offers, phishing messages, or unwanted content.

**SpamGuard** analyzes the text entered by the user and predicts whether the message is spam using a **Naive Bayes-based classification approach**.

Since the application works on the client side, the message text does not need to be sent to an external server for classification.

---

## ✨ Features

* 🛡️ Spam and Ham email classification
* 🧠 Naive Bayes-based prediction
* ⚡ Instant spam detection
* 🔒 Client-side processing
* 🌐 No backend server required
* 📧 Email and message text analysis
* 📊 Spam probability or confidence display
* 🎨 Clean and modern user interface
* 📱 Responsive design
* 🚀 Lightweight and fast
* 🔄 Easy message reset and reclassification
* 💻 Works directly in the browser

---

## 🧠 How It Works

SpamGuard uses the **Naive Bayes classification algorithm**, a probabilistic machine learning technique commonly used for text classification.

The application follows these main steps:

1. The user enters an email or message.
2. The text is converted to lowercase.
3. Unnecessary symbols and punctuation are removed.
4. The message is split into individual words or tokens.
5. Word frequencies and probabilities are analyzed.
6. Spam and Ham probabilities are calculated.
7. The class with the highest probability is selected.
8. The final prediction is displayed to the user.

---

## 🔬 Naive Bayes Algorithm

Naive Bayes is based on **Bayes' Theorem** and assumes that features are conditionally independent.

The classifier calculates the probability of a message belonging to a particular class.

### Spam Classification

`P(Spam | Message) ∝ P(Spam) × P(W₁ | Spam) × P(W₂ | Spam) × ... × P(Wₙ | Spam)`

### Ham Classification

`P(Ham | Message) ∝ P(Ham) × P(W₁ | Ham) × P(W₂ | Ham) × ... × P(Wₙ | Ham)`

Where:

* `P(Spam)` = Prior probability of spam messages
* `P(Ham)` = Prior probability of legitimate messages
* `P(W | Spam)` = Probability of a word appearing in spam
* `P(W | Ham)` = Probability of a word appearing in legitimate messages

The message is classified based on the class with the highest calculated probability.

---

## 🛠️ Technologies Used

* **HTML5** — Application structure
* **CSS3** — Styling and responsive design
* **JavaScript** — Application logic
* **Naive Bayes Algorithm** — Spam classification
* **Natural Language Processing Concepts** — Text preprocessing and tokenization
* **Local Browser Processing** — Client-side prediction

---

## 📂 Project Structure

```text
SpamGuard/
│
├── index.html
├── style.css
├── script.js
├── README.md
│
└── assets/
    └── images/
```

### File Description

| File         | Description                                        |
| ------------ | -------------------------------------------------- |
| `index.html` | Contains the main application structure            |
| `style.css`  | Handles UI design and responsive layout            |
| `script.js`  | Contains spam classification and Naive Bayes logic |
| `README.md`  | Project documentation                              |
| `assets/`    | Stores project images and other resources          |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Open the Project Folder

```bash
cd SpamGuard
```

### 3. Run the Application

Open the `index.html` file in your web browser.

No additional packages, dependencies, or backend server are required.

---

## 💻 Usage

1. Open the SpamGuard application.
2. Enter or paste an email message into the text area.
3. Click the **Check Spam** or **Analyze Message** button.
4. SpamGuard processes the message.
5. The prediction result is displayed as:

   * 🚨 **Spam**
   * ✅ **Not Spam / Ham**
6. Clear the message to analyze another email.

---

## 📧 Example Messages

### Spam Example

```text
Congratulations! You have won a FREE cash prize.
Click now to claim your reward.
```

**Prediction:** 🚨 Spam

### Ham Example

```text
Hello, the project meeting is scheduled for tomorrow at 10 AM.
Please bring the required documents.
```

**Prediction:** ✅ Not Spam / Ham

---

## 🔐 Privacy

SpamGuard is designed with privacy in mind.

The email or message entered by the user is processed directly inside the browser. The application does not require the message to be uploaded to a remote server for classification.

This client-side approach helps keep user-entered content private.

---

## 🎯 Applications

SpamGuard can be useful for:

* Email spam detection
* SMS spam classification
* Message filtering
* Machine learning demonstrations
* Natural Language Processing projects
* College mini projects
* Educational applications
* Client-side AI experiments

---

## 📊 Advantages

* Fast spam prediction
* Simple and lightweight architecture
* No server dependency
* Privacy-friendly processing
* Easy to understand and modify
* Suitable for beginners learning machine learning
* Can be deployed as a static website

---

## ⚠️ Limitations

* Classification accuracy depends on the training data and word probabilities.
* The classifier may not detect complex phishing techniques.
* New or unseen spam words may affect prediction accuracy.
* Naive Bayes assumes independence between words.
* The client-side model may be smaller than production-level spam detection systems.

---

## 🔮 Future Enhancements

* 📂 CSV dataset training support
* 📈 Model accuracy visualization
* 📊 Spam probability graph
* 🧹 Advanced text preprocessing
* 📝 Stop-word removal
* 🔤 Stemming and lemmatization
* 🌍 Multi-language spam detection
* 📎 Suspicious URL detection
* 🎣 Phishing email detection
* 📧 Email header analysis
* 💾 Local model storage
* 🌙 Dark and light mode
* 📱 Progressive Web App support
* 🤖 Advanced machine learning model integration

---

## 🌐 Deployment

SpamGuard can be easily deployed using static website hosting services.

For GitHub Pages:

1. Push the project to GitHub.
2. Open the repository.
3. Go to **Settings**.
4. Select **Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Select the `main` branch.
7. Select the `/root` folder.
8. Click **Save**.

The SpamGuard application will be available through the generated GitHub Pages link.

---

## 🤝 Contributing

Contributions are welcome.

You can contribute by:

* Improving the spam classification algorithm
* Adding new spam keywords or training data
* Enhancing the user interface
* Fixing bugs
* Improving documentation
* Adding new machine learning features

### Contribution Steps

```bash
git fork
git clone YOUR_FORK_URL
git checkout -b feature-name
git commit -m "Add new feature"
git push origin feature-name
```

Then create a Pull Request.

---

## 📜 License

This project is intended for educational and learning purposes.

You may modify and use the project according to your requirements.

---

## 👨‍💻 Author

**Suhas H N**

B.E. Electronics and Communication Engineering Student
Aspiring Full Stack Developer

---

## ⭐ Support

If you like this project, consider giving the repository a ⭐ on GitHub.

Your support helps motivate further improvements and new projects.

---

## 🛡️ SpamGuard

**Detect Spam. Protect Your Inbox. Stay Secure.**
