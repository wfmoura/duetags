import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getBaseHtml = (title: string, innerHtml: string, isClient: boolean = true) => {
    const primaryColor = "#26a69a";
    const secondaryColor = "#bab3ff";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc; }
    .wrapper { padding: 20px; }
    .container { background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: white; padding: 45px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 15px; font-weight: 500; }
    .content { padding: 35px; }
    .order-tag { display: inline-block; background: #f1f5f9; color: #64748b; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 99px; text-transform: uppercase; margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 30px 0 15px 0; display: flex; align-items: center; }
    .card { background: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #f1f5f9; margin-bottom: 20px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 12px; }
    .info-row:last-child { margin-bottom: 0; border-bottom: 0; padding-bottom: 0; }
    .label { font-size: 13px; color: #64748b; font-weight: 500; }
    .value { font-size: 14px; color: #1e293b; font-weight: 700; }
    .button-container { text-align: center; margin: 40px 0 20px; }
    .button { background: ${primaryColor}; color: white !important; padding: 16px 32px; border-radius: 16px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(38, 166, 154, 0.2), 0 2px 4px -1px rgba(38, 166, 154, 0.1); }
    .footer { text-align: center; padding: 40px 20px; font-size: 13px; color: #94a3b8; }
    .highlight { color: ${primaryColor}; }
    .technical-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
    .img-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 15px; }
    .img-item { background: white; padding: 8px; border: 1px solid #f1f5f9; border-radius: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>${title}</h1>
        <p>DueTags - Studio Criativo</p>
      </div>
      <div class="content">
        ${innerHtml}
      </div>
    </div>
    <div class="footer">
      <strong>DueTags</strong> • Etiquetas que personalizam sua história.<br/>
      &copy; ${new Date().getFullYear()} DueTags. Todos os direitos reservados.
    </div>
  </div>
</body>
</html>
  `
}

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

        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single()

        if (orderError || !order) throw orderError || new Error('Order not found')

        const userName = order.customer_name || 'Cliente'
        const firstName = userName.split(' ')[0]
        const userEmail = order.customer_email || 'N/A'
        const userPhone = order.customer_phone || order.phone || 'Não informado'
        const purchaseDate = order.created_at ? new Date(order.created_at).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')
        const fullUrls = order.etiquetas_urls || []
        const originalAssetUrl = order.original_asset_url

        const sendEmail = async (to: string | string[], subject: string, html: string) => {
            if (!smtpUser || !smtpPass) return false;

            const client = new SMTPClient({
                connection: {
                    hostname: smtpHost,
                    port: smtpPort,
                    tls: true,
                    auth: {
                        username: smtpUser,
                        password: smtpPass,
                    },
                },
            });

            try {
                await client.send({
                    from: `DueTags <${smtpUser}>`,
                    to: Array.isArray(to) ? to.join(',') : to,
                    subject: subject,
                    content: "Visualize em HTML",
                    html: html,
                });
                return true;
            } catch (err) {
                console.error("SMTP Error:", err);
                return false;
            }
        };

        const results = []

        // TARGET: PRODUCTION
        if (target === 'production' || target === 'both') {
            const prodSubject = `🏷️ Produção: Novo Pedido #${order.id.slice(0, 8)} - ${userName}`

            let imagesHtml = '<div class="section-title">📂 Arquivos para Produção</div>';
            if (originalAssetUrl) {
                imagesHtml += `
                    <div class="technical-card">
                        <div class="value" style="margin-bottom:8px">Arte Original (Alta Resolução)</div>
                        <a href="${originalAssetUrl}" style="color: #26a69a; text-decoration: none; font-size: 13px; font-weight: 700;">[Baixar Original]</a><br/>
                        <img src="${originalAssetUrl}" width="180" style="margin-top:10px; border:2px solid #f1f5f9; border-radius:12px" />
                    </div>`;
            }

            if (fullUrls.length > 0) {
                imagesHtml += '<p class="label"><strong>Etiquetas Processadas:</strong></p><div class="img-grid">';
                fullUrls.forEach((url: string, i: number) => {
                    imagesHtml += `
                        <div class="img-item">
                            <img src="${url}" width="140" style="border-radius:8px; margin-bottom:5px;" /><br/>
                            <a href="${url}" style="font-size:11px; color:#26a69a; font-weight:bold; text-decoration:none;">ETIQUETA ${i + 1}</a>
                        </div>`
                })
                imagesHtml += '</div>';
            }

            const prodInner = `
                <div class="order-tag">Pedido #${order.id.slice(0, 8)}</div>
                <p style="font-size: 16px;">Novo pedido customizado pronto para processamento.</p>
                
                <div class="section-title">👤 Dados do Cliente</div>
                <div class="card">
                    <div class="info-row"><span class="label">Nome:</span><span class="value">${userName}</span></div>
                    <div class="info-row"><span class="label">E-mail:</span><span class="value">${userEmail}</span></div>
                    <div class="info-row"><span class="label">WhatsApp:</span><span class="value">${userPhone}</span></div>
                </div>

                <div class="section-title">📦 Detalhes da Venda</div>
                <div class="card">
                    <div class="info-row"><span class="label">Kit:</span><span class="value" style="color: #26a69a;">${order.kit_nome || 'Personalizado'}</span></div>
                    <div class="info-row"><span class="label">Data:</span><span class="value">${purchaseDate}</span></div>
                    <div class="info-row"><span class="label">Valor:</span><span class="value">R$ ${Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                </div>

                ${imagesHtml}

                <div class="button-container">
                    <p style="font-size: 12px; color: #64748b; margin-bottom: 20px;">Acesse para gerenciar metadados, reenviar e-mails ou atualizar status:</p>
                    <a href="https://duetags.vercel.app/admin/order/${order.id}" class="button">Ver Pedido no Painel Admin 🛠️</a>
                </div>
            `

            let adminEmails = ['wfmoura2@gmail.com']
            const { data: settings } = await supabaseClient.from('system_settings').select('value').eq('key', 'order_notification_emails').single()
            if (settings?.value) adminEmails = settings.value

            const res = await sendEmail(adminEmails, prodSubject, getBaseHtml('Nova Produção', prodInner, false))
            results.push({ target: 'production', status: res })
        }

        // TARGET: CLIENT
        if (target === 'client' || target === 'both') {
            if (userEmail && userEmail !== 'N/A') {
                const clientInner = `
                    <div class="order-tag">Pedido #${order.id.slice(0, 8)}</div>
                    <p style="font-size: 18px;">Oi <span class="highlight">${firstName}</span>! ✨</p>
                    <p>Recebemos seu pedido aqui na <strong>DueTags</strong> com sucesso!</p>
                    <p>Nossa equipe já está cuidando de tudo para garantir que suas etiquetas fiquem perfeitas.</p>
                    
                    <div class="section-title">📋 Seu Pedido</div>
                    <div class="card">
                        <div class="info-row"><span class="label">Kit:</span><span class="value">${order.kit_nome}</span></div>
                        <div class="info-row"><span class="label">Valor:</span><span class="value">R$ ${Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                    </div>

                    <div class="button-container">
                        <a href="https://duetags.vercel.app/order/${order.id}" class="button">Acompanhar Meu Pedido 🚀</a>
                    </div>
                `
                const res = await sendEmail(userEmail, `🎉 Oba! Recebemos seu pedido, ${firstName}!`, getBaseHtml('Tudo Certo!', clientInner, true))
                results.push({ target: 'client', status: res })
            }
        }

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
        })
    }
})
