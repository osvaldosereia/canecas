"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Tab = "overview" | "orders" | "generations" | "models";
const orders = [
  { id: "#CNC-1048", customer: "Mariana Alves", model: "Onde há amor, há lar", value: "R$ 74,80", status: "Pago", time: "há 8 min" },
  { id: "#CNC-1047", customer: "Lucas Ribeiro", model: "Leve a vida no seu ritmo", value: "R$ 62,90", status: "Produção", time: "há 42 min" },
  { id: "#CNC-1046", customer: "Ana Carolina", model: "Deus cuida de cada detalhe", value: "R$ 109,70", status: "Aguardando", time: "há 1 h" },
  { id: "#CNC-1045", customer: "Fernanda Lima", model: "Mãe, meu lugar favorito", value: "R$ 62,90", status: "Enviado", time: "ontem" },
];
const initialModels = [
  { name: "Avó: amor que abraça", theme: "Família", score: "98%", color: "#d47765" },
  { name: "Meu lugar é onde você está", theme: "Casais", score: "96%", color: "#836a91" },
  { name: "Respira, vai dar certo", theme: "Motivacional", score: "94%", color: "#658071" },
];

export default function AdminDashboard({ userDisplayName }: { userDisplayName: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [approved, setApproved] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const visibleModels = initialModels.filter(model => !rejected.includes(model.name));
  const date = useMemo(() => new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date()).toUpperCase(), []);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(""), 2200); return () => window.clearTimeout(timer); }, [notice]);
  const review = (name: string, action: "approve" | "reject") => {
    if (action === "approve") { setApproved(current => [...current, name]); setNotice("Modelo aprovado para publicação"); }
    else { setRejected(current => [...current, name]); setNotice("Modelo removido da fila"); }
  };

  const orderTable = <div className="order-table"><div className="table-row table-head"><span>Pedido</span><span>Cliente e modelo</span><span>Valor</span><span>Status</span></div>{orders.map(order => <div className="table-row" key={order.id}><strong>{order.id}<small>{order.time}</small></strong><span><b>{order.customer}</b><small>{order.model}</small></span><b>{order.value}</b><span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></div>)}</div>;
  const modelGrid = <div className="review-grid">{visibleModels.map(model => <article key={model.name} className={approved.includes(model.name) ? "approved" : ""}><div className="review-art" style={{ "--review-color": model.color } as React.CSSProperties}><span>feito para você</span><strong>{model.name}</strong><b>✦ · ✦</b></div><div className="review-info"><div><strong>{model.name}</strong><span>{model.theme} · confiança {model.score}</span></div>{approved.includes(model.name) ? <span className="approved-label">Aprovado ✓</span> : <div className="review-actions"><button onClick={() => review(model.name, "reject")} aria-label={`Rejeitar ${model.name}`}>Rejeitar</button><button onClick={() => review(model.name, "approve")}>Aprovar</button></div>}</div></article>)}</div>;

  return <main className="admin-shell">
    <aside className="admin-sidebar"><Link className="brand admin-brand" href="/"><span className="brand-mark">C</span><span>canecas<small>administração</small></span></Link><nav aria-label="Seções do painel"><button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>▦ <span>Visão geral</span></button><button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>□ <span>Pedidos</span><b>12</b></button><button className={tab === "generations" ? "active" : ""} onClick={() => setTab("generations")}>✦ <span>Gerações</span><b>4</b></button><button className={tab === "models" ? "active" : ""} onClick={() => setTab("models")}>▧ <span>Modelos</span></button></nav><div className="admin-user"><div>{userDisplayName.slice(0, 2).toUpperCase()}</div><span><strong>{userDisplayName}</strong><small>Administrador</small></span></div></aside>
    <section className="admin-main"><header className="admin-header"><div><span className="eyebrow">{date}</span><h1>{tab === "overview" ? "Visão geral da operação" : tab === "orders" ? "Pedidos" : tab === "generations" ? "Gerações com IA" : "Biblioteca de modelos"}</h1><p className="demo-label">Ambiente de preparação · dados demonstrativos</p></div><div className="admin-header-actions"><Link href="/">Ver site</Link></div></header>
      {tab === "overview" && <><div className="metric-grid"><article><span>Pedidos hoje</span><strong>12</strong><small>↑ 20% desde ontem</small></article><article><span>Vendas hoje</span><strong>R$ 846</strong><small>Ticket médio R$ 70,50</small></article><article><span>Artes geradas</span><strong>31</strong><small>4 aguardando revisão</small></article><article><span>Conversão</span><strong>18,4%</strong><small>↑ 3,2 pontos</small></article></div><div className="admin-grid"><section className="admin-panel orders-panel"><div className="panel-title"><div><span>Pedidos recentes</span><small>Acompanhe pagamento e produção</small></div><button onClick={() => setTab("orders")}>Ver todos</button></div>{orderTable}</section><aside className="admin-panel queue-panel"><div className="panel-title"><div><span>Fila da IA</span><small>Atualizada agora</small></div><i>4</i></div><div className="queue-summary"><div className="queue-orbit">✦</div><strong>3 gerando</strong><span>1 aguardando nova tentativa</span></div><div className="queue-bars"><span><i style={{ width: "72%" }} /></span><small>Tempo médio: 1 min 42 s</small></div><button onClick={() => setTab("generations")}>Ver gerações</button></aside></div><section className="admin-panel review-panel"><div className="panel-title"><div><span>Modelos aguardando aprovação</span><small>A automação gerou novas opções para o feed</small></div><button onClick={() => setTab("models")}>Ver biblioteca</button></div>{modelGrid}</section></>}
      {tab === "orders" && <section className="admin-panel standalone-panel"><div className="panel-title"><div><span>Todos os pedidos</span><small>Pagamento, produção e envio em uma única fila</small></div></div>{orderTable}</section>}
      {tab === "generations" && <section className="admin-panel standalone-panel"><div className="panel-title"><div><span>Fila de geração</span><small>O status real será alimentado pelo callback do Make</small></div></div><div className="generation-list"><article><span className="status-dot working" /><div><strong>#ART-313 · Onde há amor, há lar</strong><small>Gerando arte quadrada e mockup</small></div><b>72%</b></article><article><span className="status-dot working" /><div><strong>#ART-312 · Deus cuida de cada detalhe</strong><small>Aplicando personalização</small></div><b>48%</b></article><article><span className="status-dot waiting" /><div><strong>#ART-311 · Mãe, meu lugar favorito</strong><small>Aguardando nova tentativa</small></div><b>Atenção</b></article></div></section>}
      {tab === "models" && <section className="admin-panel standalone-panel"><div className="panel-title"><div><span>Revisão de modelos</span><small>Aprove somente as artes que devem aparecer no feed</small></div></div>{visibleModels.length ? modelGrid : <div className="empty-state"><h2>Fila revisada</h2><p>Não há novos modelos aguardando decisão.</p></div>}</section>}
    </section>{notice && <div className="toast" role="status">{notice}</div>}
  </main>;
}
