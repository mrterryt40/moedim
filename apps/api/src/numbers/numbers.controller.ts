import { Controller, Get, Query, Param } from '@nestjs/common';
import { NumbersService } from './numbers.service';

@Controller('numbers')
export class NumbersController {
  constructor(private readonly numbersService: NumbersService) {}

  @Get('gematria')
  async calculateGematria(
    @Query('text') text: string,
    @Query('method') method: 'standard' | 'small' | 'reversed' = 'standard'
  ) {
    if (!text) {
      throw new Error('Text parameter is required');
    }

    return this.numbersService.calculateGematria(text, method);
  }

  @Get('numerology/:number')
  async getNumerologyMeaning(@Param('number') numberParam: string) {
    const number = parseInt(numberParam);
    if (isNaN(number)) {
      throw new Error('Invalid number provided');
    }

    return this.numbersService.getNumerologyMeaning(number);
  }

  @Get('biblical-cycles')
  async getBiblicalCycles() {
    return this.numbersService.getBiblicalCycles();
  }

  @Get('patterns')
  async findNumberPatterns(@Query('text') text: string) {
    if (!text) {
      throw new Error('Text parameter is required');
    }

    return this.numbersService.findNumberPatterns(text);
  }

  @Get('hebrew-numerology')
  async calculateHebrewNumerology(@Query('word') word: string) {
    if (!word) {
      throw new Error('Hebrew word parameter is required');
    }

    return this.numbersService.calculateHebrewNumerology(word);
  }

  @Get('compare')
  async compareGematria(@Query('text1') text1: string, @Query('text2') text2: string) {
    if (!text1 || !text2) {
      throw new Error('Both text1 and text2 parameters are required');
    }

    const gematria1 = this.numbersService.calculateGematria(text1);
    const gematria2 = this.numbersService.calculateGematria(text2);

    const comparison = {
      text1: gematria1,
      text2: gematria2,
      equal: gematria1.value === gematria2.value,
      difference: Math.abs(gematria1.value - gematria2.value),
      ratio: gematria2.value !== 0 ? gematria1.value / gematria2.value : null,
      patterns: []
    };

    // Find patterns in both values
    const patterns1 = this.numbersService.findNumberPatterns(text1);
    const patterns2 = this.numbersService.findNumberPatterns(text2);

    comparison.patterns = [...patterns1, ...patterns2];

    return comparison;
  }

  @Get('sacred-numbers')
  async getSacredNumbers() {
    const sacredNumbers = [1, 3, 7, 12, 13, 18, 26, 40, 50, 70, 72, 144, 153, 666, 777, 888];

    return sacredNumbers.map(num => ({
      number: num,
      meaning: this.numbersService.getNumerologyMeaning(num),
      gematria: {
        // Examples of words that equal this number
        examples: this.getGematriaExamples(num)
      }
    }));
  }

  @Get('letter-meanings')
  async getHebrewLetterMeanings() {
    const letters = [
      'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
      'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'
    ];

    return letters.map(letter => {
      const numerology = this.numbersService.calculateHebrewNumerology(letter);
      return {
        letter,
        ...numerology.letterMeanings[0]
      };
    });
  }

  @Get('calculate-date')
  async calculateDateGematria(@Query('date') dateString: string) {
    if (!dateString) {
      throw new Error('Date parameter is required (YYYY-MM-DD format)');
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    // Calculate gematria for different date representations
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const yearGematria = this.numbersService.calculateGematria(year.toString());
    const monthGematria = this.numbersService.calculateGematria(month.toString());
    const dayGematria = this.numbersService.calculateGematria(day.toString());

    const fullDateValue = yearGematria.value + monthGematria.value + dayGematria.value;
    const reducedValue = this.reduceToSingleDigit(fullDateValue);

    return {
      date: dateString,
      components: {
        year: { value: year, gematria: yearGematria },
        month: { value: month, gematria: monthGematria },
        day: { value: day, gematria: dayGematria }
      },
      total: fullDateValue,
      reduced: reducedValue,
      meaning: this.numbersService.getNumerologyMeaning(reducedValue),
      patterns: this.numbersService.findNumberPatterns(fullDateValue.toString())
    };
  }

  @Get('word-analysis')
  async analyzeWord(@Query('word') word: string) {
    if (!word) {
      throw new Error('Word parameter is required');
    }

    const gematria = this.numbersService.calculateGematria(word);
    const numerology = this.numbersService.calculateHebrewNumerology(word);
    const patterns = this.numbersService.findNumberPatterns(word);

    return {
      word,
      analysis: {
        standardGematria: gematria,
        hebrewNumerology: numerology,
        patterns,
        smallGematria: this.numbersService.calculateGematria(word, 'small'),
        reversedGematria: this.numbersService.calculateGematria(word, 'reversed')
      }
    };
  }

  private getGematriaExamples(number: number): string[] {
    const examples = {
      1: ['א (Aleph)'],
      13: ['אחד (Echad - One)', 'אהבה (Ahava - Love)'],
      18: ['חי (Chai - Life)'],
      26: ['יהוה (YHVH - Divine Name)'],
      72: ['חסד (Chesed - Loving-kindness)'],
      86: ['אלהים (Elohim - God)'],
      144: ['גדול (Gadol - Great)'],
      153: ['בני האלהים (Bnei HaElohim - Sons of God)']
    };

    return examples[number] || [];
  }

  private reduceToSingleDigit(number: number): number {
    while (number > 9) {
      number = Math.floor(number / 10) + (number % 10);
    }
    return number;
  }
}