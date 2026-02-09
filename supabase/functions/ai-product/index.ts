import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, name, brand } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (action === "description") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{
            role: "user",
            content: `Você é um especialista em produtos. Gere uma descrição COMPLETA e REAL para o produto: "${name}"${brand ? ` da marca "${brand}"` : ''}.

A descrição deve conter:
1. Uma breve introdução comercial (2-3 frases)
2. Especificações técnicas REAIS e PRECISAS do produto (material, dimensões, peso, capacidade, voltagem, potência, etc — o que for aplicável)
3. Principais características e diferenciais
4. Indicações de uso

Use dados reais e precisos. NÃO invente especificações. Se não souber dados exatos, use faixas típicas para esse tipo de produto.
Formate em texto corrido com parágrafos, sem usar markdown. Responda APENAS com a descrição, sem título.`
          }],
        }),
      });
      const data = await response.json();
      const description = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ description }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "image") {
      // Use AI to search and find real product images from the web
      const searchQuery = `${name}${brand ? ` ${brand}` : ''} product photo`;
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          tools: [{
            type: "function",
            function: {
              name: "return_image_urls",
              description: "Return up to 3 real product image URLs found on the internet",
              parameters: {
                type: "object",
                properties: {
                  images: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        url: { type: "string", description: "Direct URL to the product image (must be a real, accessible image URL ending in .jpg, .png, .webp or from a known CDN)" },
                        source: { type: "string", description: "Source website name" }
                      },
                      required: ["url", "source"]
                    },
                    maxItems: 3
                  }
                },
                required: ["images"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "return_image_urls" } },
          messages: [{
            role: "user",
            content: `Find up to 3 real product images for: "${name}"${brand ? ` by "${brand}"` : ''}. 
Return ONLY real, publicly accessible image URLs from e-commerce sites, manufacturer sites, or product databases.
The images should show the actual product clearly on a clean background.
Prefer high-quality product photos from sources like Amazon, manufacturer websites, or major retailers.`
          }],
        }),
      });
      const data = await response.json();
      
      let images: { url: string; source: string }[] = [];
      try {
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          const parsed = JSON.parse(toolCall.function.arguments);
          images = parsed.images || [];
        }
      } catch (e) {
        console.error("Failed to parse tool call:", e);
      }

      return new Response(JSON.stringify({ images }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
