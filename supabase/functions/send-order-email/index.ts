import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validate Environment
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing Supabase Environment Variables')
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    )

    // 2. Parse Body
    let body;
    try {
        body = await req.json()
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid request body', details: e.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }

    const { orderId } = body
    if (!orderId) {
        return new Response(JSON.stringify({ error: 'Missing orderId' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }

    console.log(`Processing order: ${orderId}`)

    // 3. Fetch Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError) {
        console.error('Order Fetch Error:', orderError)
        throw new Error(`Order fetch failed: ${orderError.message}`)
    }
    if (!order) {
        throw new Error('Order not found')
    }

    // 4. Fetch User (Graceful Fallback)
    let userName = 'Cliente'
    let userPhone = 'Não informado'
    let userEmail = 'N/A'
    
    if (order.user_id) {
        try {
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(order.user_id)
            if (userError) {
                console.warn('User fetch error:', userError)
            } else if (user) {
                userName = user.user_metadata?.name || 'Cliente'
                userPhone = user.user_metadata?.phone || 'Não informado'
                userEmail = user.email || 'N/A'
            }
        } catch (uErr) {
            console.warn('User fetch exception:', uErr)
        }
    } else {
        console.warn('No user_id in order')
    }

    const purchaseDate = order.created_at ? new Date(order.created_at).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')

    // 5. Prepare Email Content
    const subject = `Etiquetas para produção - ${userPhone} - ${userName} ${purchaseDate}`

    const customizations = order.customizations || {}
    const fullUrls = order.etiquetas_urls || []
    const originalAssetUrl = order.original_asset_url
    const labelMetadata = order.label_metadata || []

    const colorInfo = `
      <p><strong>Cor Texto:</strong> ${customizations.textColor || 'N/A'} (RGB: ${JSON.stringify(customizations.textColorRgb || {})}, CMYK: ${JSON.stringify(customizations.textColorCmyk || {})})</p>
      <p><strong>Cor Fundo:</strong> ${customizations.corFundo || 'N/A'} (RGB: ${JSON.stringify(customizations.corFundoRgb || {})}, CMYK: ${JSON.stringify(customizations.corFundoCmyk || {})})</p>
      <p><strong>Fonte:</strong> ${customizations.fontFamily || 'N/A'}</p>
      <p><strong>Estilos:</strong> ${customizations.isBold ? 'Negrito ' : ''}${customizations.isItalic ? 'Itálico' : ''}</p>
      <p><strong>Efeito Aura:</strong> ${customizations.enableAura ? 'Ativado' : 'Desativado'}</p>
    `

    const purchaseInfo = `
      <h3>Dados da Compra</h3>
      <p><strong>ID Pedido:</strong> ${order.id}</p>
      <p><strong>Kit:</strong> ${order.kit_nome || 'N/A'}</p>
      <p><strong>Tema:</strong> ${order.tema_nome || 'N/A'}</p>
      <p><strong>Total:</strong> R$ ${order.total_amount || '0,00'}</p>
    `

    const clientInfo = `
      <h3>Dados do Cliente</h3>
      <p><strong>Nome:</strong> ${userName}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Telefone:</strong> ${userPhone}</p>
    `

    let imagesHtml = '<h3>Imagens para Produção</h3>';
    if (originalAssetUrl) {
        imagesHtml += `<h4>Ativo Original (IA/Tema)</h4><p><a href="${originalAssetUrl}">Download Original</a></p><img src="${originalAssetUrl}" width="200" style="border: 1px solid #ccc;" />`;
    }

    if (fullUrls.length > 0) {
        imagesHtml += '<h4>Etiquetas Finais (Alta Resolução)</h4><div style="display: flex; flex-wrap: wrap; gap: 10px;">';
        fullUrls.forEach((url: string, index: number) => {
            imagesHtml += `<div style="margin-bottom: 20px;"><p>Imagem ${index + 1}: <a href="${url}">Download</a></p><img src="${url}" width="300" style="border: 1px solid #ccc;" /></div>`
        });
        imagesHtml += '</div>';
    }

    const metadataHtml = `
      <h3>Metadados Técnicos (JSON)</h3>
      <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px; font-size: 12px;">${JSON.stringify(labelMetadata, null, 2)}</pre>
    `

    const htmlContent = `
      <h1>Novo Pedido de Etiquetas - DueTags</h1>
      ${clientInfo}
      <hr/>
      ${purchaseInfo}
      <hr/>
      <h3>Metadados de Cor e Estilo</h3>
      ${colorInfo}
      <hr/>
      ${imagesHtml}
      <hr/>
      ${metadataHtml}
    `

    // 6. Fetch Recipient Emails from system_settings
    let emailsToNotify = ['wfmoura2@gmail.com']
    try {
        const { data: settings, error: settingsError } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'order_notification_emails')
            .single()
        
        if (!settingsError && settings?.value && Array.isArray(settings.value)) {
            emailsToNotify = settings.value
        } else {
            console.warn('Using default email notification list. Reason:', settingsError?.message || 'Invalid value in DB')
        }
    } catch (sErr) {
        console.warn('Failed to fetch system_settings:', sErr)
    }

    // 7. Send Email
    if (!RESEND_API_KEY) {
        console.warn('Missing RESEND_API_KEY')
        return new Response(JSON.stringify({ 
            message: "Email simulated (RESEND_API_KEY missing)", 
            subject, 
            debug_info: { userName, orderId, recipients: emailsToNotify }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev', 
        to: emailsToNotify, 
        subject: subject,
        html: htmlContent,
      }),
    })

    let data;
    try {
        data = await res.json()
    } catch (jsonErr) {
        console.error('Resend Response Parsing Error:', jsonErr)
        data = { error: 'Failed to parse Resend response', status: res.status }
    }

    if (!res.ok) {
        console.error('Resend API Error:', data)
        return new Response(JSON.stringify({ error: 'Resend API Error', details: data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Fatal Function Error:', error)
    return new Response(JSON.stringify({ 
        error: error.message, 
        stack: error.stack 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
