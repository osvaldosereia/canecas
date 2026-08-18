"use client";

import { useState } from "react";
import Link from "next/link";

const orders = [
  { id: "#CNC-1048", customer: "Mariana Alves", model: "Onde há amor, há lar", value: "R$ 74,80", status: "Pago", time: "há 8 min" },
  { id: "#CNC-1047", customer: "Lucas Ribeiro", model: "Leve a vida no seu ritmo", value: "R$ 62,90", status: "Produção", time: "há 42 min" },
  { id: "#CNC-1046", customer: "Ana Carolina", model: "Deus cuida de cada detalhe", value: "R$ 109,70", status: "Aguardando", time: "há 1 h" },
  { id: "#CNC-1045", customer: "Fernanda Lima", model: "Mãe, meu lugar favorito", value: "R$ 62,90", status: "Enviado", time: "ontem" },
];

const pendingModels = [
  { name: "Avó: amor que abraça", theme: "Família", score: "98%", color: "#d47765" },
  { name: "Meu lugar é onde você está", theme: "Casais", score: "96%", color: "#836a91" },
  { name: "Respira, vai dar certo", theme: "Motivacional", score: "94%", color: "#658071" },
];

export default function AdminPage() {
  const [approved, setApproved] = useState<string[]>([]);
  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <Link className="brand admin-brand" href="/"><span className="brand-mark">C</span><span>canecas<small>administração</small></span></Link>
      <nav><a className="active" href="#visao">▦ <span>Visão geral</span></a><a href="#pedidos">□ <span>Pedidos</span><b>12</b></a><a href="#geracoes">✦ <span>Gerações</span><b>4</b></a><a href="#modelos">▧ <span>Modelos</span></a><a href="#envios">⌁ <span>Envios</span></a><a href="#comentarios">◯ <span>Comentários</span></a></nav>
      <div className="admin-user"><div>OA</div><span><strong>Osvaldo</strong><small>Administrador</small></span></div>
    </aside>
    <section className="admin-main" id="visao">
      <header className="admin-header"><div><span className="eyebrow">TERÇA-FEIRA, 18 DE AGOSTO</span><h1>Bom dia! Aqui está o movimento.</h1></div><div className="admin-header-actions"><Link href="/">Ver site</Link><button>+ Novo modelo</button></div></header>
      <div className="metric-grid"><article><span>Pedidos hoje</span><strong>12</strong><small>↑ 20% desde ontem</small></article><article><span>Vendas hoje</span><strong>R$ 846</strong><small>Ticket médio R$ 70,50</small></article><article><span>Artes geradas</span><strong>31</strong><small>4 aguardando revisão</small></article><article><span>Conversão</span><strong>18,4%</strong><small>↑ 3,2 pontos</small></article></div>
      <div className="admin-grid">
        <section className="admin-panel orders-panel" id="pedidos"><div className="panel-title"><div><span>Pedidos recentes</span><small>Acompanhe pagamento e produção</small></div><button>Ver todos</button></div><div className="order-table"><div className="table-row table-head"><span>Pedido</span><span>Cliente e modelo</span><span>Valor</span><span>Status</span></div>{orders.map(order => <div className="table-row" key={order.id}><strong>{order.id}<small>{order.time}</small></strong><span><b>{order.customer}</b><small>{order.model}</small></span><b>{order.value}</b><span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></div>)}</div></section>
        <aside className="admin-panel queue-panel" id="geracoes"><div className="panel-title"><div><span>Fila da IA</span><small>Atualizada agora</small></div><i>4</i></div><div className="queue-summary"><div className="queue-orbit">✦</div><strong>3 gerando</strong><span>1 aguardando nova tentativa</span></div><div className="queue-bars"><span><i style={{width:"72%"}} /></span><small>Tempo médio: 1 min 42 s</small></div><button>Ver gerações</button></aside>
      </div>
      <section className="admin-panel review-panel" id="modelos"><div className="panel-title"><div><span>Modelos aguardando aprovação</span><small>A automação gerou novas opções para o feed</small></div><button>Ver biblioteca</button></div><div className="review-grid">{pendingModels.map(model => <article key={model.name} className={approved.includes(model.name) ? "approved" : ""}><div className="review-art" style={{"--review-color":model.color} as React.CSSProperties}><span>feito para você</span><strong>{model.name}</strong><b>✦ · ✦</b></div><div className="review-info"><div><strong>{model.name}</strong><span>{model.theme} · confiança {model.score}</span></div>{approved.includes(model.name) ? <span className="approved-label">Aprovado ✓</span> : <div className="review-actions"><button>×</button><button onClick={() => setApproved([...approved, model.name])}>Aprovar</button></div>}</div></article>)}</div></section>
    </section>
  </main>;
}
