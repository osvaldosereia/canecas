"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import CheckoutForm, { CreatedOrder } from "./CheckoutForm";

type Model = { id: number; title: string; category: string; tags: string[]; image: string; likes: number; uses: number; accent: string; phrase: string };
type View = "discover" | "saved" | "orders";
type JobStatus = "queued" | "processing" | "ready" | "demo_ready" | "failed";
type Job = { id: string; token: string; status: JobStatus; mode: "live" | "demo"; artImageUrl?: string | null; mugMockupUrl?: string | null; error?: string | null };
type OrderDraft = { id: string; token: string; modelTitle: string; status: string; totalCents: number; createdAt: string };

const models: Model[] = [
  { id: 1, title: "Onde há amor, há lar", category: "Família", tags: ["amor", "casa", "presente"], image: "/models/modelo-floral.webp", likes: 284, uses: 91, accent: "coral", phrase: "Onde há amor, há lar" },
  { id: 2, title: "Leve a vida no seu ritmo", category: "Mato Grosso", tags: ["capivara", "pantanal", "humor"], image: "/models/modelo-pantanal.webp", likes: 516, uses: 167, accent: "sage", phrase: "Leve a vida no seu ritmo" },
  { id: 3, title: "Deus cuida de cada detalhe", category: "Fé", tags: ["fé", "católica", "presente"], image: "/models/modelo-fe.webp", likes: 391, uses: 133, accent: "blue", phrase: "Deus cuida de cada detalhe" },
  { id: 4, title: "Professora que inspira", category: "Profissões", tags: ["professora", "gratidão", "escola"], image: "", likes: 228, uses: 74, accent: "lavender", phrase: "Professora que inspira todos os dias" },
  { id: 5, title: "Mãe, meu lugar favorito", category: "Mães", tags: ["mãe", "afeto", "flores"], image: "", likes: 633, uses: 208, accent: "rose", phrase: "Mãe, você é meu lugar favorito" },
  { id: 6, title: "Café primeiro, decisões depois", category: "Humor", tags: ["café", "humor", "rotina"], image: "", likes: 472, uses: 156, accent: "coffee", phrase: "Café primeiro, decisões depois" },
];

const categories = ["Para você", "Novidades", "Mais usados", "Mães", "Família", "Fé", "Humor", "Profissões", "Mato Grosso"];

const icon = (name: "heart" | "bookmark" | "share" | "search" | "sparkles" | "orders" | "close") => {
  const paths = {
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" />,
    bookmark: <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    sparkles: <><path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2L12 3Z" /><path d="m19 14-.7 2.3L16 17l2.3.7L19 20l.7-2.3L22 17l-2.3-.7L19 14ZM5 14l-.7 2.3L2 17l2.3.7L5 20l.7-2.3L8 17l-2.3-.7L5 14Z" /></>,
    orders: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

function Artwork({ model, compact = false }: { model: Model; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (model.image && !failed) return <Image className="art-image" src={model.image} alt={`Arte do modelo ${model.title}`} width={1254} height={1254} sizes="(max-width: 790px) calc(100vw - 24px), 600px" unoptimized onError={() => setFailed(true)} />;
  return <div className={`art-placeholder ${model.accent} ${compact ? "compact" : ""}`}><span className="art-kicker">feito para presentear</span><strong>{model.phrase}</strong><span className="art-flourish">✦ · ✦</span></div>;
}

function ModelCard({ model, saved, onSave, onCustomize, onNotice }: { model: Model; saved: boolean; onSave: () => void; onCustomize: (model: Model) => void; onNotice: (message: string) => void }) {
  const [liked, setLiked] = useState(false);
  const share = async () => {
    const data = { title: model.title, text: `Olha este modelo de caneca: ${model.title}`, url: `${window.location.origin}/?modelo=${model.id}` };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(data.url); onNotice("Link do modelo copiado"); }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") onNotice("Não foi possível compartilhar agora");
    }
  };
  return <article className="model-card">
    <div className="card-head"><div className={`avatar ${model.accent}`}>C</div><div><strong>Canecas</strong><span>{model.category} · modelo oficial</span></div></div>
    <div className="art-wrap"><Artwork model={model} /></div>
    <div className="card-actions"><div className="action-group"><button className={liked ? "active like" : ""} onClick={() => setLiked(!liked)} aria-label={liked ? "Descurtir" : "Curtir"}>{icon("heart")}</button><button onClick={share} aria-label="Compartilhar">{icon("share")}</button></div><button className={saved ? "active" : ""} onClick={onSave} aria-label={saved ? "Remover dos salvos" : "Salvar"}>{icon("bookmark")}</button></div>
    <div className="card-body"><p className="social-proof"><strong>{model.likes + (liked ? 1 : 0)} curtidas</strong><span>{model.uses} personalizações</span></p><h2>{model.title}</h2><p className="tags">{model.tags.map(tag => <span key={tag}>#{tag}</span>)}</p><button className="customize-button" onClick={() => onCustomize(model)}>{icon("sparkles")} Usar este modelo</button></div>
  </article>;
}

function CustomizeSheet({ model, onClose, onApproved }: { model: Model; onClose: () => void; onApproved: (draft: OrderDraft) => void }) {
  const [step, setStep] = useState<"form" | "generating" | "ready" | "error" | "checkout" | "order_created">("form");
  const [artName, setArtName] = useState("");
  const [phrase, setPhrase] = useState(model.phrase);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", closeOnEscape); };
  }, [onClose]);

  useEffect(() => {
    if (!job || !["queued", "processing"].includes(job.status)) return;
    let active = true;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/personalizations/${job.id}?token=${encodeURIComponent(job.token)}`, { cache: "no-store" });
        if (!response.ok) return;
        const update = await response.json() as Job;
        if (!active) return;
        setJob(update);
        if (update.status === "ready") setStep("ready");
        if (update.status === "failed") { setErrorMessage(update.error || "A geração não foi concluída."); setStep("error"); }
      } catch { /* transient polling error */ }
    }, 2500);
    return () => { active = false; window.clearInterval(timer); };
  }, [job]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setStep("generating"); setErrorMessage("");
    try {
      const response = await fetch("/api/personalizations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ modelId: model.id, modelTitle: model.title, sourceImage: model.image, artName, phrase, customer: { name: customerName, email, phone } }) });
      const payload = await response.json() as Job & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Não foi possível iniciar a geração.");
      setJob(payload);
      if (payload.status === "ready" || payload.status === "demo_ready") window.setTimeout(() => setStep("ready"), 900);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível iniciar a geração."); setStep("error");
    }
  };

  const previewModel = { ...model, image: "", phrase: artName ? `${artName} · ${phrase}` : phrase };
  return <div className="sheet-backdrop" role="presentation"><button className="backdrop-close" onClick={onClose} aria-label="Fechar personalização" /><section className="customize-sheet" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="customize-title" tabIndex={-1}><div className="sheet-handle" /><button className="sheet-close" onClick={onClose} aria-label="Fechar">{icon("close")}</button>
    {step === "form" && <><div className="sheet-title"><span>{icon("sparkles")}</span><div><small>PERSONALIZE COM IA</small><h2 id="customize-title">Deixe este modelo com a sua cara</h2></div></div><div className="custom-grid"><div className="selected-art"><Artwork model={model} compact /><span>Modelo escolhido</span></div><form onSubmit={submit}><label>Nome na arte<input autoFocus value={artName} onChange={e => setArtName(e.target.value)} placeholder="Ex.: Maria" maxLength={30} required /></label><label>Frase<input value={phrase} onChange={e => setPhrase(e.target.value)} maxLength={80} required /></label><div className="two-fields"><label>Seu nome<input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nome completo" maxLength={80} autoComplete="name" required /></label><label>Celular<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(65) 99999-9999" inputMode="tel" autoComplete="tel" minLength={10} maxLength={20} required /></label></div><label>E-mail<input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="voce@email.com" maxLength={120} autoComplete="email" required /></label><label className="consent"><input type="checkbox" required /><span>Concordo com o uso destes dados para gerar minha arte e atender meu pedido.</span></label><button className="generate-button" type="submit">{icon("sparkles")} Gerar minha arte</button><p className="form-note">Você verá a arte e o mockup antes de comprar.</p></form></div></>}
    {step === "generating" && <div className="generation-state" aria-live="polite"><div className="magic-loader">{icon("sparkles")}</div><small>PERSONALIZAÇÃO EM ANDAMENTO</small><h2>A IA está criando sua arte</h2><p>O pedido foi enviado com segurança. Estamos preparando a arte quadrada e o mockup da caneca branca.</p><div className="progress"><span /></div></div>}
    {step === "error" && <div className="generation-state error-state" aria-live="assertive"><div className="error-mark">!</div><small>NÃO FOI POSSÍVEL CONCLUIR</small><h2>Vamos tentar novamente?</h2><p>{errorMessage}</p><button className="generate-button compact-button" onClick={() => setStep("form")}>Revisar dados e tentar</button></div>}
    {step === "ready" && <div className="ready-state"><span className="ready-badge">Prévia pronta</span><div className="preview-grid"><div className="ready-art">{job?.artImageUrl ? <Image src={job.artImageUrl} alt="Arte personalizada" width={900} height={900} unoptimized /> : <Artwork model={previewModel} />}</div><div className="mug-preview">{job?.mugMockupUrl ? <Image src={job.mugMockupUrl} alt="Mockup da caneca personalizada" width={900} height={900} unoptimized /> : <div className="demo-mug"><span><Artwork model={previewModel} compact /></span></div>}<small>Mockup da caneca</small></div></div><h2>Sua prévia está pronta</h2><p>{job?.mode === "demo" ? "O fluxo de demonstração está ativo. Você já pode testar entrega e pagamento." : "Confira a arte e o mockup antes de seguir para o pedido."}</p><div className="ready-actions"><button className="secondary-button" onClick={() => setStep("form")}>Ajustar</button><button className="generate-button" onClick={() => job && setStep("checkout")}>Aprovar e escolher entrega</button></div></div>}
    {step === "checkout" && job && <CheckoutForm personalizationId={job.id} personalizationToken={job.token} onBack={() => setStep("ready")} onCreated={order => { setCreatedOrder(order); if (order.checkoutUrl) window.location.assign(order.checkoutUrl); else setStep("order_created"); }} />}
    {step === "order_created" && createdOrder && <div className="generation-state order-created"><div className="success-mark">✓</div><small>PEDIDO DE TESTE CRIADO</small><h2>Integração preparada</h2><p>O pedido foi salvo com frete e total calculados. Cadastre as credenciais do Mercado Pago para liberar a cobrança real.</p><div className="order-total-highlight"><span>Total do pedido</span><strong>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(createdOrder.totalCents / 100)}</strong></div><button className="generate-button compact-button" onClick={() => onApproved({ id: createdOrder.id, token: createdOrder.token, modelTitle: model.title, status: "Aguardando pagamento", totalCents: createdOrder.totalCents, createdAt: createdOrder.createdAt })}>Ver em Meus pedidos</button></div>}
  </section></div>;
}

export default function Home() {
  const [view, setView] = useState<View>("discover");
  const [activeCategory, setActiveCategory] = useState("Para você");
  const [query, setQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [orders, setOrders] = useState<OrderDraft[]>([]);
  const [notice, setNotice] = useState("");
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(""), 2400); return () => window.clearTimeout(timer); }, [notice]);
  const filtered = useMemo(() => models.filter(model => { const categoryMatch = activeCategory === "Para você" || activeCategory === "Novidades" || activeCategory === "Mais usados" || model.category === activeCategory; const text = `${model.title} ${model.category} ${model.tags.join(" ")}`.toLowerCase(); return categoryMatch && text.includes(query.toLowerCase()); }), [activeCategory, query]);
  const visibleModels = view === "saved" ? models.filter(model => savedIds.includes(model.id)) : filtered;
  const changeView = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const toggleSaved = (id: number) => setSavedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const approveDraft = (draft: OrderDraft) => { setOrders(current => [draft, ...current.filter(item => item.id !== draft.id)]); setSelectedModel(null); changeView("orders"); setNotice("Prévia salva em Meus pedidos"); };
  return <main>
    <header className="topbar"><button className="brand brand-button" onClick={() => changeView("discover")} aria-label="Canecas - início"><span className="brand-mark">C</span><span>canecas<small>feita do seu jeito</small></span></button><label className="search-box">{icon("search")}<input value={query} onChange={e => { setQuery(e.target.value); setView("discover"); }} placeholder="Buscar temas e presentes" aria-label="Buscar modelos" /></label><nav className="top-actions"><button className="orders-button" onClick={() => changeView("orders")}>{icon("orders")} Meus pedidos{orders.length > 0 && <b>{orders.length}</b>}</button></nav></header>
    <div className="category-bar"><div>{categories.map(category => <button key={category} onClick={() => { setActiveCategory(category); setView("discover"); }} className={view === "discover" && activeCategory === category ? "active" : ""}>{category}</button>)}</div></div>
    <div className="page-shell" id="top">
      <aside className="left-rail"><nav><button className={view === "discover" ? "active" : ""} onClick={() => changeView("discover")}><span>⌂</span> Descobrir</button><button className={view === "saved" ? "active" : ""} onClick={() => changeView("saved")}><span>♡</span> Salvos{savedIds.length > 0 && <b>{savedIds.length}</b>}</button><button className={view === "orders" ? "active" : ""} onClick={() => changeView("orders")}><span>□</span> Meus pedidos{orders.length > 0 && <b>{orders.length}</b>}</button></nav></aside>
      <section className="feed-column">
        {view === "discover" && <><div className="feed-intro"><div><span className="eyebrow">MODELOS NOVOS TODOS OS DIAS</span><h1>Encontre uma arte que tenha a sua cara.</h1><p>Escolha, personalize e receba sua caneca em casa.</p></div><div className="intro-spark">✦</div></div><div className="mobile-search"><label className="search-box">{icon("search")}<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar um modelo" aria-label="Buscar modelos" /></label></div></>}
        {view === "saved" && <div className="section-intro"><span className="eyebrow">SUA COLEÇÃO</span><h1>Modelos salvos</h1><p>Guarde as ideias favoritas para personalizar quando quiser.</p></div>}
        {view === "orders" && <div className="section-intro"><span className="eyebrow">ACOMPANHAMENTO</span><h1>Meus pedidos</h1><p>As prévias aprovadas aparecem aqui antes do pagamento.</p></div>}
        {view !== "orders" && (visibleModels.length ? visibleModels.map(model => <ModelCard key={model.id} model={model} saved={savedIds.includes(model.id)} onSave={() => toggleSaved(model.id)} onCustomize={setSelectedModel} onNotice={setNotice} />) : <div className="empty-state"><span>✦</span><h2>{view === "saved" ? "Nenhum modelo salvo" : "Nenhum modelo encontrado"}</h2><p>{view === "saved" ? "Toque no marcador de uma arte para encontrá-la aqui." : "Tente buscar outro tema ou categoria."}</p>{view === "saved" && <button onClick={() => changeView("discover")}>Explorar modelos</button>}</div>)}
        {view === "orders" && (orders.length ? <div className="customer-orders">{orders.map(order => <article key={order.id}><span className="order-icon">✓</span><div><strong>{order.modelTitle}</strong><small>Pedido {order.id.slice(0, 8).toUpperCase()} · {new Intl.DateTimeFormat("pt-BR").format(new Date(order.createdAt))} · {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.totalCents / 100)}</small></div><b>{order.status}</b></article>)}</div> : <div className="empty-state"><span>□</span><h2>Nenhum pedido ainda</h2><p>Escolha um modelo, gere sua prévia e aprove para continuar.</p><button onClick={() => changeView("discover")}>Escolher um modelo</button></div>)}
      </section>
      <aside className="right-rail"><section className="how-card"><span className="eyebrow">COMO FUNCIONA</span><ol><li><b>1</b><div><strong>Escolha um modelo</strong><span>Veja as artes oficiais.</span></div></li><li><b>2</b><div><strong>Personalize com IA</strong><span>Informe o nome e a frase.</span></div></li><li><b>3</b><div><strong>Aprove a prévia</strong><span>Confira arte e mockup antes de comprar.</span></div></li></ol></section><section className="trust-card"><strong>Caneca branca 11 oz</strong><span>Impressão por sublimação</span><span>Prévia antes da compra</span><span>Seus dados enviados com segurança</span></section><p className="legal-links">Privacidade · Termos · Ajuda<br />© 2026 Canecas</p></aside>
    </div>
    <nav className="mobile-nav" aria-label="Navegação principal"><button className={view === "discover" ? "active" : ""} onClick={() => changeView("discover")}><span>⌂</span>Descobrir</button><button className={view === "saved" ? "active" : ""} onClick={() => changeView("saved")}><span>♡</span>Salvos</button><button className="create-tab" onClick={() => setSelectedModel(models[0])}><span>✦</span>Criar</button><button className={view === "orders" ? "active" : ""} onClick={() => changeView("orders")}><span>□</span>Pedidos</button></nav>
    {notice && <div className="toast" role="status">{notice}</div>}
    {selectedModel && <CustomizeSheet model={selectedModel} onClose={() => setSelectedModel(null)} onApproved={approveDraft} />}
  </main>;
}
