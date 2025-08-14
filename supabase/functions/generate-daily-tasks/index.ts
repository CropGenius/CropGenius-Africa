import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeniusTask {
  title: string;
  description: string;
  task_type: string;
  category: string;
  priority: number;
  urgency: string;
  estimated_duration: number;
  field_name?: string;
  crop_type?: string;
  fpsi_impact_points: number;
  generation_source: string;
  confidence_score: number;
  learning_tags: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🚀 Generating REAL AI tasks for user: ${userId}`);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's fields and context
    const { data: fields } = await supabase
      .from('fields')
      .select('*')
      .eq('user_id', userId);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Get existing tasks from today to avoid duplicates
    const { data: existingTasks } = await supabase
      .from('daily_genius_tasks')
      .select('title, crop_type')
      .eq('user_id', userId)
      .eq('task_date', new Date().toISOString().split('T')[0]);

    const existingTasksText = existingTasks?.map(t => `${t.title} (${t.crop_type})`).join(', ') || 'None';

    console.log(`📊 Context: ${fields?.length || 0} fields, location: ${profile?.location || 'Kenya'}`);

    // Build AI prompt with real context
    const aiPrompt = `You are CropGenius AI, the world's most advanced farming assistant for African agriculture.

FARMER CONTEXT:
- Location: ${profile?.location || 'Kenya, East Africa'}
- Number of fields: ${fields?.length || 0}
- Today's date: ${new Date().toLocaleDateString()}
- Existing tasks today: ${existingTasksText}

FIELDS DATA:
${fields?.map(field => `
- Field: ${field.name || 'Unnamed'} (${field.size || 1} ${field.size_unit || 'hectares'})
- Crop: ${field.crop_type || 'Mixed crops'}
- Soil: ${field.soil_type || 'Loamy'}
- Irrigation: ${field.irrigation_type || 'Rain-fed'}
- Health: ${field.health_score || 85}/100
- Notes: ${field.notes || 'No specific notes'}
`).join('\n') || '- No fields configured yet'}

CURRENT SEASON: ${new Date().getMonth() < 5 ? 'Dry season - Focus on irrigation and soil prep' : 'Wet season - Focus on pest control and harvesting'}

TASK: Generate 3-5 HIGHLY SPECIFIC, ACTIONABLE daily tasks for this farmer today.

RULES:
1. Tasks must be FARM-SPECIFIC based on actual field data
2. Consider seasonal timing, weather patterns, and crop growth stages
3. Include precise timing recommendations (morning, afternoon, etc.)
4. Each task should have clear measurable outcomes
5. Prioritize tasks by urgency and impact on farm productivity
6. Include specific instructions and reasoning

RESPONSE FORMAT (JSON):
{
  "tasks": [
    {
      "title": "Specific action for specific crop/field",
      "description": "Detailed instructions with timing and expected outcome",
      "task_type": "IRRIGATION|PEST_CONTROL|FERTILIZATION|MONITORING|HARVESTING|PLANNING",
      "category": "IRRIGATION|PEST_CONTROL|FERTILIZATION|MONITORING|HARVESTING|PLANNING", 
      "priority": 1,
      "urgency": "today",
      "estimated_duration": 45,
      "field_name": "Field name from data",
      "crop_type": "Specific crop",
      "fpsi_impact_points": 25,
      "generation_source": "gemini_2_5_flash",
      "confidence_score": 0.9,
      "learning_tags": ["seasonal", "crop-specific", "weather-based"]
    }
  ],
  "reasoning": "Brief explanation of why these tasks were prioritized",
  "seasonal_context": "Current farming season insights"
}

Generate tasks that will genuinely improve this farmer's productivity today!`;

    console.log('🧠 Calling Gemini 2.5 Flash for task generation...');

    // Call Gemini 2.5 Flash API
    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: aiPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Gemini API failed: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    const aiResponseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponseText) {
      console.error('No response text from Gemini:', geminiData);
      throw new Error('No valid response from Gemini AI');
    }

    console.log('✅ Gemini response received, parsing tasks...');

    let aiTasks;
    try {
      // Clean the response and parse JSON
      const cleanResponse = aiResponseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanResponse);
      aiTasks = parsed.tasks || [];
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response:', aiResponseText);
      
      // Generate fallback intelligent tasks
      aiTasks = [{
        title: 'Morning field inspection',
        description: 'Conduct a comprehensive walk-through of all fields to check crop health, identify any issues, and plan the day\'s activities',
        task_type: 'MONITORING',
        category: 'MONITORING',
        priority: 2,
        urgency: 'today',
        estimated_duration: 30,
        field_name: fields?.[0]?.name || 'Main Field',
        crop_type: fields?.[0]?.crop_type || 'Mixed crops',
        fpsi_impact_points: 15,
        generation_source: 'gemini_fallback',
        confidence_score: 0.8,
        learning_tags: ['daily-routine', 'monitoring']
      }];
    }

    console.log(`🎯 Generated ${aiTasks.length} AI tasks`);

    // Save tasks to database
    const tasksToSave = aiTasks.map((task: any) => ({
      user_id: userId,
      field_id: fields?.find(f => f.name === task.field_name)?.id || null,
      title: task.title,
      description: task.description,
      task_type: task.task_type,
      category: task.category,
      priority: task.priority.toString(),
      urgency: task.urgency,
      estimated_duration: task.estimated_duration,
      field_name: task.field_name,
      crop_type: task.crop_type,
      fpsi_impact_points: task.fpsi_impact_points,
      generation_source: task.generation_source,
      confidence_score: task.confidence_score,
      learning_tags: task.learning_tags,
      task_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data: savedTasks, error: saveError } = await supabase
      .from('daily_genius_tasks')
      .insert(tasksToSave)
      .select();

    if (saveError) {
      console.error('Error saving tasks:', saveError);
      throw new Error(`Failed to save tasks: ${saveError.message}`);
    }

    console.log(`✅ Successfully saved ${savedTasks?.length || 0} tasks to database`);

    // Log the AI service usage
    await supabase
      .from('ai_service_logs')
      .insert({
        user_id: userId,
        service_type: 'daily-task-generation',
        request_data: { 
          fields_count: fields?.length || 0,
          location: profile?.location 
        },
        response_data: { 
          tasks_generated: aiTasks.length,
          ai_source: 'gemini-2.5-flash' 
        },
        tokens_used: geminiData.usageMetadata?.totalTokenCount || 0,
        success: true
      });

    return new Response(JSON.stringify({
      success: true,
      tasks: savedTasks,
      count: savedTasks?.length || 0,
      ai_source: 'gemini-2.5-flash',
      tokens_used: geminiData.usageMetadata?.totalTokenCount || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-daily-tasks function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      ai_fallback_available: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});