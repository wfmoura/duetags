import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getBaseHtml = (title: string, innerHtml: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f6; }
    .container { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e0e0e0; }
    .header { background: linear-gradient(135deg, #26a69a 0%, #bab3ff 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 30px; }
    .order-id { font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; display: block; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    .section-title { font-size: 18px; font-weight: bold; color: #26a69a; margin-top: 30px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
    .info-grid { background: #f9f9f9; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #f0f0f0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .info-label { color: #888; font-size: 13px; }
    .info-value { font-weight: 600; color: #333; }
    .button-container { text-align: center; margin: 40px 0 20px 0; }
    .button { background: #26a69a; color: white !important; padding: 14px 35px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block; transition: transform 0.2s; }
    .footer { text-align: center; padding: 30px; font-size: 12px; color: #999; }
    .highlight { color: #26a69a; font-weight: bold; }
    .technical-card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 28px;">${title}</h1>
      <p style="margin:5px 0 0 0; opacity: 0.9; font-size: 16px;">DueTags - Studio Criativo</p>
    </div>
    <div class="content">
      ${innerHtml}
    </div>
    <div class="footer">
      DueTags - Etiquetas que personalizam sua história.<br/>
      &copy; ${new Date().getFullYear()} DueTags - Todos os direitos reservados.
    </div>
  </div>
</body>
</html>
`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const smtpUser = Deno.env.get('GOOGLE_SMTP_USER')
    const smtpPass = Deno.env.get('GOOGLE_SMTP_PASS')
    const smtpHost = Deno.env.get('GOOGLE_SMTP_HOST') || 'smtp.gmail.com'
    const smtpPort = parseInt(Deno.env.get('GOOGLE_SMTP_PORT') || '587')

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    const { orderId, target = 'both' } = await req.json()

    // Fetch order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) throw orderError || new Error('Order not found')

    // Fetch User Info
    let userName = order.customer_name || 'Cliente'
    let userEmail = order.customer_email || 'N/A'
    let userPhone = order.customer_phone || 'Não informado'

    const purchaseDate = order.created_at ? new Date(order.created_at).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')
    const customizations = order.customizations || {}
    const fullUrls = order.etiquetas_urls || []
    const originalAssetUrl = order.original_asset_url
    const labelMetadata = order.label_metadata || []

    const sendEmail = async (to: string | string[], subject: string, html: string) => {
      console.log(`Sending email to: ${to} via Google SMTP`)
      if (!smtpUser || !smtpPass) {
        console.warn('SMTP Credentials missing, skipping send.')
        return { success: false, error: 'Credentials missing' }
      }

      const client = new SmtpClient();
      try {
        await client.connectTLS({
          hostname: smtpHost,
          port: smtpPort,
          username: smtpUser,
          password: smtpPass,
        });

        const recipients = Array.isArray(to) ? to : [to];
        for (const recipient of recipients) {
          await client.send({
            from: `DueTags <${smtpUser}>`,
            to: recipient,
            subject: subject,
            content: "Seu cliente de e-mail não suporta HTML.",
            html: html,
          });
        }
        await client.close();
        return { success: true }
      } catch (err) {
        console.error('SMTP Error:', err)
        return { success: false, error: err.message }
      }
    }

    const results = []

    // TARGET: PRODUCTION
    if (target === 'production' || target === 'both') {
      const prodSubject = `🏷️ Produção: Novo Pedido #${order.id.slice(0, 8)} - ${userName}`
      let imagesHtml = '<div class="section-title">📂 Arquivos para Produção</div>';

      if (originalAssetUrl) {
        imagesHtml += `
                    <div class="technical-card">
                        <strong>Arte Original (Alta Resolução)</strong><br/>
                        <a href="${originalAssetUrl}" style="color: #26a69a; text-decoration: none;">Download Original</a><br/>
                        <img src="${originalAssetUrl}" width="150" style="margin-top:10px; border:1px solid #ddd; border-radius:4px" />
                    </div>`;
      }
      if (fullUrls.length > 0) {
        imagesHtml += '<p><strong>Etiquetas Geradas:</strong></p><div style="display:flex; flex-wrap:wrap; gap:10px;">';
        fullUrls.forEach((url: string, i: number) => {
          imagesHtml += `
                        <div style="text-align:center;">
                            <img src="${url}" width="180" style="border:1px solid #ddd; border-radius:4px; margin-bottom:5px;" /><br/>
                            <a href="${url}" style="font-size:11px; color:#26a69a;">Imagem ${i + 1}</a>
                        </div>`
        })
        imagesHtml += '</div>';
      }

      const prodInner = `
                <span class="order-id">Pedido ID: #${order.id}</span>
                <p>Olá Equipe DueTags! Temos um novo pedido pronto para entrar na fila de produção.</p>
                <div class="section-title">👤 Dados do Cliente</div>
                <div class="info-grid">
                    <div class="info-row"><span class="info-label">Nome:</span><span class="info-value">${userName}</span></div>
                    <div class="info-row"><span class="info-label">E-mail:</span><span class="info-value">${userEmail}</span></div>
                    <div class="info-row"><span class="info-label">Telefone:</span><span class="info-value">${userPhone}</span></div>
                </div>
                <div class="section-title">📦 Detalhes do Pedido</div>
                <div class="info-grid">
                    <div class="info-row"><span class="info-label">Kit:</span><span class="info-value">${order.kit_nome || 'N/A'}</span></div>
                    <div class="info-row"><span class="info-label">Data:</span><span class="info-value">${purchaseDate}</span></div>
                </div>
                ${imagesHtml}
                <div class="button-container">
                    <a href="https://duetags.vercel.app/pedidos" class="button">Painel Admin</a>
                </div>
            `

      let adminEmails = ['wfmoura2@gmail.com']
      const { data: settings } = await supabaseClient.from('system_settings').select('value').eq('key', 'order_notification_emails').single()
      if (settings?.value) adminEmails = settings.value

      results.push({ target: 'production', status: await sendEmail(adminEmails, prodSubject, getBaseHtml('Resumo de Produção', prodInner)) })
    }

    // TARGET: CLIENT
    if (target === 'client' || target === 'both') {
      if (userEmail && userEmail !== 'N/A') {
        const clientSubject = `🎉 Oba! Recebemos seu pedido #${order.id.slice(0, 8)} - DueTags`
        const clientInner = `
                    <p style="font-size: 18px;">Olá <span class="highlight">${userName}</span>!</p>
                    <p>Que alegria ter você por aqui! Seu pedido na <strong>DueTags</strong> foi recebido com sucesso e já estamos cuidando de tudo para que suas etiquetas fiquem perfeitas.</p>
                    <div class="section-title">📋 Resumo da sua Escolha</div>
                    <div class="info-grid">
                        <div class="info-row"><span class="info-label">Número do Pedido:</span><span class="info-value">#${order.id.slice(0, 8)}</span></div>
                        <div class="info-row"><span class="info-label">Kit Selecionado:</span><span class="info-value">${order.kit_nome}</span></div>
                        <div class="info-row"><span class="info-label">Data:</span><span class="info-value">${purchaseDate}</span></div>
                    </div>
                    <div class="button-container">
                        <a href="https://duetags.vercel.app/order/${order.id}" class="button">Acompanhar Meu Pedido</a>
                    </div>
                `
        results.push({ target: 'client', status: await sendEmail(userEmail, clientSubject, getBaseHtml('Pedido Confirmado!', clientInner)) })
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
