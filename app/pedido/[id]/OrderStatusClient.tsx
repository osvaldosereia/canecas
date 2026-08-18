"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CreatedOrder } from "../../CheckoutForm";

const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function OrderStatusClient({ id, token }: { id: string; token: string }) {
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`/api/orders/${id}?token=${encodeURIComponent(token)}`, { cache: "no-store" });
        const result = await response.json() as CreatedOrder & { error?: string };
        if (!response.ok) throw new Error(result.error || "Pedido não encontrado.");
        if (active) setOrder(result);
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "Pedido não encontrado."); }
    };
    load();
    const timer = window.setInterval(load, 3000);
    return () => { active = false; window.clearInterval(timer); };
  }, [id, token]);

  const paid = order?.status === "paid";
  return <main className="order-status-page"><section><Link className="brand" href="/"><span className="brand-mark">C</span><span>canecas<small>feita do seu jeito</small></span></Link>{error ? <div className="status-content"><div className="error-mark">!</div><h1>Não encontramos este pedido</h1><p>{error}</p></div> : !order ? <div className="status-content"><div className="magic-loader">✦</div><h1>Consultando pagamento</h1><p>Aguarde um instante.</p></div> : <div className="status-content"><div className={paid ? "success-mark" : "pending-mark"}>{paid ? "✓" : "⌛"}</div><small>{paid ? "PAGAMENTO APROVADO" : "STATUS DO PEDIDO"}</small><h1>{paid ? "Pedido confirmado!" : order.status === "payment_rejected" ? "Pagamento não aprovado" : "Aguardando confirmação"}</h1><p>{paid ? "Sua caneca seguirá para produção. Você receberá as próximas atualizações pelos dados informados no pedido." : "O Mercado Pago pode levar alguns instantes para confirmar Pix, boleto ou cartão."}</p><div className="order-receipt"><p><span>Pedido</span><b>{String(order.id).slice(0, 8).toUpperCase()}</b></p><p><span>Quantidade</span><b>{order.quantity}</b></p><p><span>Entrega</span><b>{order.shippingServiceName}</b></p><p className="checkout-total"><span>Total</span><b>{money(order.totalCents)}</b></p></div>{!paid && order.checkoutUrl && <a className="status-primary" href={order.checkoutUrl}>Voltar ao pagamento</a>}</div>}<Link className="status-back" href="/">Voltar para os modelos</Link></section></main>;
}
