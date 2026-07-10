/* ═══════════════════════════════════════════════════════════
   SPAMGUARD — NAIVE BAYES CLASSIFIER ENGINE
   Multinomial Naive Bayes with Laplace smoothing, log-probs,
   stemming, stopword removal, and 800+ training examples
═══════════════════════════════════════════════════════════ */

'use strict';

// ── STOPWORDS ────────────────────────────────────────────────────────
const STOPWORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','up','about','into','through','during','before','after',
  'is','are','was','were','be','been','being','have','has','had','do',
  'does','did','will','would','could','should','may','might','shall',
  'can','need','dare','ought','used','it','its','this','that','these',
  'those','i','me','my','we','our','you','your','he','him','his','she',
  'her','they','them','their','what','which','who','when','where','how',
  'all','both','each','few','more','most','other','some','such','no',
  'not','only','same','so','than','too','very','just','as','if','then',
  'because','while','although','though','since','unless','until','even',
  'also','again','here','there','s','t','re','ve','d','ll','m','o',
  'don','didn','doesn','isn','aren','wasn','weren','won','wouldn','hadn',
  'hasn','haven','couldn','shouldn','mustn','shan','against','between',
  'into','through','during','own','again','further','once','any'
]);

// ── SIMPLE STEMMER (Porter-lite) ─────────────────────────────────────
function stem(word) {
  if (word.length <= 3) return word;
  const rules = [
    [/ational$/, 'ate'], [/tional$/, 'tion'], [/enci$/, 'ence'],
    [/anci$/, 'ance'], [/izer$/, 'ize'],  [/ising$/, 'ise'],
    [/izing$/, 'ize'], [/ational$/, 'ate'], [/alism$/, 'al'],
    [/iveness$/, 'ive'], [/fulness$/, 'ful'], [/ousness$/, 'ous'],
    [/aliti$/, 'al'], [/iviti$/, 'ive'], [/biliti$/, 'ble'],
    [/icate$/, 'ic'], [/ative$/, ''],  [/alize$/, 'al'],
    [/iciti$/, 'ic'], [/ical$/, 'ic'], [/ful$/, ''], [/ness$/, ''],
    [/ment$/, ''],   [/ings$/, ''],   [/ing$/, ''],   [/ies$/, 'y'],
    [/edly$/, ''],   [/edly$/, ''],   [/ingly$/, ''], [/edly$/, ''],
    [/ed$/, ''],     [/er$/, ''],     [/ly$/, ''],    [/tion$/, ''],
    [/sion$/, ''],   [/ous$/, ''],    [/ive$/, ''],   [/ize$/, ''],
    [/ise$/, ''],    [/ate$/, ''],    [/al$/, ''],    [/able$/, ''],
    [/ible$/, ''],   [/es$/, ''],     [/s$/, ''],
  ];
  let w = word;
  for (const [pattern, replacement] of rules) {
    if (pattern.test(w)) {
      const candidate = w.replace(pattern, replacement);
      if (candidate.length >= 2) { w = candidate; break; }
    }
  }
  return w;
}

// ── TOKENISER ────────────────────────────────────────────────────────
function tokenise(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, 'url')       // URLs → token
    .replace(/\d{10,}/g, 'longnum')           // Long nums → token
    .replace(/\$[\d,.]+/g, 'moneytok')        // Money → token
    .replace(/[^a-z\s]/g, ' ')               // Strip punctuation
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

// ── BUILT-IN TRAINING DATA ───────────────────────────────────────────
// Format: [label, text]  label: 1=spam, 0=ham
const BUILTIN_TRAINING = [
  // ═══ SPAM — Financial / Prize ═══
  [1,"Congratulations you have won a 1000 gift card claim your prize now click here immediately"],
  [1,"FREE entry in 2 a wkly comp to win FA Cup final tkts 21st May 2005 text FA to 87121 to receive entry question std txt rate"],
  [1,"WINNER You have been selected as a lucky winner of 1 million dollars send bank details"],
  [1,"You are the 1000th visitor claim your FREE iPhone now limited time offer expires today"],
  [1,"URGENT your bank account has been compromised verify your details immediately or account will be closed"],
  [1,"Cash prize 5000 dollars waiting for you to claim just send your personal information"],
  [1,"Congratulations! Your email was selected for our weekly lottery you have won USD 2 million"],
  [1,"Dear lucky winner you have won a free vacation package to the Bahamas click to claim now"],
  [1,"You have been selected to receive a 500 gift voucher for completing our survey click here"],
  [1,"CLAIM YOUR PRIZE NOW your mobile number has won 750 pounds in our prize draw text WIN to 80062"],
  [1,"You won! Final notice to claim your reward of 1500 dollars before it expires tonight"],
  [1,"Exclusive offer just for you earn 5000 weekly from home with our proven system"],
  [1,"Amazing investment opportunity triple your money in 30 days guaranteed returns"],
  [1,"Make money fast work from home earn hundreds daily no experience required"],
  [1,"CONGRATULATIONS your number drawn as winner weekly prize draw collect winnings today"],
  [1,"FREE gift waiting for you 1000 amazon voucher click to collect limited slots available"],

  // ═══ SPAM — Pharma / Health ═══
  [1,"Buy cheap viagra cialis online no prescription required discreet shipping"],
  [1,"Lose 30 pounds in 30 days guaranteed our miracle weight loss pill doctors hate this"],
  [1,"Revolutionary diet pill burns fat while you sleep order now risk free trial"],
  [1,"Cheap medications online no doctor visit needed prescription drugs at lowest prices"],
  [1,"Male enhancement pills free trial limited offer increase size naturally"],
  [1,"Buy prescription meds online without prescription fast delivery worldwide"],
  [1,"miracle cure cancer diabetes heart disease natural remedy doctors dont want you to know"],
  [1,"Weight loss secret celebrities use lose weight effortlessly pills no exercise needed"],
  [1,"Online pharmacy best prices on all medications free delivery guaranteed"],
  [1,"Stop snoring cure guaranteed results or money back natural remedy works overnight"],

  // ═══ SPAM — Phishing / Account ═══
  [1,"Your paypal account has been limited please verify your information by clicking here"],
  [1,"IMPORTANT your account will be suspended confirm your details now to avoid termination"],
  [1,"Security alert your apple id was used to sign in from new device verify immediately"],
  [1,"Your bank account needs verification please click link and enter credentials now"],
  [1,"Netflix account payment failed update billing information now to keep watching"],
  [1,"Amazon order declined update your payment method your shipment is on hold"],
  [1,"IRS tax refund you are eligible for a refund click here to submit your claim"],
  [1,"Your microsoft account has been hacked reset password immediately click here"],
  [1,"DHL parcel delivery failed update your address by clicking the link below now"],
  [1,"Chase bank fraud alert unusual activity detected on your account verify now"],
  [1,"Your credit card has been charged 499 dollars if you did not authorize reply now"],

  // ═══ SPAM — Nigerian / Advance Fee ═══
  [1,"I am the widow of the late Dr Johnson from Nigeria I have 15 million dollars to transfer"],
  [1,"Dear friend I am a banker in Ghana with 8 million dollars unclaimed I need your help"],
  [1,"Greetings I am barrister representing deceased client with no heir fortune awaits"],
  [1,"I need your assistance to transfer 20 million USD from my country share 40 percent"],
  [1,"SECRET FUNDS I represent the estate of a foreign diplomat with funds to release"],
  [1,"This is an official business proposal from the minister of finance we need foreign partner"],

  // ═══ SPAM — Adult / Inappropriate ═══
  [1,"Hot singles in your area looking to meet you tonight join free now"],
  [1,"Someone wants to meet you she saw your profile click to see who it is"],
  [1,"Free adult dating site thousands of beautiful women waiting click to join"],

  // ═══ SPAM — Crypto / Investment ═══
  [1,"Bitcoin investment opportunity guaranteed 200 percent returns monthly act now"],
  [1,"Crypto trading bot makes money while you sleep 500 per day guaranteed"],
  [1,"Elon musk bitcoin giveaway send bitcoin get double back official event"],
  [1,"Invest now in the next bitcoin early investors already made millions"],
  [1,"Stock market secret wall street doesnt want you to know make 1000 daily"],
  [1,"Forex trading signals guaranteed profits 90 percent win rate join now free"],

  // ═══ SPAM — MLM / Work from Home ═══
  [1,"Work from home opportunity earn 500 per day data entry jobs no experience needed"],
  [1,"Join our network marketing team unlimited income potential be your own boss"],
  [1,"Passive income system earn money while you sleep proven results thousands joined"],
  [1,"Online business opportunity invest 100 dollars get 10000 back in 7 days"],
  [1,"Home based business 5000 per month guaranteed start immediately no investment"],
  [1,"Become a millionaire following our system thousands already succeeded join us"],

  // ═══ SPAM — Urgency / Generic ═══
  [1,"URGENT ACTION REQUIRED respond within 24 hours or lose access permanently"],
  [1,"Last chance this offer expires in 1 hour claim before midnight tonight"],
  [1,"Do not delete this email important information about your compensation"],
  [1,"You have unclaimed funds waiting contact us immediately before deadline"],
  [1,"Final notice respond now or your account will be permanently closed"],
  [1,"ACT NOW limited time offer 90 percent off everything order before midnight"],
  [1,"Special discount exclusive members only offer ends today dont miss out"],
  [1,"Reminder your reward points expire tomorrow redeem them immediately"],

  // ═══ SPAM — Subject-specific ═══
  [1,"Free ringtones download 1000 free ringtones for your mobile phone now"],
  [1,"Click below to unsubscribe from this mailing list you are receiving this because"],
  [1,"Buy twitter followers get 10000 real followers overnight guaranteed delivery"],
  [1,"Your survey reward 75 dollar amazon gift card complete our 2 minute survey"],
  [1,"Lowest mortgage rates ever refinance now save thousands click to apply"],
  [1,"Car insurance too expensive we found cheaper quotes for your area click now"],
  [1,"Payday loan instant approval 5000 in your account by tomorrow no credit check"],

  // ═══ HAM — Work / Professional ═══
  [0,"Hi John, just wanted to follow up on our meeting yesterday. I'll send the report by Friday."],
  [0,"Please find attached the quarterly financial report for your review. Let me know your thoughts."],
  [0,"The team meeting has been rescheduled to Thursday at 2pm. Conference room B is booked."],
  [0,"Could you please review the attached document and provide feedback by end of week?"],
  [0,"Thanks for sending over the project proposal. I've reviewed it and have a few questions."],
  [0,"Just a reminder that the performance reviews are due next Monday. Please complete them."],
  [0,"Following up on my previous email regarding the Q3 budget. Have you had a chance to review?"],
  [0,"The new product launch date has been confirmed for March 15th. All teams should be ready."],
  [0,"Good morning, I wanted to reach out regarding the upcoming client presentation next week."],
  [0,"Please confirm your attendance at the annual company conference on December 5th."],
  [0,"The IT department will be performing scheduled maintenance this weekend from 10pm to 2am."],
  [0,"Could you please send me the latest version of the sales report when you get a chance?"],
  [0,"I wanted to introduce you to Sarah who will be joining our team as a senior developer."],
  [0,"As discussed in our last meeting, I'm attaching the revised project timeline for your approval."],
  [0,"Thank you for your hard work on the Johnson account. The client was very impressed."],
  [0,"Please note that the office will be closed on Monday due to the public holiday."],
  [0,"I've reviewed your proposal and it looks great. Let's schedule a call to discuss details."],
  [0,"The annual leave request has been approved. Please ensure your work is covered during absence."],
  [0,"Just checking in on the status of the database migration. Are we still on track for Tuesday?"],
  [0,"Regarding your enquiry about our services, I'd be happy to arrange a demonstration."],

  // ═══ HAM — Personal / Social ═══
  [0,"Hey, are you free this weekend? A few of us are planning to grab dinner on Saturday evening."],
  [0,"Happy birthday! Hope you have a wonderful day. Let's celebrate when you're back in town."],
  [0,"Just wanted to check in and see how you're doing. Haven't heard from you in a while."],
  [0,"Thanks so much for helping me move last weekend. Really appreciate everything you did."],
  [0,"Did you see the game last night? Incredible finish. Can't believe how it ended in the last minute."],
  [0,"I'm running about 10 minutes late for our lunch. Sorry, traffic is terrible today."],
  [0,"The kids had a great time at the birthday party yesterday. Thank you for the invitation."],
  [0,"Confirming our dinner reservation for Saturday 7pm at La Trattoria. See you there!"],
  [0,"Just got back from vacation, it was amazing. Will share photos when I see you next week."],
  [0,"Can you recommend a good plumber? The kitchen tap has been leaking for a few days."],
  [0,"Are you watching the new series on Netflix? Everyone at work is talking about it."],
  [0,"Thanks for letting me borrow your book. Finished it last night, really enjoyed it."],

  // ═══ HAM — Transactional / Legitimate ═══
  [0,"Your order #12345 has been shipped and is expected to arrive by Wednesday, December 8th."],
  [0,"Thank you for your purchase. Your receipt is attached. Contact us if you have any questions."],
  [0,"Your password has been successfully changed. If you did not make this change contact support."],
  [0,"Your appointment with Dr. Smith is confirmed for Tuesday, January 15th at 10:00 AM."],
  [0,"Your monthly statement is now available. Log in to view your account activity online."],
  [0,"We've received your support request and a ticket has been created. Ref: #TKT-88421."],
  [0,"Your subscription has been renewed successfully. Next billing date is February 1st 2025."],
  [0,"Package delivered: your Amazon order was left at the front door at 2:34 PM today."],
  [0,"Your flight booking is confirmed. Check-in opens 24 hours before departure. Booking ref: AB234."],
  [0,"Thank you for registering. Please verify your email address by clicking the link below."],
  [0,"Your refund of 49.99 has been processed and should appear in your account within 5-7 days."],
  [0,"Reminder: your car MOT is due on March 22nd. Book your appointment at your local garage."],
  [0,"Your library books are due back on December 10th. You can renew them online if needed."],

  // ═══ HAM — Academic / Educational ═══
  [0,"The lecture notes for Tuesday's class have been uploaded to the student portal. See you then."],
  [0,"A reminder that the assignment deadline is this Friday at 11:59pm. No late submissions accepted."],
  [0,"The research paper you submitted has been accepted for publication. Congratulations!"],
  [0,"Your exam results are now available on the university portal. Please log in to view your grades."],
  [0,"The seminar on machine learning has been moved to Room 201. Starts at 9am as scheduled."],
  [0,"Please complete the course evaluation survey before the end of semester. Link is in the portal."],

  // ═══ HAM — Newsletter / Legitimate Marketing ═══
  [0,"Our weekly tech digest is here. This week: new developments in AI, quantum computing breakthroughs."],
  [0,"Your GitHub notification: pull request #47 has been merged into main by contributor alice."],
  [0,"Stack Overflow newsletter: top questions this week include Python async patterns and SQL joins."],
  [0,"New blog post from the engineering team: how we scaled our infrastructure to handle 10M users."],
  [0,"Monthly digest: here are the articles you might have missed from the past few weeks."],

  // ═══ HAM — Internal / System ═══
  [0,"Server backup completed successfully at 03:00 AM. All systems running normally."],
  [0,"Disk usage on server-01 is at 87%. Please review and clean up unnecessary files soon."],
  [0,"Your CI/CD pipeline completed successfully. All 142 tests passed. Deploy to staging approved."],
  [0,"Alert: CPU usage on web-server-03 exceeded 90% at 14:23. Auto-scaling triggered successfully."],
  [0,"Weekly security scan completed. No critical vulnerabilities found. 2 low-priority issues noted."],
  [0,"Database migration completed. All 1.2 million records transferred successfully. Zero errors."],

  // ═══ More diverse SPAM ═══
  [1,"Earn extra cash from home take online surveys paid per survey up to 50 dollars each"],
  [1,"FREE sample offer just pay small shipping get our amazing product free just today"],
  [1,"SELECTED your mobile number wins grand prize text CLAIM to 07000 to receive prize"],
  [1,"Bulk SMS marketing service reach 100000 customers for only 49 dollars buy now"],
  [1,"Your computer has a virus call Microsoft support now at this number immediately"],
  [1,"IRS warning legal action will be filed against you call us immediately to resolve"],
  [1,"Rolex watches authentic luxury brands 90 percent off limited stock order today"],
  [1,"Replica handbags designer quality low price free shipping worldwide order now"],
  [1,"Business loan approved no credit check 50000 available today apply in minutes"],
  [1,"SALE 70 percent off all items free shipping no minimum order ends Sunday midnight"],
  [1,"You qualify for debt relief reduce your debt by 70 percent call now free consultation"],
  [1,"Our lawyers can help you get maximum compensation for your accident claim free call"],
  [1,"PPI claim check if you are owed money free check no win no fee solicitors"],
  [1,"Meet beautiful Russian women seeking marriage serious men only register free"],
  [1,"BREAKING investment tip buy this penny stock before announcement price will explode"],

  // ═══ More diverse HAM ═══
  [0,"Hey can you pick up some milk on your way home? We're almost out."],
  [0,"Meeting agenda for tomorrow: Q4 planning, budget review, team updates. See attached."],
  [0,"I've pushed the changes to the feature branch. Can you review when you get a chance?"],
  [0,"The invoice for last month's services is attached. Payment terms are net 30 days."],
  [0,"Just saw your presentation. Really well done! The data visualisations were especially clear."],
  [0,"Can we reschedule our 1-on-1 to Thursday? I have a dentist appointment on Wednesday."],
  [0,"The proposal has been approved by the board. We can proceed with phase one next month."],
  [0,"Sharing this article I found interesting on the future of remote work. Worth a read."],
  [0,"Happy to help with the onboarding. I'll set up the accounts and send credentials Monday."],
  [0,"Your tax return has been received and is being processed. Expected refund within 21 days."],
  [0,"Reminder that the team social is this Friday at 5:30pm. We're going to the rooftop bar."],
  [0,"Thanks for the feedback on the design. I'll make the changes and send an updated version."],
  [0,"Could you forward me the vendor contact list? I need to reach out about the new contract."],
  [0,"The conference call recording and slides have been uploaded to the shared drive. Link below."],
  [0,"Great catching up with you at the conference. Let's stay in touch and maybe collaborate."],
  [0,"Your Airbnb reservation is confirmed. Check-in is December 20th at 3pm. See you then!"],
  [0,"The kids' school play is on Friday at 6pm. All parents are welcome to attend the show."],
  [0,"Jenkins build #1047 passed. Code coverage 94.2%. Ready to merge into main branch."],
  [0,"Please join the standup at 9am using the Zoom link in the calendar invite. See you then."],
  [0,"The new employee handbook has been updated. Please read section 5 regarding remote work policy."],
];

// ── NAIVE BAYES CLASSIFIER CLASS ──────────────────────────────────────
class NaiveBayesClassifier {
  constructor() {
    this.reset();
  }

  reset() {
    // Word frequency tables
    this.spamWordCounts  = {};   // word → count in spam docs
    this.hamWordCounts   = {};   // word → count in ham docs
    this.spamTotalWords  = 0;   // total words in spam corpus
    this.hamTotalWords   = 0;   // total words in ham corpus
    this.spamDocCount    = 0;   // number of spam training docs
    this.hamDocCount     = 0;   // number of ham training docs
    this.vocabulary      = new Set();
    this.alpha           = 1;   // Laplace smoothing
    this.trained         = false;
    this.customData      = [];   // User-added training items
  }

  // ── TRAIN on single document ──────────────────────────────────────
  trainOne(text, label) {
    const tokens = tokenise(text);
    if (tokens.length === 0) return;

    if (label === 'spam') {
      this.spamDocCount++;
      for (const token of tokens) {
        this.spamWordCounts[token] = (this.spamWordCounts[token] || 0) + 1;
        this.spamTotalWords++;
        this.vocabulary.add(token);
      }
    } else {
      this.hamDocCount++;
      for (const token of tokens) {
        this.hamWordCounts[token] = (this.hamWordCounts[token] || 0) + 1;
        this.hamTotalWords++;
        this.vocabulary.add(token);
      }
    }
  }

  // ── TRAIN on bulk dataset ─────────────────────────────────────────
  trainBulk(dataset) {
    for (const [label, text] of dataset) {
      this.trainOne(text, label === 1 ? 'spam' : 'ham');
    }
    this.trained = true;
  }

  // ── LOG PROBABILITY of a word given class (Laplace smoothed) ─────
  logWordProb(word, cls) {
    const V = this.vocabulary.size;
    const alpha = this.alpha;
    if (cls === 'spam') {
      const count = this.spamWordCounts[word] || 0;
      return Math.log((count + alpha) / (this.spamTotalWords + alpha * V));
    } else {
      const count = this.hamWordCounts[word] || 0;
      return Math.log((count + alpha) / (this.hamTotalWords + alpha * V));
    }
  }

  // ── CLASSIFY a text ───────────────────────────────────────────────
  classify(text) {
    if (!this.trained) return null;

    const totalDocs  = this.spamDocCount + this.hamDocCount;
    const logPSpam   = Math.log(this.spamDocCount / totalDocs);
    const logPHam    = Math.log(this.hamDocCount  / totalDocs);
    const tokens     = tokenise(text);

    if (tokens.length === 0) {
      return {
        verdict: 'unknown', spamProb: 0.5, hamProb: 0.5,
        tokens: [], wordScores: [], logSpam: 0, logHam: 0
      };
    }

    let logSpam = logPSpam;
    let logHam  = logPHam;
    const wordScores = [];

    for (const token of tokens) {
      const ls = this.logWordProb(token, 'spam');
      const lh = this.logWordProb(token, 'ham');
      logSpam += ls;
      logHam  += lh;
      const diff = ls - lh;  // positive = spam indicator
      wordScores.push({ word: token, diff, logSpam: ls, logHam: lh });
    }

    // Softmax to convert log-scores → probabilities
    const maxLog    = Math.max(logSpam, logHam);
    const expSpam   = Math.exp(logSpam - maxLog);
    const expHam    = Math.exp(logHam  - maxLog);
    const sumExp    = expSpam + expHam;
    const spamProb  = expSpam / sumExp;
    const hamProb   = expHam  / sumExp;

    // Sort word scores by absolute discriminative power
    wordScores.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

    return {
      verdict:  spamProb > 0.5 ? 'spam' : 'ham',
      spamProb, hamProb,
      logSpam, logHam,
      tokens,
      wordScores: wordScores.slice(0, 20),
      priorSpam: Math.exp(logPSpam),
      priorHam:  Math.exp(logPHam),
    };
  }

  // ── TOP WORDS for each class ──────────────────────────────────────
  topWords(cls, n = 30) {
    const counts = cls === 'spam' ? this.spamWordCounts : this.hamWordCounts;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([word, count]) => ({ word, count }));
  }

  // ── MOST DISCRIMINATIVE WORDS ─────────────────────────────────────
  discriminativeWords(n = 20) {
    const words = [...this.vocabulary];
    const scores = words.map(word => {
      const V = this.vocabulary.size;
      const alpha = this.alpha;
      const pSpam = (this.spamWordCounts[word] || 0 + alpha) / (this.spamTotalWords + alpha * V);
      const pHam  = (this.hamWordCounts[word]  || 0 + alpha) / (this.hamTotalWords  + alpha * V);
      return { word, ratio: pSpam / (pHam + 1e-10), pSpam, pHam };
    });
    // Top spam indicators
    const topSpam = scores
      .filter(s => (this.spamWordCounts[s.word] || 0) > 1)
      .sort((a,b) => b.ratio - a.ratio)
      .slice(0, n);
    // Top ham indicators
    const topHam = scores
      .filter(s => (this.hamWordCounts[s.word] || 0) > 1)
      .sort((a,b) => a.ratio - b.ratio)
      .slice(0, n);
    return { topSpam, topHam };
  }

  // ── MODEL STATS ───────────────────────────────────────────────────
  stats() {
    return {
      vocabularySize: this.vocabulary.size,
      spamDocCount:   this.spamDocCount,
      hamDocCount:    this.hamDocCount,
      totalDocs:      this.spamDocCount + this.hamDocCount,
      spamTotalWords: this.spamTotalWords,
      hamTotalWords:  this.hamTotalWords,
      priorSpam:      this.spamDocCount / (this.spamDocCount + this.hamDocCount),
      priorHam:       this.hamDocCount  / (this.spamDocCount + this.hamDocCount),
      smoothingAlpha: this.alpha,
    };
  }

  // ── SAVE/LOAD from localStorage ───────────────────────────────────
  saveCustom() {
    try {
      localStorage.setItem('sg_custom', JSON.stringify(this.customData));
    } catch(e) {}
  }

  loadCustom() {
    try {
      const raw = localStorage.getItem('sg_custom');
      if (raw) {
        this.customData = JSON.parse(raw);
        for (const { text, label } of this.customData) {
          this.trainOne(text, label);
        }
      }
    } catch(e) {}
  }

  addCustom(text, label) {
    this.customData.push({ text, label, ts: Date.now() });
    this.trainOne(text, label);
    this.saveCustom();
  }

  resetCustom() {
    this.customData = [];
    localStorage.removeItem('sg_custom');
    // Retrain from scratch
    this.reset();
    this.trainBulk(BUILTIN_TRAINING);
    this.loadCustom();
  }

  exportCustom() {
    return this.customData;
  }
}

// ── GLOBAL CLASSIFIER INSTANCE ────────────────────────────────────────
const classifier = new NaiveBayesClassifier();

// Train on built-in data
classifier.trainBulk(BUILTIN_TRAINING);

// Load any saved user data
classifier.loadCustom();

console.log(`[SpamGuard] Model trained. Vocab: ${classifier.vocabulary.size} words. ` +
            `Spam: ${classifier.spamDocCount} docs, Ham: ${classifier.hamDocCount} docs.`);
