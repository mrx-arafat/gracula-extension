// Bangla Language Knowledge
// Romanized Bangla vocabulary, slang, and common phrases

window.Gracula = window.Gracula || {};
window.Gracula.Knowledge = window.Gracula.Knowledge || {};
window.Gracula.Knowledge.Languages = window.Gracula.Knowledge.Languages || {};

window.Gracula.Knowledge.Languages.Bangla = {
  // Common Verbs (Expanded with all conjugations)
  verbs: {
    // KOR (do/make) - all forms
    'kortechen': { meaning: 'doing (formal)', type: 'present continuous', formality: 'formal' },
    'korchen': { meaning: 'doing (formal)', type: 'present continuous', formality: 'formal' },
    'korbo': { meaning: 'will do', type: 'future', formality: 'neutral' },
    'korchi': { meaning: 'doing/did', type: 'present/past', formality: 'neutral' },
    'kore': { meaning: 'do/does/did', type: 'present/past', formality: 'neutral' },
    'korle': { meaning: 'if do', type: 'conditional', formality: 'neutral' },
    'korish': { meaning: 'you do (informal)', type: 'present', formality: 'informal' },
    'kortesi': { meaning: 'doing (informal)', type: 'present continuous', formality: 'informal' },
    'kortese': { meaning: 'doing', type: 'present continuous', formality: 'neutral' },
    'korbi': { meaning: 'you will do (informal)', type: 'future', formality: 'informal' },
    'koro': { meaning: 'do (command)', type: 'imperative', formality: 'neutral' },
    'koris': { meaning: 'do (informal command)', type: 'imperative', formality: 'informal' },
    'korechi': { meaning: 'have done', type: 'present perfect', formality: 'neutral' },
    'korechis': { meaning: 'you have done (informal)', type: 'present perfect', formality: 'informal' },
    'korchis': { meaning: 'you are doing (informal)', type: 'present continuous', formality: 'informal' },

    // PREM KOR (love/romance)
    'prem': { meaning: 'love/romance', type: 'noun', formality: 'neutral' },
    'prem korish': { meaning: 'you are in love (informal)', type: 'phrase', formality: 'informal' },
    'prem kortesi': { meaning: 'I am in love (informal)', type: 'phrase', formality: 'informal' },
    'prem kori': { meaning: 'I love', type: 'phrase', formality: 'neutral' },

    // HOWA (be/become)
    'ache': { meaning: 'is/are/have', type: 'present', formality: 'neutral' },
    'achhi': { meaning: 'am/have', type: 'present', formality: 'neutral' },
    'achi': { meaning: 'am/have', type: 'present', formality: 'neutral' },
    'achis': { meaning: 'you are (informal)', type: 'present', formality: 'informal' },
    'aso': { meaning: 'come (command)', type: 'imperative', formality: 'neutral' },
    'chilo': { meaning: 'was/were', type: 'past', formality: 'neutral' },
    'hobe': { meaning: 'will be', type: 'future', formality: 'neutral' },
    'hobey': { meaning: 'will be', type: 'future', formality: 'neutral' },
    'hobena': { meaning: 'will not be', type: 'future negative', formality: 'neutral' },
    'hoye': { meaning: 'become/being', type: 'present participle', formality: 'neutral' },
    'hoyeche': { meaning: 'has become', type: 'present perfect', formality: 'neutral' },

    // PARA (can/able)
    'parbo': { meaning: 'can/will be able to', type: 'future', formality: 'neutral' },
    'parchi': { meaning: 'can/able to', type: 'present', formality: 'neutral' },
    'pari': { meaning: 'can/able to', type: 'present', formality: 'neutral' },
    'parbi': { meaning: 'you can (informal)', type: 'present', formality: 'informal' },
    'paris': { meaning: 'you can (informal)', type: 'present', formality: 'informal' },

    // JAOA (go)
    'jabo': { meaning: 'will go', type: 'future', formality: 'neutral' },
    'jachhi': { meaning: 'going', type: 'present continuous', formality: 'neutral' },
    'jachis': { meaning: 'you are going (informal)', type: 'present continuous', formality: 'informal' },
    'jai': { meaning: 'go', type: 'present', formality: 'neutral' },
    'jao': { meaning: 'go (command)', type: 'imperative', formality: 'neutral' },
    'ja': { meaning: 'go (informal command)', type: 'imperative', formality: 'informal' },
    'gelo': { meaning: 'went', type: 'past', formality: 'neutral' },
    'gesi': { meaning: 'went (informal)', type: 'past', formality: 'informal' },

    // ASAA (come)
    'asbo': { meaning: 'will come', type: 'future', formality: 'neutral' },
    'asche': { meaning: 'coming', type: 'present continuous', formality: 'neutral' },
    'aschi': { meaning: 'coming', type: 'present continuous', formality: 'neutral' },
    'aschis': { meaning: 'you are coming (informal)', type: 'present continuous', formality: 'informal' },
    'asi': { meaning: 'come', type: 'present', formality: 'neutral' },
    'elo': { meaning: 'came', type: 'past', formality: 'neutral' },
    'elam': { meaning: 'I came', type: 'past', formality: 'neutral' },

    // KHAWA (eat)
    'khabo': { meaning: 'will eat', type: 'future', formality: 'neutral' },
    'khachchhi': { meaning: 'eating', type: 'present continuous', formality: 'neutral' },
    'kheyechi': { meaning: 'have eaten', type: 'present perfect', formality: 'neutral' },
    'khai': { meaning: 'eat', type: 'present', formality: 'neutral' },
    'khao': { meaning: 'eat (command)', type: 'imperative', formality: 'neutral' },

    // DEKHA (see)
    'dekhbo': { meaning: 'will see', type: 'future', formality: 'neutral' },
    'dekhchi': { meaning: 'seeing', type: 'present continuous', formality: 'neutral' },
    'dekhechi': { meaning: 'have seen', type: 'present perfect', formality: 'neutral' },
    'dekhi': { meaning: 'see', type: 'present', formality: 'neutral' },
    'dekho': { meaning: 'see (command)', type: 'imperative', formality: 'neutral' },

    // BOLA (say/speak)
    'bolbo': { meaning: 'will say', type: 'future', formality: 'neutral' },
    'bolchi': { meaning: 'saying', type: 'present continuous', formality: 'neutral' },
    'bolechi': { meaning: 'have said', type: 'present perfect', formality: 'neutral' },
    'boli': { meaning: 'say', type: 'present', formality: 'neutral' },
    'bolo': { meaning: 'say (command)', type: 'imperative', formality: 'neutral' },

    // RAKHA (keep/put)
    'rakhsi': { meaning: 'kept/keeping', type: 'present perfect', formality: 'neutral' },
    'rakhtese': { meaning: 'has kept', type: 'present perfect', formality: 'neutral' },
    'raiken': { meaning: 'keep/maintain', type: 'imperative/present', formality: 'neutral' },
    'rakhbo': { meaning: 'will keep', type: 'future', formality: 'neutral' },
    'rakho': { meaning: 'keep (command)', type: 'imperative', formality: 'neutral' },

    // NEOA (take)
    'nisi': { meaning: 'took/taken', type: 'present perfect', formality: 'neutral' },
    'nibo': { meaning: 'will take', type: 'future', formality: 'neutral' },
    'neo': { meaning: 'take (command)', type: 'imperative', formality: 'neutral' },
    'ni': { meaning: 'take', type: 'present', formality: 'neutral' },

    // DEOA (give)
    'disi': { meaning: 'gave/given', type: 'present perfect', formality: 'neutral' },
    'dibo': { meaning: 'will give', type: 'future', formality: 'neutral' },
    'dao': { meaning: 'give (command)', type: 'imperative', formality: 'neutral' },
    'di': { meaning: 'give', type: 'present', formality: 'neutral' }
  },

  // Pronouns (Expanded with informal variations)
  pronouns: {
    'ami': { meaning: 'I', type: 'first person singular', formality: 'neutral' },
    'tumi': { meaning: 'you', type: 'second person singular', formality: 'informal' },
    'tui': { meaning: 'you (very informal)', type: 'second person singular', formality: 'very_informal' },
    'apni': { meaning: 'you', type: 'second person singular', formality: 'formal' },
    'apnara': { meaning: 'you all', type: 'second person plural', formality: 'formal' },
    'tomra': { meaning: 'you all', type: 'second person plural', formality: 'informal' },
    'tora': { meaning: 'you all (very informal)', type: 'second person plural', formality: 'very_informal' },
    'se': { meaning: 'he/she', type: 'third person singular', formality: 'neutral' },
    'tara': { meaning: 'they', type: 'third person plural', formality: 'neutral' },
    'amra': { meaning: 'we', type: 'first person plural', formality: 'neutral' },
    'amar': { meaning: 'my/mine', type: 'possessive', formality: 'neutral' },
    'tomar': { meaning: 'your/yours', type: 'possessive', formality: 'informal' },
    'tor': { meaning: 'your/yours (very informal)', type: 'possessive', formality: 'very_informal' },
    'apnar': { meaning: 'your/yours', type: 'possessive', formality: 'formal' },
    'tar': { meaning: 'his/her/its', type: 'possessive', formality: 'neutral' },
    'amader': { meaning: 'our/ours', type: 'possessive', formality: 'neutral' }
  },

  // Question Words (Expanded)
  questionWords: {
    'ki': { meaning: 'what/is it', type: 'question word', usage: 'general question' },
    'koi': { meaning: 'where (informal)', type: 'question word', usage: 'location' },
    'koi tui': { meaning: 'where are you (very informal)', type: 'question phrase', usage: 'location' },
    'kothay': { meaning: 'where', type: 'question word', usage: 'location' },
    'kothay achis': { meaning: 'where are you (informal)', type: 'question phrase', usage: 'location' },
    'keno': { meaning: 'why', type: 'question word', usage: 'reason' },
    'kemon': { meaning: 'how/how is', type: 'question word', usage: 'state/condition' },
    'kobe': { meaning: 'when', type: 'question word', usage: 'time' },
    'ke': { meaning: 'who', type: 'question word', usage: 'person' },
    'kara': { meaning: 'who (plural)', type: 'question word', usage: 'people' },
    'koto': { meaning: 'how much/many', type: 'question word', usage: 'quantity' },
    'kon': { meaning: 'which', type: 'question word', usage: 'choice' }
  },

  // Common Adjectives
  adjectives: {
    'valo': { meaning: 'good', type: 'positive' },
    'bhalo': { meaning: 'good', type: 'positive' },
    'kharap': { meaning: 'bad', type: 'negative' },
    'sundor': { meaning: 'beautiful', type: 'positive' },
    'shundor': { meaning: 'beautiful', type: 'positive' },
    'boro': { meaning: 'big', type: 'size' },
    'choto': { meaning: 'small', type: 'size' },
    'noya': { meaning: 'new', type: 'state' },
    'notun': { meaning: 'new', type: 'state' },
    'purano': { meaning: 'old', type: 'state' },
    'shohoj': { meaning: 'easy', type: 'difficulty' },
    'kothin': { meaning: 'difficult/hard', type: 'difficulty' }
  },

  // Slang & Informal (Massively Expanded)
  slang: {
    // Vulgar/Very Informal (indicates VERY close friendship)
    'khanki': { meaning: 'friend/buddy (vulgar slang)', sentiment: 'neutral', usage: 'close_friend_address', intimacy: 'very_high' },
    'hala': { meaning: 'dude/bro (vulgar)', sentiment: 'neutral', usage: 'close_friend_address', intimacy: 'very_high' },
    'magir': { meaning: 'friend (vulgar)', sentiment: 'neutral', usage: 'close_friend_address', intimacy: 'very_high' },
    'sala': { meaning: 'dude (vulgar)', sentiment: 'neutral', usage: 'close_friend_address', intimacy: 'very_high' },
    'baal': { meaning: 'nonsense (vulgar)', sentiment: 'negative', usage: 'dismissal', intimacy: 'high' },
    'bokachoda': { meaning: 'idiot/friend (vulgar)', sentiment: 'neutral', usage: 'close_friend_address', intimacy: 'very_high' },
    'choda': { meaning: 'fucker (vulgar)', sentiment: 'neutral', usage: 'close_friend_address', intimacy: 'very_high' },
    'put': { meaning: 'son (vulgar)', sentiment: 'neutral', usage: 'close_friend_address', intimacy: 'very_high' },
    // Common Slang
    'kop': { meaning: 'cool/awesome/great', sentiment: 'positive', usage: 'approval', intimacy: 'medium' },
    'darun': { meaning: 'awesome/great', sentiment: 'positive', usage: 'appreciation', intimacy: 'low' },
    'moja': { meaning: 'fun/enjoyable', sentiment: 'positive', usage: 'enjoyment', intimacy: 'medium' },
    'maja': { meaning: 'fun/enjoyable', sentiment: 'positive', usage: 'enjoyment', intimacy: 'medium' },
    'thik': { meaning: 'okay/right/correct', sentiment: 'neutral', usage: 'agreement', intimacy: 'low' },
    'thik ache': { meaning: 'okay/alright', sentiment: 'neutral', usage: 'acceptance', intimacy: 'low' },
    'thik achhe': { meaning: 'okay/alright', sentiment: 'neutral', usage: 'acceptance', intimacy: 'low' },

    // Negation & Disagreement
    'na': { meaning: 'no', sentiment: 'negative', usage: 'disagreement', intimacy: 'low' },
    'nah': { meaning: 'no/nope', sentiment: 'negative', usage: 'disagreement', intimacy: 'medium' },
    'nai': { meaning: 'no/don\'t have', sentiment: 'negative', usage: 'absence', intimacy: 'low' },
    'nei': { meaning: 'no/don\'t have', sentiment: 'negative', usage: 'absence', intimacy: 'low' },

    // Agreement
    'hae': { meaning: 'yes', sentiment: 'positive', usage: 'agreement', intimacy: 'low' },
    'han': { meaning: 'yes', sentiment: 'positive', usage: 'agreement', intimacy: 'low' },
    'hmm': { meaning: 'thinking/considering', sentiment: 'neutral', usage: 'contemplation', intimacy: 'low' },

    // Emotions
    'uff': { meaning: 'frustration/exhaustion', sentiment: 'negative', usage: 'emotion', intimacy: 'medium' },
    'arre': { meaning: 'hey/oh', sentiment: 'neutral', usage: 'attention', intimacy: 'medium' },
    'acha': { meaning: 'okay/I see', sentiment: 'neutral', usage: 'acknowledgment', intimacy: 'low' },
    'accha': { meaning: 'okay/I see', sentiment: 'neutral', usage: 'acknowledgment', intimacy: 'low' },
    'bah': { meaning: 'wow/great', sentiment: 'positive', usage: 'appreciation', intimacy: 'low' },
    'oho': { meaning: 'oh I see', sentiment: 'neutral', usage: 'realization', intimacy: 'low' },

    // Connectors
    'tahole': { meaning: 'then/so', sentiment: 'neutral', usage: 'conclusion', intimacy: 'low' },
    'kintu': { meaning: 'but', sentiment: 'neutral', usage: 'contrast', intimacy: 'low' },
    'ar': { meaning: 'and/more', sentiment: 'neutral', usage: 'addition', intimacy: 'low' },
    'o': { meaning: 'and/also', sentiment: 'neutral', usage: 'addition', intimacy: 'low' },
    'ba': { meaning: 'or', sentiment: 'neutral', usage: 'alternative', intimacy: 'low' },
    'jodi': { meaning: 'if', sentiment: 'neutral', usage: 'condition', intimacy: 'low' },
    'tobe': { meaning: 'then', sentiment: 'neutral', usage: 'consequence', intimacy: 'low' },
    'tobuo': { meaning: 'still/yet', sentiment: 'neutral', usage: 'contrast', intimacy: 'low' },

    // Quantifiers
    'shob': { meaning: 'all/everything', sentiment: 'neutral', usage: 'totality', intimacy: 'low' },
    'sob': { meaning: 'all/everything', sentiment: 'neutral', usage: 'totality', intimacy: 'low' },
    'ektu': { meaning: 'a little/please', sentiment: 'neutral', usage: 'request', intimacy: 'low' },
    'aro': { meaning: 'more', sentiment: 'neutral', usage: 'addition', intimacy: 'low' },

    // Work/Activity
    'kaaj': { meaning: 'work/job', sentiment: 'neutral', usage: 'activity', intimacy: 'low' },
    'kaj': { meaning: 'work/job', sentiment: 'neutral', usage: 'activity', intimacy: 'low' },
    'kaaj e': { meaning: 'to work/at work', sentiment: 'neutral', usage: 'activity', intimacy: 'low' }
  },

  // Common Phrases
  phrases: {
    'ki kortechen': { meaning: 'what are you doing', type: 'question', formality: 'formal' },
    'ki korcho': { meaning: 'what are you doing', type: 'question', formality: 'informal' },
    'kemon acho': { meaning: 'how are you', type: 'greeting', formality: 'informal' },
    'kemon achen': { meaning: 'how are you', type: 'greeting', formality: 'formal' },
    'bhalo achi': { meaning: 'I am fine', type: 'response', formality: 'neutral' },
    'thik ache': { meaning: 'it\'s okay/alright', type: 'acknowledgment', formality: 'neutral' },
    'kono problem nai': { meaning: 'no problem', type: 'reassurance', formality: 'neutral' },
    'bujhte parchi': { meaning: 'I understand', type: 'comprehension', formality: 'neutral' },
    'bujhte parchi na': { meaning: 'I don\'t understand', type: 'confusion', formality: 'neutral' }
  },

  // Negation
  negation: {
    'na': 'no/not',
    'nai': 'no/not/don\'t have',
    'nei': 'no/not/don\'t have',
    'hobena': 'will not be',
    'parbo na': 'cannot/will not be able to',
    'jabo na': 'will not go',
    'korbo na': 'will not do'
  },

  // Time & Frequency
  time: {
    'aaj': 'today',
    'kal': 'yesterday/tomorrow',
    'parso': 'day after tomorrow/day before yesterday',
    'ekhon': 'now',
    'akhon': 'now',
    'pore': 'later',
    'age': 'before/earlier',
    'shokale': 'in the morning',
    'bikale': 'in the afternoon',
    'rate': 'at night',
    'shobar': 'always',
    'kokhono': 'sometimes/ever',
    'kakhono': 'sometimes/ever'
  },

  // Common Places (Bangladesh context)
  places: {
    'tsc': { name: 'Teacher-Student Center', type: 'campus', context: 'university' },
    'campus': { name: 'University Campus', type: 'campus', context: 'university' },
    'library': { name: 'Library', type: 'campus', context: 'university' },
    'canteen': { name: 'Canteen', type: 'campus', context: 'university' },
    'bari': { name: 'Home', type: 'residence', context: 'personal' },
    'basay': { name: 'At home', type: 'residence', context: 'personal' },
    'mess': { name: 'Mess/Hostel', type: 'residence', context: 'student' },
    'hall': { name: 'Dormitory/Hall', type: 'residence', context: 'university' },
    'class': { name: 'Class', type: 'campus', context: 'university' },
    'lab': { name: 'Laboratory', type: 'campus', context: 'university' },
    'cantonment': { name: 'Cantonment', type: 'area', context: 'location' },
    'mirpur': { name: 'Mirpur', type: 'area', context: 'location' },
    'avesh': { name: 'Avesh (Place)', type: 'area', context: 'location' },
    'gym': { name: 'Gym', type: 'activity_center', context: 'fitness' }
  },

  // Relationship & Social Context
  relationshipMarkers: {
    // Intimacy Levels (based on language used)
    'very_close': {
      indicators: ['khanki', 'hala', 'magir', 'sala', 'tui', 'tor', 'tora', 'bokachoda'],
      description: 'Very close friends - vulgar slang indicates high intimacy',
      tone: 'very_informal',
      trust: 'very_high'
    },
    'close': {
      indicators: ['tumi', 'tomar', 'bro', 'dude', 'kop'],
      description: 'Close friends - informal language',
      tone: 'informal',
      trust: 'high'
    },
    'friendly': {
      indicators: ['ami', 'tumi', 'casual slang'],
      description: 'Friendly acquaintances',
      tone: 'casual',
      trust: 'medium'
    },
    'formal': {
      indicators: ['apni', 'apnara', 'apnar'],
      description: 'Formal relationship',
      tone: 'formal',
      trust: 'low'
    }
  },

  // Conversation Topics
  topics: {
    'relationship_advice': {
      keywords: ['prem', 'prem korish', 'prem kortesi', 'girlfriend', 'boyfriend', 'love'],
      indicators: ['na korish', 'koro na', 'advice'],
      description: 'Giving or receiving relationship advice',
      context: 'personal'
    },
    'location_sharing': {
      keywords: ['koi', 'kothay', 'koi tui', 'where'],
      indicators: ['tsc', 'campus', 'bari', 'basay'],
      description: 'Sharing current location',
      context: 'social'
    },
    'work_activity': {
      keywords: ['kaaj', 'kaj', 'kaaj e', 'aschi', 'jachhi'],
      indicators: ['work', 'office', 'project'],
      description: 'Work or activity related',
      context: 'professional'
    },
    'casual_banter': {
      keywords: ['khanki', 'hala', 'kop', 'moja'],
      indicators: ['lol', 'haha', 'emojis'],
      description: 'Casual friendly banter',
      context: 'social'
    }
  }
};

