/**
 * 🔥 MULTI-LANGUAGE ENGINE - ULTRA SIMPLE GLOBAL REACH
 * Supports major African languages for 100M+ farmers
 */

interface Translation {
  [key: string]: string;
}

interface LanguageData {
  code: string;
  name: string;
  nativeName: string;
  translations: Translation;
}

class MultiLanguageEngine {
  private static instance: MultiLanguageEngine;
  
  static getInstance(): MultiLanguageEngine {
    if (!this.instance) this.instance = new MultiLanguageEngine();
    return this.instance;
  }

  private currentLanguage = 'en';
  
  private languages: LanguageData[] = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      translations: {
        'app_name': 'CropGenius',
        'organic_superpowers': 'Organic Superpowers',
        'daily_actions': 'Daily Actions',
        'save_money': 'Save Money',
        'get_certified': 'Get Certified',
        'neem_spray': 'Neem Oil Spray',
        'compost_tea': 'Compost Tea',
        'ingredients': 'Ingredients',
        'instructions': 'Instructions',
        'savings': 'Savings',
        'upgrade_now': 'Upgrade Now'
      }
    },
    {
      code: 'sw',
      name: 'Swahili',
      nativeName: 'Kiswahili',
      translations: {
        'app_name': 'CropGenius',
        'organic_superpowers': 'Nguvu za Kilimo Asili',
        'daily_actions': 'Vitendo vya Kila Siku',
        'save_money': 'Okoa Pesa',
        'get_certified': 'Pata Cheti',
        'neem_spray': 'Dawa ya Mti wa Neem',
        'compost_tea': 'Chai ya Mbolea',
        'ingredients': 'Viungo',
        'instructions': 'Maelekezo',
        'savings': 'Uokoaji',
        'upgrade_now': 'Boresha Sasa'
      }
    },
    {
      code: 'am',
      name: 'Amharic',
      nativeName: 'አማርኛ',
      translations: {
        'app_name': 'CropGenius',
        'organic_superpowers': 'የተፈጥሮ ሃይሎች',
        'daily_actions': 'የዕለት ተዕለት ተግባራት',
        'save_money': 'ገንዘብ ቆጥብ',
        'get_certified': 'ምስክር ወረቀት ያግኙ',
        'neem_spray': 'የኒም ዘይት መርጫ',
        'compost_tea': 'የኮምፖስት ሻይ',
        'ingredients': 'ንጥረ ነገሮች',
        'instructions': 'መመሪያዎች',
        'savings': 'ቁጠባ',
        'upgrade_now': 'አሁን አሻሽል'
      }
    },
    {
      code: 'yo',
      name: 'Yoruba',
      nativeName: 'Yorùbá',
      translations: {
        'app_name': 'CropGenius',
        'organic_superpowers': 'Agbara Ogbin Adayeba',
        'daily_actions': 'Awon Ise Ojoojumo',
        'save_money': 'Fi Owo Pamọ',
        'get_certified': 'Gba Iwe Eri',
        'neem_spray': 'Omi Neem',
        'compost_tea': 'Tii Idoti',
        'ingredients': 'Awon Eroja',
        'instructions': 'Awon Itọsọna',
        'savings': 'Ifipamọ',
        'upgrade_now': 'Mu Dara Si Bayi'
      }
    },
    {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      translations: {
        'app_name': 'CropGenius',
        'organic_superpowers': 'Super-pouvoirs Biologiques',
        'daily_actions': 'Actions Quotidiennes',
        'save_money': 'Économiser',
        'get_certified': 'Obtenir Certification',
        'neem_spray': 'Spray de Neem',
        'compost_tea': 'Thé de Compost',
        'ingredients': 'Ingrédients',
        'instructions': 'Instructions',
        'savings': 'Économies',
        'upgrade_now': 'Mettre à Niveau'
      }
    }
  ];

  // Get available languages
  getLanguages(): LanguageData[] {
    return this.languages;
  }

  // Set current language
  setLanguage(code: string): void {
    const language = this.languages.find(lang => lang.code === code);
    if (language) {
      this.currentLanguage = code;
      localStorage.setItem('cropgenius_language', code);
    }
  }

  // Get current language
  getCurrentLanguage(): string {
    const saved = localStorage.getItem('cropgenius_language');
    return saved || this.detectLanguage();
  }

  // Detect user's language
  private detectLanguage(): string {
    const browserLang = navigator.language.split('-')[0];
    const supported = this.languages.find(lang => lang.code === browserLang);
    return supported ? browserLang : 'en';
  }

  // Translate text
  translate(key: string): string {
    const language = this.languages.find(lang => lang.code === this.getCurrentLanguage());
    return language?.translations[key] || key;
  }

  // Translate with fallback
  t(key: string, fallback?: string): string {
    const translated = this.translate(key);
    return translated !== key ? translated : (fallback || key);
  }

  // Format numbers for locale
  formatNumber(number: number): string {
    try {
      return new Intl.NumberFormat(this.getCurrentLanguage()).format(number);
    } catch {
      return number.toString();
    }
  }

  // Format currency for locale
  formatCurrency(amount: number): string {
    const currency = this.getCurrencyForLanguage(this.getCurrentLanguage());
    try {
      return new Intl.NumberFormat(this.getCurrentLanguage(), {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch {
      return `${currency} ${amount}`;
    }
  }

  private getCurrencyForLanguage(lang: string): string {
    const currencies: Record<string, string> = {
      'en': 'USD',
      'sw': 'KES', // Kenyan Shilling
      'am': 'ETB', // Ethiopian Birr
      'yo': 'NGN', // Nigerian Naira
      'fr': 'XOF'  // West African CFA Franc
    };
    return currencies[lang] || 'USD';
  }

  // Get text direction for language
  getTextDirection(): 'ltr' | 'rtl' {
    // Most African languages are LTR
    return 'ltr';
  }

  // Voice synthesis for low-literacy users
  speak(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.getCurrentLanguage();
      speechSynthesis.speak(utterance);
    }
  }

  // Simple voice commands
  startVoiceRecognition(callback: (text: string) => void): void {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = this.getCurrentLanguage();
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        callback(text);
      };
      recognition.start();
    }
  }
}

export const multiLanguageEngine = MultiLanguageEngine.getInstance();