import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN')

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const body = await req.json()
    console.log('Webhook MP recebido:', body)

    // Mercado Pago envia o ID do pagamento no corpo
    // Tipo 'payment' é o que nos interessa
    if (body.type === 'payment' && body.data && body.data.id) {
      const paymentId = body.data.id

      // Consultar status do pagamento na API do Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`
        }
      })

      if (!mpResponse.ok) {
        throw new Error(`Erro ao consultar MP: ${mpResponse.statusText}`)
      }

      const paymentData = await mpResponse.json()
      console.log('Dados do pagamento MP:', paymentData)

      // External Reference é o ID do nosso pedido (order_id)
      const orderId = paymentData.external_reference
      const status = paymentData.status

      if (orderId && status === 'approved') {
        // Atualizar status do pedido para 'completado'
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'completed',
            payment_status: 'paid'
          })
          .eq('id', orderId)

        if (updateError) throw updateError
        console.log(`Pedido ${orderId} marcado como pago via Webhook.`)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Erro no Webhook:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
