import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, name, brand } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

    if (action === "description") {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{
            role: "user",
            content: `Você é um especialista em produtos eletrônicos e tecnologia. Para o produto "${name}"${brand ? ` da marca "${brand}"` : ''}, retorne APENAS as especificações técnicas reais no formato abaixo. Sem introdução, sem texto comercial, sem indicações de uso.

Formato exato:
Descrição: [1 frase descrevendo o produto]

Especificações Técnicas:
• Tela: [tamanho, tipo, resolução]
• Processador: [modelo, núcleos, velocidade]
• Memória RAM: [quantidade]
• Armazenamento: [capacidade]
• Câmera: [principal e frontal]
• Bateria: [capacidade mAh]
• Sistema Operacional: [versão]
• Conectividade: [Wi-Fi, Bluetooth, NFC, etc]
• Dimensões: [altura x largura x espessura]
• Peso: [gramas]
• Cores disponíveis: [cores]

Se o produto NÃO for eletrônico, adapte as especificações ao tipo do produto (material, dimensões, peso, capacidade, voltagem, etc).
Use APENAS dados reais e verificáveis. Se não souber o dado exato, omita o campo.
Responda APENAS com a descrição e especificações, sem markdown, sem título.`
          }],
        }),
      });
      const data = await response.json();
      const description = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ description }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "image") {
      if (!FIRECRAWL_API_KEY) {
        return new Response(JSON.stringify({ error: "FIRECRAWL_API_KEY not configured", images: [] }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const searchQuery = `${name}${brand ? ` ${brand}` : ''} produto foto oficial`;
      console.log("Searching images for:", searchQuery);

      // Use Firecrawl search to find product pages
      const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `${name}${brand ? ` ${brand}` : ''} product image high quality`,
          limit: 5,
          scrapeOptions: {
            formats: ["links", "html"],
          },
        }),
      });

      const searchData = await searchResponse.json();
      console.log("Firecrawl search status:", searchResponse.status);

      // Now use AI to extract image URLs from the search results
      const pagesContent = (searchData.data || []).map((r: any) => ({
        url: r.url,
        title: r.title,
        html: (r.html || "").substring(0, 3000),
      }));

      // Use AI to find actual image URLs from the scraped HTML
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          tools: [{
            type: "function",
            function: {
              name: "return_image_urls",
              description: "Return up to 4 real product image URLs extracted from HTML content",
              parameters: {
                type: "object",
                properties: {
                  images: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        url: { type: "string", description: "Direct URL to the product image (must start with https:// and be a real image URL)" },
                        source: { type: "string", description: "Source website name" },
                        is_main: { type: "boolean", description: "Whether this is the main/primary product image" }
                      },
                      required: ["url", "source", "is_main"],
                      additionalProperties: false
                    },
                    maxItems: 4
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
            content: `From the following search results about "${name}"${brand ? ` by "${brand}"` : ''}, extract up to 4 REAL product image URLs.

Look for <img> tags with src attributes that contain product photos. Prefer:
1. Large/high-resolution images (look for dimensions in URL or attributes)
2. Clean product photos on white/plain backgrounds
3. Official manufacturer images
4. Images from major retailers (Amazon, Magazine Luiza, Casas Bahia, etc)

IMPORTANT: Only return URLs that actually exist in the HTML. Do NOT make up URLs.
Mark the best/main product image as is_main: true (only one).

Search results:
${JSON.stringify(pagesContent, null, 2)}`
          }],
        }),
      });

      const aiData = await aiResponse.json();
      let images: { url: string; source: string; is_main: boolean }[] = [];
      try {
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          const parsed = JSON.parse(toolCall.function.arguments);
          images = parsed.images || [];
        }
      } catch (e) {
        console.error("Failed to parse tool call:", e);
      }

      // If no images found via search, try scraping a specific product page
      if (images.length === 0) {
        console.log("No images from search, trying direct scrape...");
        try {
          const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: `https://www.google.com/search?q=${encodeURIComponent(`${name} ${brand || ''} produto`)}&tbm=isch`,
              formats: ["links"],
            }),
          });
          const scrapeData = await scrapeResponse.json();
          const links = scrapeData.data?.links || scrapeData.links || [];
          const imgLinks = links.filter((l: string) => /\.(jpg|jpeg|png|webp)/i.test(l)).slice(0, 4);
          images = imgLinks.map((url: string, i: number) => ({ url, source: "Google Images", is_main: i === 0 }));
        } catch (e) {
          console.error("Fallback scrape failed:", e);
        }
      }

      console.log(`Found ${images.length} images`);
      return new Response(JSON.stringify({ images }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
