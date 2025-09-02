import { NextRequest, NextResponse } from 'next/server';
import { dailyContentGenerator } from '../../../../../lib/content-generators/daily-content';
import { getDatabase, logBroadcast } from '../../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      date = new Date().toISOString().split('T')[0],
      generateTips = true,
      generateHoroscopes = true,
      generateLunar = true,
      tipsCount = 3
    } = body;

    console.log('🤖 Starting AI content generation...', { date, generateTips, generateHoroscopes, generateLunar });

    const results: {
      tips: any[];
      horoscopes: any[];
      lunar: any;
      errors: string[];
    } = {
      tips: [],
      horoscopes: [],
      lunar: null,
      errors: []
    };

    // Генерируем контент параллельно
    const promises = [];

    if (generateTips) {
      promises.push(
        dailyContentGenerator.generateDailyTips(tipsCount)
          .then(tips => {
            results.tips = tips;
            console.log(`✅ Generated ${tips.length} daily tips`);
          })
          .catch(error => {
            console.error('❌ Failed to generate tips:', error);
            results.errors.push(`Tips generation failed: ${error instanceof Error ? error.message : String(error)}`);
          })
      );
    }

    if (generateHoroscopes) {
      promises.push(
        dailyContentGenerator.generateZodiacHoroscopes(date)
          .then(horoscopes => {
            results.horoscopes = horoscopes;
            console.log(`✅ Generated ${horoscopes.length} horoscopes`);
          })
          .catch(error => {
            console.error('❌ Failed to generate horoscopes:', error);
            results.errors.push(`Horoscopes generation failed: ${error instanceof Error ? error.message : String(error)}`);
          })
      );
    }

    if (generateLunar) {
      promises.push(
        dailyContentGenerator.generateLunarContent(date)
          .then(lunar => {
            results.lunar = lunar;
            console.log('✅ Generated lunar content');
          })
          .catch(error => {
            console.error('❌ Failed to generate lunar content:', error);
            results.errors.push(`Lunar content generation failed: ${error instanceof Error ? error.message : String(error)}`);
          })
      );
    }

    // Ждем завершения всех генераций
    await Promise.all(promises);

    // Сохраняем в базу данных (если нужно)
    const db = await getDatabase();
    
    // Сохраняем советы дня
    for (const tip of results.tips) {
      try {
        await db.run(`
          INSERT OR REPLACE INTO generated_content 
          (id, type, date, content, metadata, created_at) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          tip.id,
          'DAILY_TIP',
          date,
          JSON.stringify(tip),
          JSON.stringify({ category: tip.category, type: tip.type }),
          new Date().toISOString()
        ]);
      } catch (dbError) {
        console.error('Failed to save tip to database:', dbError);
      }
    }

    // Сохраняем гороскопы
    for (const horoscope of results.horoscopes) {
      try {
        await db.run(`
          INSERT OR REPLACE INTO generated_content 
          (id, type, date, content, metadata, created_at) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          `horoscope_${horoscope.sign}_${date}`,
          'HOROSCOPE',
          date,
          JSON.stringify(horoscope),
          JSON.stringify({ sign: horoscope.sign, mood: horoscope.mood }),
          new Date().toISOString()
        ]);
      } catch (dbError) {
        console.error('Failed to save horoscope to database:', dbError);
      }
    }

    // Сохраняем лунный контент
    if (results.lunar) {
      try {
        await db.run(`
          INSERT OR REPLACE INTO generated_content 
          (id, type, date, content, metadata, created_at) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          `lunar_${date}`,
          'LUNAR',
          date,
          JSON.stringify(results.lunar),
          JSON.stringify({ phase: results.lunar.phase, energy: results.lunar.energy }),
          new Date().toISOString()
        ]);
      } catch (dbError) {
        console.error('Failed to save lunar content to database:', dbError);
      }
    }

    // Логируем результат
    await logBroadcast({
      level: 'INFO',
      message: `AI content generation completed for ${date}`,
      metadata: {
        date,
        tipsGenerated: results.tips.length,
        horoscopesGenerated: results.horoscopes.length,
        lunarGenerated: !!results.lunar,
        errorsCount: results.errors.length,
        action: 'ai_content_generation'
      }
    });

    const summary = {
      success: true,
      date,
      generated: {
        tips: results.tips.length,
        horoscopes: results.horoscopes.length,
        lunar: !!results.lunar
      },
      errors: results.errors,
      data: results
    };

    console.log('🎉 AI content generation completed:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ AI content generation error:', error);
    
    await logBroadcast({
      level: 'ERROR',
      message: `AI content generation failed: ${error instanceof Error ? error.message : String(error)}`,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        action: 'ai_content_generation_error'
      }
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to generate AI content',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// GET endpoint для получения сгенерированного контента
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const type = searchParams.get('type'); // 'DAILY_TIP', 'HOROSCOPE', 'LUNAR'

    const db = await getDatabase();
    
    let query = 'SELECT * FROM generated_content WHERE date = ?';
    const params = [date];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const rows = await db.all(query, params);
    
    const content = rows.map(row => ({
      id: row.id,
      type: row.type,
      date: row.date,
      content: JSON.parse(row.content),
      metadata: JSON.parse(row.metadata || '{}'),
      created_at: row.created_at
    }));

    return NextResponse.json({
      success: true,
      date,
      content,
      count: content.length
    });

  } catch (error) {
    console.error('Error fetching generated content:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch generated content'
    }, { status: 500 });
  }
}

