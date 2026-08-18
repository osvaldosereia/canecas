"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Tab = "overview" | "orders" | "generations";
type Order = {
  id: string; status: string; paymentStatus: string; quantity: number; totalCents: number; shippingPriceCents: number;
  shippingServiceName: string; shippingCompany: string; shippingMinDays: number | null; shippingMaxDays: number | null;
  postalCode: string; address: string; addressNumber: string; complement: string; district: string; city: string; state: string;
  paymentId: string | null; mode: string; trackingCode: string; trackingUrl: string; adminNotes: string; createdAt: string; updatedAt: string;
  personalizationId: string | null; modelTitle: string | null; artName: string | null; phrase: string | null;
  customerName: string | null; customerEmail: string | null; customerPhone: string | null; artImageUrl: string | null; mugMockupUrl: string | null;
};
type Generation = { id: string; modelTitle: string; artName: string; customerName: string; status: string; mode: string; error: string | null; artImageUrl: string | null; mugMockupUrl: string | null; createdAt: string };

const stages = [
  ["awaiting_payment", "Aguardando pagamento"], ["paid", "Pago"], ["awaiting_production", "Aguardando produção"],
  ["in_production", "Em produção"], ["produced", "Produzido"], ["shipped", "Enviado"],
  ["delivered", "Entregue"], ["cancelled", "Cancelado"], ["refunded", "Reembolsado"],
] as const;
const stageName = (status: string) => stages.find(([value]) => value === status)?.[1] ?? status.replaceAll("_", " ");
const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
const shortDate = (value: string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
const sameDay = (value: string) => new Date(value).toDateString() === new Date().toDateString();

export default function AdminDashboard({ userDisplayName }: { userDisplayName: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      const result = await response.json() as { orders?: Order[]; generations?: Generation[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Não foi possível carregar o painel.");
      setOrders(result.orders ?? []); setGenerations(result.generations ?? []);
      setSelected(current => current ? (result.orders ?? []).find(order => order.id === current.id) ?? null : null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar o painel."); }
    finally { setLoading(false); }
  };
  useEffect(() => { const initial = window.setTimeout(load, 0); const timer = window.setInterval(load, 30000); return () => { window.clearTimeout(initial); window.clearInterval(timer); }; }, []);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(""), 2400); return () => window.clearTimeout(timer); }, [notice]);

  const visibleOrders = useMemo(() => orders.filter(order => {
    const matchesStatus = filter === "all" || order.status === filter;
    const haystack = `${order.id} ${order.customerName} ${order.customerEmail} ${order.customerPhone} ${order.modelTitle}`.toLowerCase();
    return matchesStatus && haystack.includes(query.trim().toLowerCase());
  }), [orders, filter, query]);
  const metrics = useMemo(() => ({
    today: orders.filter(order => sameDay(order.createdAt)).length,
    paidToday: orders.filter(order => sameDay(order.createdAt) && !["awaiting_payment", "cancelled", "refunded"].includes(order.status)).reduce((sum, order) => sum + order.totalCents, 0),
    production: orders.filter(order => ["paid", "awaiting_production", "in_production"].includes(order.status)).length,
    shipping: orders.filter(order => ["produced", "shipped"].includes(order.status)).length,
  }), [orders]);
  const waitingGenerations = generations.filter(item => ["queued", "processing"].includes(item.status)).length;

  const updateOrder = async (draft: Order) => {
    const response = await fetch(`/api/admin/orders/${draft.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: draft.status, trackingCode: draft.trackingCode, trackingUrl: draft.trackingUrl, adminNotes: draft.adminNotes }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setNotice(result.error || "Não foi possível salvar."); return; }
    setNotice("Pedido atualizado"); await load();
  };

  const orderList = <div className="admin-order-list">{visibleOrders.length ? visibleOrders.map(order => <button key={order.id} className="admin-order-row" onClick={() => setSelected(order)}>
    <span className="order-number">#{order.id.slice(0, 8).toUpperCase()}<small>{shortDate(order.createdAt)}</small></span>
    <span><strong>{order.customerName || "Cliente"}</strong><small>{order.modelTitle || "Caneca personalizada"} · {order.quantity} un.</small></span>
    <b>{money(order.totalCents)}</b><i className={`order-stage ${order.status}`}>{stageName(order.status)}</i><span className="row-arrow">›</span>
  </button>) : <div className="admin-empty"><span>□</span><h2>Nenhum pedido encontrado</h2><p>Ajuste os filtros ou aguarde um novo pedido.</p></div>}</div>;

  return <main className="admin-shell">
    <aside className="admin-sidebar"><Link className="brand admin-brand" href="/"><span className="brand-mark">C</span><span>canecas<small>administração</small></span></Link><nav aria-label="Seções do painel">
      <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>▦ <span>Visão geral</span></button>
      <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>□ <span>Pedidos</span>{orders.length > 0 && <b>{orders.length}</b>}</button>
      <button className={tab === "generations" ? "active" : ""} onClick={() => setTab("generations")}>✦ <span>Personalizações</span>{waitingGenerations > 0 && <b>{waitingGenerations}</b>}</button>
    </nav><div className="admin-user"><div>{userDisplayName.slice(0, 2).toUpperCase()}</div><span><strong>{userDisplayName}</strong><small>Administrador</small></span></div></aside>
    <section className="admin-main"><header className="admin-header"><div><span className="eyebrow">OPERAÇÃO EM TEMPO REAL</span><h1>{tab === "overview" ? "Visão geral" : tab === "orders" ? "Pedidos" : "Personalizações com IA"}</h1><p className="demo-label">Atualização automática a cada 30 segundos</p></div><div className="admin-header-actions"><button onClick={() => { setLoading(true); load(); }}>↻ Atualizar</button><Link href="/">Ver site</Link></div></header>
      {error && <div className="admin-error" role="alert">{error}<button onClick={load}>Tentar novamente</button></div>}
      {loading ? <div className="admin-loading"><span className="magic-loader">✦</span>Carregando operação…</div> : <>
        {tab === "overview" && <><div className="metric-grid"><article><span>Pedidos hoje</span><strong>{metrics.today}</strong><small>entradas registradas</small></article><article><span>Vendas de hoje</span><strong>{money(metrics.paidToday)}</strong><small>pagas ou em atendimento</small></article><article><span>Para produzir</span><strong>{metrics.production}</strong><small>pagos e em produção</small></article><article><span>Para entregar</span><strong>{metrics.shipping}</strong><small>prontos ou enviados</small></article></div><section className="admin-panel"><div className="panel-title"><div><span>Pedidos recentes</span><small>Pagamento, produção e entrega</small></div><button onClick={() => setTab("orders")}>Ver todos</button></div>{orders.length ? <div className="admin-order-list compact">{orders.slice(0, 7).map(order => <button key={order.id} className="admin-order-row" onClick={() => setSelected(order)}><span className="order-number">#{order.id.slice(0, 8).toUpperCase()}<small>{shortDate(order.createdAt)}</small></span><span><strong>{order.customerName}</strong><small>{order.modelTitle} · {order.quantity} un.</small></span><b>{money(order.totalCents)}</b><i className={`order-stage ${order.status}`}>{stageName(order.status)}</i><span className="row-arrow">›</span></button>)}</div> : <div className="admin-empty"><span>□</span><h2>Aguardando o primeiro pedido</h2><p>Os novos pedidos aparecerão automaticamente aqui.</p></div>}</section></>}
        {tab === "orders" && <section className="admin-panel standalone-panel"><div className="admin-tools"><label>Buscar pedido<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cliente, telefone, e-mail ou código" /></label><label>Etapa<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Todas as etapas</option>{stages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>{orderList}</section>}
        {tab === "generations" && <section className="admin-panel standalone-panel"><div className="panel-title"><div><span>Solicitações de arte</span><small>Status real recebido da automação</small></div></div><div className="admin-generation-list">{generations.length ? generations.map(item => <article key={item.id}><span className={`generation-state ${item.status}`}>✦</span><div><strong>{item.modelTitle}</strong><small>{item.customerName} · {item.artName || "sem nome"} · {shortDate(item.createdAt)}</small>{item.error && <em>{item.error}</em>}</div><b>{item.status === "demo_ready" ? "Prévia demo" : item.status === "ready" ? "Pronta" : item.status === "failed" ? "Falhou" : item.status === "processing" ? "Gerando" : "Na fila"}</b>{item.mugMockupUrl && <a href={item.mugMockupUrl} target="_blank" rel="noreferrer">Ver mockup</a>}</article>) : <div className="admin-empty"><span>✦</span><h2>Nenhuma personalização ainda</h2><p>As solicitações feitas no site aparecerão aqui.</p></div>}</div></section>}
      </>}
    </section>
    {selected && <div className="admin-drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null); }}><aside className="admin-drawer" aria-label="Detalhes do pedido"><header><div><small>PEDIDO</small><h2>#{selected.id.slice(0, 8).toUpperCase()}</h2></div><button aria-label="Fechar detalhes" onClick={() => setSelected(null)}>×</button></header><div className="drawer-scroll">
      <section className="drawer-art">{selected.mugMockupUrl ? <img src={selected.mugMockupUrl} alt="Mockup da caneca do pedido" /> : <div>✦</div>}<span><strong>{selected.modelTitle}</strong><small>{selected.artName}{selected.phrase ? ` · ${selected.phrase}` : ""}</small></span></section>
      <section className="drawer-data"><h3>Cliente</h3><p><span>Nome</span><b>{selected.customerName}</b></p><p><span>Celular</span><a href={`tel:${selected.customerPhone}`}>{selected.customerPhone}</a></p><p><span>E-mail</span><a href={`mailto:${selected.customerEmail}`}>{selected.customerEmail}</a></p></section>
      <section className="drawer-data"><h3>Pedido e entrega</h3><p><span>Total</span><b>{money(selected.totalCents)}</b></p><p><span>Quantidade</span><b>{selected.quantity} caneca{selected.quantity > 1 ? "s" : ""}</b></p><p><span>Frete</span><b>{selected.shippingServiceName}</b></p><p><span>Endereço</span><b>{selected.address === "Retirada local" ? "Retirada em Cuiabá" : `${selected.address}, ${selected.addressNumber}${selected.complement ? ` · ${selected.complement}` : ""} · ${selected.district} · ${selected.city}/${selected.state} · CEP ${selected.postalCode}`}</b></p></section>
      <section className="drawer-form"><label>Etapa do pedido<select value={selected.status} onChange={event => setSelected({ ...selected, status: event.target.value })}>{stages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Código de rastreio<input value={selected.trackingCode || ""} onChange={event => setSelected({ ...selected, trackingCode: event.target.value })} placeholder="Opcional" /></label><label>Link de rastreio<input value={selected.trackingUrl || ""} onChange={event => setSelected({ ...selected, trackingUrl: event.target.value })} placeholder="https://…" /></label><label>Observações internas<textarea value={selected.adminNotes || ""} onChange={event => setSelected({ ...selected, adminNotes: event.target.value })} placeholder="Informações para produção ou entrega" rows={4} /></label><button onClick={() => updateOrder(selected)}>Salvar alterações</button></section>
    </div></aside></div>}
    {notice && <div className="toast" role="status">{notice}</div>}
  </main>;
}
