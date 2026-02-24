export type Language = 'en' | 'hi' | 'mr';

type TranslationMap = {
  [key: string]: { en: string; hi: string; mr: string };
};

const translations: TranslationMap = {
  // Navigation
  home: { en: 'Home', hi: 'होम', mr: 'मुख्यपृष्ठ' },
  donateFood: { en: 'Donate Food', hi: 'भोजन दान करें', mr: 'अन्न दान करा' },
  iAmAnNGO: { en: 'I Am an NGO', hi: 'मैं एक एनजीओ हूँ', mr: 'मी एक एनजीओ आहे' },
  impact: { en: 'Impact', hi: 'प्रभाव', mr: 'प्रभाव' },
  volunteer: { en: 'Volunteer', hi: 'स्वयंसेवक', mr: 'स्वयंसेवक' },
  login: { en: 'Login', hi: 'लॉगिन', mr: 'लॉगिन' },
  logout: { en: 'Logout', hi: 'लॉगआउट', mr: 'लॉगआउट' },
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड' },

  // Hero
  tagline: { en: 'From waste to plate — powered by AI, delivered with dignity.', hi: 'बर्बादी से थाली तक — AI द्वारा संचालित, गरिमा के साथ वितरित।', mr: 'कचऱ्यापासून ताटापर्यंत — AI द्वारे चालवलेले, सन्मानाने वितरित.' },
  heroTitle: { en: 'From Waste to Plate', hi: 'बर्बादी से थाली तक', mr: 'कचऱ्यापासून ताटापर्यंत' },
  heroSubtitle: { en: 'Maharashtra Edition', hi: 'महाराष्ट्र संस्करण', mr: 'महाराष्ट्र आवृत्ती' },
  getStarted: { en: 'Get Started', hi: 'शुरू करें', mr: 'सुरू करा' },
  learnMore: { en: 'Learn More', hi: 'अधिक जानें', mr: 'अधिक जाणून घ्या' },

  // Cities
  selectCity: { en: 'Select City', hi: 'शहर चुनें', mr: 'शहर निवडा' },
  mumbai: { en: 'Mumbai', hi: 'मुंबई', mr: 'मुंबई' },
  pune: { en: 'Pune', hi: 'पुणे', mr: 'पुणे' },
  nagpur: { en: 'Nagpur', hi: 'नागपुर', mr: 'नागपूर' },
  nashik: { en: 'Nashik', hi: 'नासिक', mr: 'नाशिक' },
  aurangabad: { en: 'Aurangabad', hi: 'औरंगाबाद', mr: 'औरंगाबाद' },
  kolhapur: { en: 'Kolhapur', hi: 'कोल्हापुर', mr: 'कोल्हापूर' },

  // Impact counters
  mealsSaved: { en: 'Meals Saved', hi: 'भोजन बचाया', mr: 'जेवण वाचवले' },
  peopleFed: { en: 'People Fed', hi: 'लोगों को खाना मिला', mr: 'लोकांना अन्न मिळाले' },
  co2Reduced: { en: 'CO₂ Reduced', hi: 'CO₂ कम किया', mr: 'CO₂ कमी केले' },
  kgRedistributed: { en: 'Kg Redistributed', hi: 'किलो पुनर्वितरित', mr: 'किलो पुनर्वितरित' },

  // Food types
  rice: { en: 'Rice', hi: 'चावल', mr: 'भात' },
  curry: { en: 'Curry', hi: 'करी', mr: 'भाजी' },
  bread: { en: 'Bread', hi: 'रोटी', mr: 'भाकरी' },
  desserts: { en: 'Desserts', hi: 'मिठाई', mr: 'मिठाई' },
  vegetables: { en: 'Vegetables', hi: 'सब्जियां', mr: 'भाज्या' },
  fish: { en: 'Fish', hi: 'मछली', mr: 'मासे' },
  dairy: { en: 'Dairy', hi: 'डेयरी', mr: 'दुग्धजन्य' },
  other: { en: 'Other', hi: 'अन्य', mr: 'इतर' },

  // Storage conditions
  refrigerated: { en: 'Refrigerated', hi: 'प्रशीतित', mr: 'थंड ठेवलेले' },
  roomTemperature: { en: 'Room Temperature', hi: 'कमरे का तापमान', mr: 'खोलीचे तापमान' },
  hot: { en: 'Hot', hi: 'गर्म', mr: 'गरम' },

  // Status
  safe: { en: 'Safe', hi: 'सुरक्षित', mr: 'सुरक्षित' },
  urgent: { en: 'Urgent', hi: 'जरूरी', mr: 'तातडीचे' },
  unsafe: { en: 'Unsafe', hi: 'असुरक्षित', mr: 'असुरक्षित' },
  pending: { en: 'Pending', hi: 'लंबित', mr: 'प्रलंबित' },
  matched: { en: 'Matched', hi: 'मिलान', mr: 'जुळवलेले' },
  accepted: { en: 'Accepted', hi: 'स्वीकृत', mr: 'स्वीकारलेले' },
  completed: { en: 'Completed', hi: 'पूर्ण', mr: 'पूर्ण' },
  rejected: { en: 'Rejected', hi: 'अस्वीकृत', mr: 'नाकारलेले' },

  // Form labels
  foodType: { en: 'Food Type', hi: 'भोजन प्रकार', mr: 'अन्न प्रकार' },
  quantity: { en: 'Quantity (kg)', hi: 'मात्रा (किलो)', mr: 'प्रमाण (किलो)' },
  timeSinceCooked: { en: 'Time Since Cooked (hours)', hi: 'पकाने के बाद का समय (घंटे)', mr: 'शिजवल्यापासूनचा वेळ (तास)' },
  storageCondition: { en: 'Storage Condition', hi: 'भंडारण स्थिति', mr: 'साठवण स्थिती' },
  pickupAddress: { en: 'Pickup Address', hi: 'पिकअप पता', mr: 'पिकअप पत्ता' },
  pickupDeadline: { en: 'Pickup Deadline', hi: 'पिकअप समय सीमा', mr: 'पिकअप अंतिम मुदत' },
  submit: { en: 'Submit Donation', hi: 'दान जमा करें', mr: 'दान सादर करा' },
  submitting: { en: 'Submitting...', hi: 'जमा हो रहा है...', mr: 'सादर होत आहे...' },

  // Buttons
  accept: { en: 'Accept', hi: 'स्वीकार करें', mr: 'स्वीकारा' },
  reject: { en: 'Reject', hi: 'अस्वीकार करें', mr: 'नाकारा' },
  viewRoute: { en: 'View Route', hi: 'मार्ग देखें', mr: 'मार्ग पहा' },
  markPickedUp: { en: 'Mark as Picked Up', hi: 'पिक अप के रूप में चिह्नित करें', mr: 'उचलले म्हणून चिन्हांकित करा' },
  markDelivered: { en: 'Mark as Delivered', hi: 'डिलीवर के रूप में चिह्नित करें', mr: 'वितरित म्हणून चिन्हांकित करा' },

  // Emergency
  emergencyMode: { en: 'Emergency Mode', hi: 'आपातकालीन मोड', mr: 'आणीबाणी मोड' },
  emergencyActive: { en: 'HUNGER EMERGENCY MODE ACTIVE – All volunteers notified', hi: 'भूख आपातकाल मोड सक्रिय – सभी स्वयंसेवकों को सूचित किया गया', mr: 'भूक आणीबाणी मोड सक्रिय – सर्व स्वयंसेवकांना सूचित केले' },
  activateEmergency: { en: 'Activate Emergency', hi: 'आपातकाल सक्रिय करें', mr: 'आणीबाणी सक्रिय करा' },
  deactivateEmergency: { en: 'Deactivate Emergency', hi: 'आपातकाल निष्क्रिय करें', mr: 'आणीबाणी निष्क्रिय करा' },

  // Messages
  donationSubmitted: { en: 'Donation submitted successfully!', hi: 'दान सफलतापूर्वक जमा किया गया!', mr: 'दान यशस्वीरित्या सादर केले!' },
  ngoMatched: { en: 'NGO matched successfully!', hi: 'एनजीओ सफलतापूर्वक मिलाया गया!', mr: 'एनजीओ यशस्वीरित्या जुळवले!' },
  donationAccepted: { en: 'Donation accepted', hi: 'दान स्वीकार किया गया', mr: 'दान स्वीकारले' },
  donationRejected: { en: 'Donation rejected', hi: 'दान अस्वीकार किया गया', mr: 'दान नाकारले' },
  statusUpdated: { en: 'Status updated successfully', hi: 'स्थिति सफलतापूर्वक अपडेट की गई', mr: 'स्थिती यशस्वीरित्या अपडेट केली' },

  // NGO Dashboard
  incomingDonations: { en: 'Incoming Donations', hi: 'आने वाले दान', mr: 'येणारे दान' },
  ngoMetrics: { en: 'NGO Metrics', hi: 'एनजीओ मेट्रिक्स', mr: 'एनजीओ मेट्रिक्स' },
  totalReceived: { en: 'Total Received', hi: 'कुल प्राप्त', mr: 'एकूण प्राप्त' },
  peopleServed: { en: 'People Served', hi: 'लोगों की सेवा', mr: 'लोकांची सेवा' },

  // Volunteer
  myAssignments: { en: 'My Assignments', hi: 'मेरे असाइनमेंट', mr: 'माझे असाइनमेंट' },
  profile: { en: 'Profile', hi: 'प्रोफाइल', mr: 'प्रोफाइल' },
  urgentPickup: { en: 'Urgent food pickup', hi: 'जरूरी भोजन पिकअप', mr: 'तातडीचे अन्न पिकअप' },
  mealsExpiring: { en: 'meals expiring in', hi: 'भोजन समाप्त हो रहा है', mr: 'जेवण संपत आहे' },
  hours: { en: 'hours', hi: 'घंटे', mr: 'तास' },

  // Impact
  totalMealsRescued: { en: 'Total Meals Rescued', hi: 'कुल भोजन बचाया', mr: 'एकूण जेवण वाचवले' },
  cityBreakdown: { en: 'City-wise Breakdown', hi: 'शहर-वार विवरण', mr: 'शहरनिहाय तपशील' },
  topDonors: { en: 'Top Donors', hi: 'शीर्ष दाता', mr: 'शीर्ष दाते' },
  voiceSummary: { en: 'Play Voice Summary', hi: 'वॉयस सारांश चलाएं', mr: 'व्हॉइस सारांश प्ले करा' },

  // Voice
  voiceInput: { en: 'Voice Input', hi: 'वॉयस इनपुट', mr: 'व्हॉइस इनपुट' },
  listening: { en: 'Listening...', hi: 'सुन रहा है...', mr: 'ऐकत आहे...' },
  speakNow: { en: 'Speak now', hi: 'अभी बोलें', mr: 'आता बोला' },
};

export default translations;

export function getTranslation(key: string, language: Language): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[language] || entry.en || key;
}
