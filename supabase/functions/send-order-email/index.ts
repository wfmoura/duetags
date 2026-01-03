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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing Supabase Environment Variables')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    let body;
    try {
        body = await req.json()
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }

    const { orderId, target = 'both' } = body
    if (!orderId) {
        return new Response(JSON.stringify({ error: 'Missing orderId' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }

    // 3. Fetch Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
        throw new Error(`Order fetch failed or not found: ${orderError?.message}`)
    }

    // 4. Fetch User Metadata
    let userName = order.customer_name || 'Cliente'
    let userPhone = order.customer_phone || 'Não informado'
    let userEmail = order.customer_email || 'N/A'
    
    if (order.user_id && (!order.customer_name || !order.customer_email)) {
        try {
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(order.user_id)
            if (user && !userError) {
                userName = userName || user.user_metadata?.name || 'Cliente'
                userPhone = userPhone || user.user_metadata?.phone || 'Não informado'
                userEmail = userEmail || user.email || 'N/A'
            }
        } catch (uErr) {
            console.warn('User fetch exception:', uErr)
        }
    }

    const purchaseDate = order.created_at ? new Date(order.created_at).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')
    const customizations = order.customizations || {}
    const fullUrls = order.etiquetas_urls || []
    const originalAssetUrl = order.original_asset_url
    const labelMetadata = order.label_metadata || []

    const sendEmail = async (to: string | string[], subject: string, html: string) => {
        console.log(`Sending email to: ${to} | Subject: ${subject}`)
        if (!RESEND_API_KEY) {
            console.warn('RESEND_API_KEY missing, skipping real send.')
            return { id: 'simulated', success: true }
        }
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'DueTags <onboarding@resend.dev>', 
                to, 
                subject,
                html,
            }),
        })
        return res.json()
    }

    const results = []

    // TARGET: PRODUCTION
    if (target === 'production' || target === 'both') {
        const prodSubject = `Etiquetas para produção - ${userPhone} - ${userName} ${purchaseDate}`
        const colorInfo = `
            <p><strong>Cor Texto:</strong> ${customizations.textColor || 'N/A'}</p>
            <p><strong>Cor Fundo:</strong> ${customizations.corFundo || 'N/A'}</p>
            <p><strong>Fonte:</strong> ${customizations.fontFamily || 'N/A'}</p>
        `
        
        let imagesHtml = '<h3>Imagens para Produção</h3>';
        if (originalAssetUrl) {
            imagesHtml += `<h4>Ativo Original</h4><p><a href="${originalAssetUrl}">Download Original</a></p><img src="${originalAssetUrl}" width="200" style="border: 1px solid #ccc;" />`;
        }
        if (fullUrls.length > 0) {
            imagesHtml += '<h4>Etiquetas Finais</h4>';
            fullUrls.forEach((url: string, i: number) => {
                imagesHtml += `<p>Imagem ${i + 1}: <a href="${url}">Download</a></p><img src="${url}" width="300" style="border: 1px solid #ccc; margin-bottom:10px" />`
            })
        }

        const prodHtml = `
            <h1>Novo Pedido de Etiquetas - DueTags</h1>
            <h3>Dados do Cliente</h3>
            <p><strong>Nome:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Telefone:</strong> ${userPhone}</p>
            <hr/>
            <h3>Dados da Compra</h3>
            <p><strong>ID Pedido:</strong> ${order.id}</p>
            <p><strong>Kit:</strong> ${order.kit_nome || 'N/A'}</p>
            ${colorInfo}
            <hr/>
            ${imagesHtml}
            <hr/>
            <h3>Metadados Técnicos</h3>
            <pre style="background:#f4f4f4; padding:10px">${JSON.stringify(labelMetadata, null, 2)}</pre>
        `

        let emailsToNotify = ['wfmoura2@gmail.com']
        const { data: settings } = await supabase.from('system_settings').select('value').eq('key', 'order_notification_emails').single()
        if (settings?.value && Array.isArray(settings.value)) emailsToNotify = settings.value

        results.push({ type: 'production', data: await sendEmail(emailsToNotify, prodSubject, prodHtml) })
    }

    // TARGET: CLIENT
    if (target === 'client' || target === 'both') {
        if (userEmail && userEmail !== 'N/A') {
            const clientSubject = `DueTags - Confirmação do seu Pedido #${order.id.slice(0, 8)}`
            const clientHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #2956a4;">Olá ${userName}!</h2>
                    <p>Seu pedido na <strong>DueTags</strong> foi recebido com sucesso e já estamos cuidando de tudo.</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Número do Pedido:</strong> #${order.id.slice(0, 8)}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Kit:</strong> ${order.kit_nome}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Data:</strong> ${purchaseDate}</p>
                    </div>
                    <p>Você pode acompanhar o status do seu pedido clicando no botão abaixo:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://duetags.com.br/order/${order.id}" 
                           style="background: #2956a4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Ver Meu Pedido
                        </a>
                    </div>
                    <p>Qualquer dúvida, estamos à disposição!</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 11px; color: #999; text-align: center;">DueTags - Etiquetas que personalizam sua história.</p>
                </div>
            `
            results.push({ type: 'client', data: await sendEmail(userEmail, clientSubject, clientHtml) })
        } else {
            console.warn('Skipping client email: userEmail is missing or N/A')
        }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Fatal Function Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
