import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { message, language = 'nl' } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🤖 AI Voice request:', { userId: user.id, message, language });

    // TODO: In the future, integrate with:
    // - OpenAI GPT-4 for text generation
    // - ElevenLabs or Azure Speech for voice synthesis
    // - Context from marketing data for personalized responses
    
    // For now, return a simulated response
    const aiResponse = await simulateAIResponse(message, language);

    // Log conversation to database (optional)
    try {
      await supabase
        .from('ai_voice_conversations')
        .insert({
          user_id: user.id,
          user_message: message,
          ai_response: aiResponse.text,
          language,
          created_at: new Date().toISOString()
        });
    } catch (dbError) {
      console.warn('Failed to log conversation:', dbError);
      // Continue even if logging fails
    }

    return NextResponse.json({
      success: true,
      response: aiResponse
    });

  } catch (error) {
    console.error('❌ AI Voice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function simulateAIResponse(message: string, language: string) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const responses = {
    nl: {
      marketing: "Voor marketing kunnen we verschillende strategieën bespreken. Ik kan je helpen met campagne optimalisatie, doelgroep analyse, of budget planning. Waar wil je mee beginnen?",
      analytics: "Laten we je marketing analytics bekijken. Ik kan je helpen met het interpreteren van KPI's, conversion rates en ROI analyses. Welke metrics zijn het belangrijkst voor jou?",
      campaign: "Voor een effectieve campagne hebben we een duidelijke strategie nodig. Vertel me over je doelgroep, budget en gewenste resultaten. Dan kan ik je een gepersonaliseerd plan voorstellen.",
      content: "Content marketing is essentieel voor moderne marketing. Ik kan je helpen met content planning, SEO optimalisatie en engagement strategieën. Wat voor content wil je creëren?",
      budget: "Budget optimalisatie is cruciaal voor ROI. Ik kan je helpen met budget allocatie tussen verschillende kanalen en campagnes. Wat is je huidige marketing budget?",
      default: "Dat is een interessante vraag! Als je AI marketing assistent kan ik je helpen met strategieën, analyses, campagnes en optimalisaties. Vertel me meer over wat je wilt bereiken."
    },
    en: {
      marketing: "For marketing, we can discuss various strategies. I can help with campaign optimization, audience analysis, or budget planning. Where would you like to start?",
      analytics: "Let's look at your marketing analytics. I can help interpret KPIs, conversion rates, and ROI analyses. Which metrics are most important to you?",
      campaign: "For an effective campaign, we need a clear strategy. Tell me about your target audience, budget, and desired results. Then I can suggest a personalized plan.",
      content: "Content marketing is essential for modern marketing. I can help with content planning, SEO optimization, and engagement strategies. What kind of content do you want to create?",
      budget: "Budget optimization is crucial for ROI. I can help with budget allocation between different channels and campaigns. What's your current marketing budget?",
      default: "That's an interesting question! As your AI marketing assistant, I can help with strategies, analyses, campaigns, and optimizations. Tell me more about what you want to achieve."
    }
  };

  const langResponses = responses[language as keyof typeof responses] || responses.en;
  const lowerMessage = message.toLowerCase();

  let responseText = langResponses.default;

  if (lowerMessage.includes('marketing') || lowerMessage.includes('strategie')) {
    responseText = langResponses.marketing;
  } else if (lowerMessage.includes('analytics') || lowerMessage.includes('analyse') || lowerMessage.includes('data')) {
    responseText = langResponses.analytics;
  } else if (lowerMessage.includes('campagne') || lowerMessage.includes('campaign')) {
    responseText = langResponses.campaign;
  } else if (lowerMessage.includes('content') || lowerMessage.includes('inhoud')) {
    responseText = langResponses.content;
  } else if (lowerMessage.includes('budget') || lowerMessage.includes('geld') || lowerMessage.includes('kosten')) {
    responseText = langResponses.budget;
  }

  return {
    text: responseText,
    audioUrl: null, // TODO: Generate audio with TTS service
    confidence: 0.85 + Math.random() * 0.15,
    processingTime: Math.round(1000 + Math.random() * 2000)
  };
}

// Get conversation history
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get conversation history (last 50 messages)
    const { data: conversations, error: dbError } = await supabase
      .from('ai_voice_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (dbError) {
      console.warn('Failed to fetch conversations:', dbError);
      return NextResponse.json({
        success: true,
        conversations: []
      });
    }

    return NextResponse.json({
      success: true,
      conversations: conversations || []
    });

  } catch (error) {
    console.error('❌ Conversation history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 