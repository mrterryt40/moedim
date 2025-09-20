import { Injectable } from '@nestjs/common';

interface GematriaResult {
  text: string;
  value: number;
  method: string;
  letterBreakdown: { letter: string; value: number }[];
  relatedConcepts?: string[];
  biblicalReferences?: string[];
}

interface NumerologyResult {
  number: number;
  hebrewMeaning: string;
  biblicalSignificance: string;
  examples: string[];
  symbolism: string[];
}

interface BiblicalCycle {
  name: string;
  length: number;
  description: string;
  currentPosition?: number;
  nextOccurrence?: Date;
}

@Injectable()
export class NumbersService {

  // Hebrew letter values for Gematria
  private hebrewLetterValues = {
    // Basic letters (1-9)
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    // Tens (10-90)
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
    // Hundreds (100-400)
    'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
    // Final forms
    'ך': 500, 'ם': 600, 'ן': 700, 'ף': 800, 'ץ': 900
  };

  // Transliteration mapping
  private transliterationMap = {
    'a': 'א', 'b': 'ב', 'g': 'ג', 'd': 'ד', 'h': 'ה', 'v': 'ו', 'z': 'ז',
    'ch': 'ח', 't': 'ט', 'y': 'י', 'k': 'כ', 'l': 'ל', 'm': 'מ', 'n': 'נ',
    's': 'ס', 'p': 'פ', 'tz': 'צ', 'q': 'ק', 'r': 'ר', 'sh': 'ש', 'th': 'ת'
  };

  calculateGematria(text: string, method: 'standard' | 'small' | 'reversed' = 'standard'): GematriaResult {
    // Remove spaces and convert to Hebrew if needed
    const hebrewText = this.convertToHebrew(text.replace(/\s/g, ''));

    let total = 0;
    const letterBreakdown: { letter: string; value: number }[] = [];

    for (const char of hebrewText) {
      let value = this.hebrewLetterValues[char] || 0;

      if (method === 'small') {
        // Reduce to single digit
        while (value > 9) {
          value = Math.floor(value / 10) + (value % 10);
        }
      } else if (method === 'reversed') {
        // Reverse alphabet values
        const keys = Object.keys(this.hebrewLetterValues);
        const index = keys.indexOf(char);
        if (index !== -1) {
          value = this.hebrewLetterValues[keys[keys.length - 1 - index]];
        }
      }

      if (value > 0) {
        total += value;
        letterBreakdown.push({ letter: char, value });
      }
    }

    return {
      text: hebrewText,
      value: total,
      method,
      letterBreakdown,
      relatedConcepts: this.findRelatedConcepts(total),
      biblicalReferences: this.findBiblicalReferences(total)
    };
  }

  getNumerologyMeaning(number: number): NumerologyResult {
    const meanings = {
      1: {
        hebrewMeaning: 'Echad (אחד) - Unity, Oneness',
        biblicalSignificance: 'The absolute unity and uniqueness of God',
        examples: ['Shema: "Hear O Israel, YHVH our God, YHVH is One"', 'One Temple', 'First day of creation'],
        symbolism: ['Divine unity', 'Leadership', 'Beginning', 'Independence']
      },
      2: {
        hebrewMeaning: 'Shtayim (שתיים) - Duality, Partnership',
        biblicalSignificance: 'Witness, testimony, partnership',
        examples: ['Two tablets of the law', 'Two witnesses', 'Male and female'],
        symbolism: ['Testimony', 'Partnership', 'Balance', 'Choice']
      },
      3: {
        hebrewMeaning: 'Shalosh (שלוש) - Completeness, Divine perfection',
        biblicalSignificance: 'Divine completeness and perfection',
        examples: ['Three patriarchs', 'Three pilgrimage festivals', 'Three daily prayers'],
        symbolism: ['Divine perfection', 'Completeness', 'Stability', 'Trinity concept']
      },
      4: {
        hebrewMeaning: 'Arba (ארבע) - Material world, Four directions',
        biblicalSignificance: 'The material world and earthly completeness',
        examples: ['Four corners of the earth', 'Four species of Sukkot', 'Four cups of Passover'],
        symbolism: ['Material world', 'Earthly completeness', 'Four directions', 'Stability']
      },
      5: {
        hebrewMeaning: 'Chamesh (חמש) - Grace, Divine favor',
        biblicalSignificance: 'Grace and divine favor',
        examples: ['Five books of Torah', 'Five fingers', 'David chose five stones'],
        symbolism: ['Grace', 'Divine favor', 'Human responsibility', 'Torah']
      },
      6: {
        hebrewMeaning: 'Shesh (שש) - Human effort, Imperfection',
        biblicalSignificance: 'Human effort and imperfection',
        examples: ['Six days of creation', 'Six cities of refuge', 'Man created on sixth day'],
        symbolism: ['Human effort', 'Imperfection', 'Labor', 'Preparation for rest']
      },
      7: {
        hebrewMeaning: 'Sheva (שבע) - Perfection, Completion',
        biblicalSignificance: 'Spiritual perfection and completion',
        examples: ['Sabbath (7th day)', 'Seven festivals', 'Seven years of plenty'],
        symbolism: ['Spiritual perfection', 'Rest', 'Completion', 'Holiness']
      },
      8: {
        hebrewMeaning: 'Shmoneh (שמונה) - New beginnings, Transcendence',
        biblicalSignificance: 'New beginnings beyond natural order',
        examples: ['Circumcision on 8th day', 'Eight people in the ark', 'Hanukkah (8 days)'],
        symbolism: ['New beginnings', 'Transcendence', 'Supernatural', 'Covenant']
      },
      9: {
        hebrewMeaning: 'Tesha (תשע) - Fruitfulness, Harvest',
        biblicalSignificance: 'Fruitfulness and harvest',
        examples: ['Nine months of pregnancy', 'Nine fruits of the Spirit'],
        symbolism: ['Fruitfulness', 'Harvest', 'Completion of cycle', 'Maturity']
      },
      10: {
        hebrewMeaning: 'Eser (עשר) - Divine order, Law',
        biblicalSignificance: 'Divine order and law',
        examples: ['Ten Commandments', 'Ten plagues', 'Tithe (10%)'],
        symbolism: ['Divine order', 'Law', 'Completeness', 'Responsibility']
      },
      12: {
        hebrewMeaning: 'Shteim Esreh (שתים עשרה) - Divine government',
        biblicalSignificance: 'Divine government and apostolic fullness',
        examples: ['Twelve tribes', 'Twelve disciples', 'Twelve months'],
        symbolism: ['Divine government', 'Apostolic authority', 'Completeness', 'Time cycles']
      },
      40: {
        hebrewMeaning: 'Arbaim (ארבעים) - Testing, Trial, Probation',
        biblicalSignificance: 'Period of testing and transformation',
        examples: ['40 days of rain (Noah)', '40 years in wilderness', '40 days of Moses on Sinai'],
        symbolism: ['Testing', 'Transformation', 'Preparation', 'Judgment']
      },
      50: {
        hebrewMeaning: 'Chamishim (חמישים) - Freedom, Jubilee',
        biblicalSignificance: 'Freedom and jubilee',
        examples: ['Year of Jubilee (50th year)', 'Pentecost (50 days after Passover)'],
        symbolism: ['Freedom', 'Liberation', 'Holy Spirit', 'New beginning']
      },
      70: {
        hebrewMeaning: 'Shivim (שבעים) - Perfect spiritual order',
        biblicalSignificance: 'Perfect spiritual order and completeness',
        examples: ['70 elders of Israel', '70 weeks prophecy', '70 nations'],
        symbolism: ['Spiritual perfection', 'Complete administration', 'Universal scope']
      }
    };

    return meanings[number] || {
      hebrewMeaning: 'Custom number',
      biblicalSignificance: 'Seek divine wisdom for interpretation',
      examples: ['Study the components and factors'],
      symbolism: ['Unique divine message', 'Personal revelation']
    };
  }

  getBiblicalCycles(): BiblicalCycle[] {
    const now = new Date();
    const currentYear = now.getFullYear();

    return [
      {
        name: 'Sabbath Cycle',
        length: 7,
        description: '7-day weekly cycle with Sabbath rest',
        currentPosition: now.getDay() + 1, // 1-7 (Sunday = 1)
        nextOccurrence: this.getNextDayOfWeek(6) // Saturday
      },
      {
        name: 'Sabbatical Year (Shemitah)',
        length: 7,
        description: '7-year cycle of land rest',
        currentPosition: this.calculateShemitahPosition(currentYear),
        nextOccurrence: this.calculateNextShemitah(currentYear)
      },
      {
        name: 'Jubilee Cycle',
        length: 50,
        description: '50-year cycle of freedom and restoration',
        currentPosition: this.calculateJubileePosition(currentYear),
        nextOccurrence: this.calculateNextJubilee(currentYear)
      },
      {
        name: 'Lunar Month',
        length: 29.5,
        description: 'Hebrew calendar month based on moon phases',
        currentPosition: this.calculateLunarPosition(now)
      },
      {
        name: 'Festival Cycle',
        length: 1,
        description: 'Annual cycle of biblical festivals',
        currentPosition: this.calculateFestivalPosition(now)
      },
      {
        name: 'Kings and Chronicles Pattern',
        length: 490,
        description: '70 weeks of years (70 x 7 = 490 years)',
        currentPosition: this.calculatePropheticPosition(currentYear)
      }
    ];
  }

  findNumberPatterns(text: string): Array<{ pattern: string; significance: string; examples: string[] }> {
    const gematria = this.calculateGematria(text);
    const patterns: any[] = [];

    // Check for common significant numbers
    const significantNumbers = [7, 12, 40, 70, 120, 144, 153, 666, 777, 888];

    for (const num of significantNumbers) {
      if (gematria.value === num || gematria.value % num === 0) {
        patterns.push({
          pattern: `Multiple or exact match of ${num}`,
          significance: this.getNumberSignificance(num),
          examples: this.getNumberExamples(num)
        });
      }
    }

    // Check for perfect squares, cubes, etc.
    const sqrt = Math.sqrt(gematria.value);
    if (Number.isInteger(sqrt)) {
      patterns.push({
        pattern: `Perfect square (${sqrt}²)`,
        significance: 'Represents completeness and divine perfection',
        examples: ['64 = 8² (new beginnings)', '144 = 12² (divine government)']
      });
    }

    // Check for triangular numbers
    const triangular = this.isTriangularNumber(gematria.value);
    if (triangular) {
      patterns.push({
        pattern: `Triangular number (sum of 1 to ${triangular})`,
        significance: 'Represents growth, accumulation, and divine building',
        examples: ['153 = sum of 1 to 17 (fish caught)', '666 = sum of 1 to 36']
      });
    }

    return patterns;
  }

  calculateHebrewNumerology(hebrewWord: string): {
    simpleGematria: number;
    fullGematria: number;
    letterMeanings: Array<{ letter: string; meaning: string; value: number }>;
  } {
    const simpleGematria = this.calculateGematria(hebrewWord).value;

    // Full gematria includes expanded letter names
    let fullValue = 0;
    const letterMeanings: any[] = [];

    for (const letter of hebrewWord) {
      const value = this.hebrewLetterValues[letter] || 0;
      const meaning = this.getLetterMeaning(letter);

      letterMeanings.push({
        letter,
        meaning,
        value
      });

      // For full gematria, add the gematria of the letter name itself
      const letterName = this.getLetterName(letter);
      fullValue += this.calculateGematria(letterName).value;
    }

    return {
      simpleGematria,
      fullGematria: fullValue,
      letterMeanings
    };
  }

  private convertToHebrew(text: string): string {
    // If already Hebrew, return as is
    if (/[\u0590-\u05FF]/.test(text)) {
      return text;
    }

    // Simple transliteration conversion
    let hebrew = text.toLowerCase();

    // Replace longer combinations first
    hebrew = hebrew.replace(/ch/g, 'ח');
    hebrew = hebrew.replace(/sh/g, 'ש');
    hebrew = hebrew.replace(/th/g, 'ת');
    hebrew = hebrew.replace(/tz/g, 'צ');

    // Then single letters
    for (const [english, hebrewLetter] of Object.entries(this.transliterationMap)) {
      if (english.length === 1) {
        hebrew = hebrew.replace(new RegExp(english, 'g'), hebrewLetter);
      }
    }

    return hebrew;
  }

  private findRelatedConcepts(value: number): string[] {
    const concepts = {
      26: ['YHVH (יהוה)', 'Divine Name'],
      86: ['Elohim (אלהים)', 'God'],
      72: ['Chesed (חסד)', 'Loving-kindness'],
      17: ['Tov (טוב)', 'Good'],
      13: ['Echad (אחד)', 'One', 'Ahava (אהבה)', 'Love'],
      18: ['Chai (חי)', 'Life'],
      36: ['Lamed-Vav (ל״ו)', '36 Hidden Saints'],
      144: ['Twelve squared', 'Divine government perfected'],
      153: ['Fish in the net', 'Sons of God'],
      666: ['Mark of the beast', 'Human wisdom'],
      777: ['Divine perfection', 'Godly wisdom'],
      888: ['Jesus in Greek gematria', 'New creation']
    };

    return concepts[value] || [];
  }

  private findBiblicalReferences(value: number): string[] {
    const references = {
      7: ['Genesis 2:2 (God rested)', 'Leviticus 23 (Seven festivals)'],
      12: ['Genesis 49 (Twelve tribes)', 'Matthew 10 (Twelve disciples)'],
      40: ['Genesis 7:12 (Rain 40 days)', 'Exodus 24:18 (Moses 40 days)'],
      70: ['Exodus 24:1 (70 elders)', 'Daniel 9:24 (70 weeks)'],
      144: ['Revelation 7:4 (144,000 sealed)', 'Revelation 21:17 (Wall height)'],
      153: ['John 21:11 (153 fish)'],
      666: ['Revelation 13:18 (Number of the beast)']
    };

    return references[value] || [];
  }

  private getNumberSignificance(num: number): string {
    const significances = {
      7: 'Spiritual perfection and divine completion',
      12: 'Divine government and apostolic authority',
      40: 'Testing, trial, and transformation',
      70: 'Perfect spiritual order and completeness',
      120: 'End of flesh, divine waiting period',
      144: 'Divine government in its ultimate form',
      153: 'Sons of God, elect of God',
      666: 'Number of man, human wisdom without God',
      777: 'Divine perfection and godly wisdom',
      888: 'Jesus, new creation, resurrection'
    };

    return significances[num] || 'Seek divine revelation for meaning';
  }

  private getNumberExamples(num: number): string[] {
    const examples = {
      7: ['Seven days of creation', 'Seven festivals', 'Seven churches'],
      12: ['Twelve tribes', 'Twelve disciples', 'Twelve gates'],
      40: ['Noah\'s flood', 'Wilderness wandering', 'Jesus\' temptation'],
      70: ['Seventy elders', 'Seventy weeks prophecy', 'Seventy nations'],
      144: ['144,000 sealed', '12 x 12 perfected government'],
      153: ['Fish caught in John 21:11'],
      666: ['Number of the beast in Revelation'],
      777: ['Divine perfection tripled'],
      888: ['Jesus in Greek gematria']
    };

    return examples[num] || [];
  }

  private isTriangularNumber(n: number): number | false {
    // Check if n = k(k+1)/2 for some integer k
    const k = Math.floor((-1 + Math.sqrt(1 + 8 * n)) / 2);
    return (k * (k + 1)) / 2 === n ? k : false;
  }

  private getLetterMeaning(letter: string): string {
    const meanings = {
      'א': 'Aleph - Unity, God, Leadership',
      'ב': 'Bet - House, Family, Blessing',
      'ג': 'Gimel - Camel, Lifting up, Pride',
      'ד': 'Dalet - Door, Pathway, Humility',
      'ה': 'Hey - Window, Revelation, Grace',
      'ו': 'Vav - Nail, Hook, Connection',
      'ז': 'Zayin - Weapon, Sword, Spirit',
      'ח': 'Chet - Fence, Private, Grace',
      'ט': 'Tet - Snake, Surround, Judgment',
      'י': 'Yod - Hand, Work, Deed',
      'כ': 'Kaf - Palm, Open hand, Allow',
      'ל': 'Lamed - Goad, Teach, Learn',
      'מ': 'Mem - Water, Chaos, Mighty',
      'נ': 'Nun - Fish, Activity, Life',
      'ס': 'Samech - Support, Trust, Rely',
      'ע': 'Ayin - Eye, See, Know',
      'פ': 'Pey - Mouth, Speak, Word',
      'צ': 'Tzade - Fishhook, Desire, Need',
      'ק': 'Qof - Back of head, Behind, Last',
      'ר': 'Resh - Head, Person, Highest',
      'ש': 'Shin - Teeth, Sharp, Press',
      'ת': 'Tav - Mark, Sign, Covenant'
    };

    return meanings[letter] || 'Unknown letter';
  }

  private getLetterName(letter: string): string {
    const names = {
      'א': 'אלף', 'ב': 'בית', 'ג': 'גמל', 'ד': 'דלת', 'ה': 'הא',
      'ו': 'ואו', 'ז': 'זין', 'ח': 'חית', 'ט': 'טית', 'י': 'יוד',
      'כ': 'כף', 'ל': 'למד', 'מ': 'מם', 'נ': 'נון', 'ס': 'סמך',
      'ע': 'עין', 'פ': 'פא', 'צ': 'צדי', 'ק': 'קוף', 'ר': 'ריש',
      'ש': 'שין', 'ת': 'תו'
    };

    return names[letter] || letter;
  }

  private getNextDayOfWeek(targetDay: number): Date {
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    const nextOccurrence = new Date(today);
    nextOccurrence.setDate(today.getDate() + daysUntilTarget);
    return nextOccurrence;
  }

  private calculateShemitahPosition(year: number): number {
    // Simplified calculation - actual Shemitah years require proper Hebrew calendar
    // Known Shemitah year: 5775 (2014-2015)
    const baseShemitah = 5775;
    const yearsSinceBase = year - 2014;
    return ((yearsSinceBase % 7) + 7) % 7;
  }

  private calculateNextShemitah(year: number): Date {
    const position = this.calculateShemitahPosition(year);
    const yearsUntilNext = position === 0 ? 7 : 7 - position;
    return new Date(year + yearsUntilNext, 8, 1); // Approximate start
  }

  private calculateJubileePosition(year: number): number {
    // Simplified calculation
    const baseJubilee = 5727; // Approximation
    const yearsSinceBase = year - 1967;
    return ((yearsSinceBase % 50) + 50) % 50;
  }

  private calculateNextJubilee(year: number): Date {
    const position = this.calculateJubileePosition(year);
    const yearsUntilNext = position === 0 ? 50 : 50 - position;
    return new Date(year + yearsUntilNext, 8, 1);
  }

  private calculateLunarPosition(date: Date): number {
    // Simplified lunar calculation
    const referenceNewMoon = new Date('2024-01-11');
    const daysSinceReference = Math.floor((date.getTime() - referenceNewMoon.getTime()) / (1000 * 60 * 60 * 24));
    return (daysSinceReference % 29.5) + 1;
  }

  private calculateFestivalPosition(date: Date): number {
    // Position in the Israelite year (simplified)
    const startOfYear = new Date(date.getFullYear(), 8, 1); // Approximate Rosh Hashanah
    const daysSinceStart = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    return ((daysSinceStart % 354) + 354) % 354; // Hebrew year approximation
  }

  private calculatePropheticPosition(year: number): number {
    // Simplified prophetic calculation
    const baseYear = 1948; // Modern Israel
    return (year - baseYear) % 490;
  }
}