import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { order_id } = await req.json()

        // Get order details
        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .single()

        if (orderError) throw orderError

        // Prepare metadata summary for the email
        let technicalDetailsHtml = ''
        if (order.label_metadata && Array.isArray(order.label_metadata)) {
            technicalDetailsHtml = order.label_metadata.map((label: any, idx: number) => `
        <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
          <h4 style="margin-top: 0; color: #26a69a;">Etiqueta ${idx + 1}: ${label.etiqueta_nome || 'N/A'}</h4>
          <p><strong>Fundo:</strong> <span style="display:inline-block; width:12px; height:12px; background:${label.background?.color}; border:1px solid #ccc; margin-right:5px;"></span> ${label.background?.color || 'N/A'} (CMYK: ${label.background?.cmyk ? `C:${label.background.cmyk.c} M:${label.background.cmyk.m} Y:${label.background.cmyk.y} K:${label.background.cmyk.k}` : 'N/A'})</p>
          <div style="margin-left: 10px;">
            ${label.texts?.map((t: any) => `
              <div style="margin-bottom: 10px; padding-left: 10px; border-left: 2px solid #bab3ff;">
                <p style="margin: 2px 0;"><strong>Texto:</strong> "${t.text}"</p>
                <p style="margin: 2px 0; font-size: 12px; color: #666;">
                  Fonte: ${t.style?.fontFamily} | Tamanho: ${t.style?.fontSize} | Cor: ${t.style?.color}<br/>
                  Posição: X: ${t.position?.raw_x || t.position?.x} | Y: ${t.position?.raw_y || t.position?.y}
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')
        }

        // HTML Template based on user request for premium design
        const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #26a69a 0%, #bab3ff 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px; }
          .order-id { font-size: 14px; color: #666; margin-bottom: 20px; }
          .section-title { font-size: 18px; font-weight: bold; color: #26a69a; border-bottom: 2px solid #e0f2f1; padding-bottom: 8px; margin-top: 30px; margin-bottom: 15px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .info-item { background: #fdfdfd; padding: 10px; border-radius: 6px; border: 1px solid #f0f0f0; }
          .info-label { font-size: 12px; color: #999; text-transform: uppercase; }
          .info-value { font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin:0;">🎉 Novo Pedido Realizado!</h1>
          <p style="margin:5px 0 0 0; opacity: 0.9;">DueTags - Studio Criativo</p>
        </div>
        <div class="content">
          <div class="order-id">Pedido ID: #${order.id.slice(0, 8)}</div>
          
          <p>Olá! Você recebeu um novo pedido de <strong>${order.customer_email}</strong> no valor de <strong>R$ ${order.total_amount}</strong>.</p>
          
          <div class="section-title">📦 Resumo do Pedido</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Kit Selecionado</div>
              <div class="info-value">${order.kit_nome}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tema</div>
              <div class="info-value">${order.tema_nome}</div>
            </div>
          </div>

          ${technicalDetailsHtml ? `
            <div class="section-title">🛠️ Detalhes Técnicos de Produção</div>
            <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Estes detalhes garantem a fidelidade do design caso precise ser reproduzido manualmente.</p>
            ${technicalDetailsHtml}
          ` : ''}

          <div class="section-title">🚚 Entrega</div>
          <p>
            <strong>Método:</strong> ${order.delivery_method === 'pickup' ? 'Retirada no Local' : 'Entrega via Uber'}<br/>
            ${order.delivery_method === 'uber' ? `
              <strong>Endereço:</strong> ${order.delivery_info?.rua}, ${order.delivery_info?.numero} ${order.delivery_info?.complemento ? `(${order.delivery_info.complemento})` : ''}<br/>
              <strong>Bairro:</strong> ${order.delivery_info?.bairro} | <strong>CEP:</strong> ${order.delivery_info?.cep}<br/>
              <strong>Cidade:</strong> ${order.delivery_info?.cidade} - ${order.delivery_info?.estado}
            ` : ''}
          </p>

          <div style="margin-top: 40px; text-align: center; border-top: 2px dashed #eee; padding-top: 20px;">
            <a href="https://duetags.vercel.app/pedidos" style="background: #26a69a; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Visualizar no Painel do Admin</a>
          </div>
        </div>
        <div class="footer">
          Design gerado digitalmente por DueTags.<br/>
          &copy; ${new Date().getFullYear()} DueTags - Todos os direitos reservados.
        </div>
      </body>
      </html>
    `

        // IMPORTANT: Here you would integrate with your SMTP/Email provider.
        // If you're using Resend:
        /*
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          },
          body: JSON.stringify({
            from: 'DueTags <producao@duetags.com.br>',
            to: ['wfmoura2@gmail.com'], // Or the admin email
            subject: `Novo Pedido #${order.id.slice(0, 8)} - ${order.customer_email}`,
            html: emailHtml,
          }),
        })
        */

        return new Response(JSON.stringify({ success: true, message: 'Email summary generated' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
