"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";

type Model = {
  id: number;
  title: string;
  category: string;
  tags: string[];
  image: string;
  likes: number;
  comments: number;
  uses: number;
  accent: string;
  phrase: string;
};

const models: Model[] = [
  { id: 1, title: "Onde há amor, há lar", category: "Família", tags: ["amor", "casa", "presente"], image: "/models/modelo-floral.webp", likes: 284, comments: 18, uses: 91, accent: "coral", phrase: "Onde há amor, há lar" },
  { id: 2, title: "Leve a vida no seu ritmo", category: "Mato Grosso", tags: ["capivara", "pantanal", "humor"], image: "/models/modelo-pantanal.webp", likes: 516, comments: 31, uses: 167, accent: "sage", phrase: "Leve a vida no seu ritmo" },
  { id: 3, title: "Deus cuida de cada detalhe", category: "Fé", tags: ["fé", "católica", "presente"], image: "/models/modelo-fe.webp", likes: 391, comments: 22, uses: 133, accent: "blue", phrase: "Deus cuida de cada detalhe" },
  { id: 4, title: "Professora que inspira", category: "Profissões", tags: ["professora", "gratidão", "escola"], image: "", likes: 228, comments: 14, uses: 74, accent: "lavender", phrase: "Professora que inspira todos os dias" },
  { id: 5, title: "Mãe, meu lugar favorito", category: "Mães", tags: ["mãe", "afeto", "flores"], image: "", likes: 633, comments: 42, uses: 208, accent: "rose", phrase: "Mãe, você é meu lugar favorito" },
  { id: 6, title: "Café primeiro, decisões depois", category: "Humor", tags: ["café", "humor", "rotina"], image: "", likes: 472, comments: 27, uses: 156, accent: "coffee", phrase: "Café primeiro, decisões depois" },
];

const categories = ["Para você", "Novidades", "Mais usados", "Mães", "Família", "Fé", "Humor", "Profissões", "Mato Grosso"];

const icon = (name: "heart" | "bookmark" | "share" | "comment" | "search" | "sparkles" | "user" | "close") => {
  const paths = {
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" />,
    bookmark: <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" /></>,
    comment: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    sparkles: <><path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2L12 3Z" /><path d="m19 14-.7 2.3L16 17l2.3.7L19 20l.7-2.3L22 17l-2.3-.7L19 14ZM5 14l-.7 2.3L2 17l2.3.7L5 20l.7-2.3L8 17l-2.3-.7L5 14Z" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

function Artwork({ model, compact = false }: { model: Model; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (model.image && !failed) return <Image className="art-image" src={model.image} alt={`Arte do modelo ${model.title}`} width={1254} height={1254} sizes="(max-width: 790px) calc(100vw - 24px), 600px" unoptimized onError={() => setFailed(true)} />;
  return <div className={`art-placeholder ${model.accent} ${compact ? "compact" : ""}`}><span className="art-kicker">feito para presentear</span><strong>{model.phrase}</strong><span className="art-flourish">✦ · ✦</span></div>;
}

function ModelCard({ model, onCustomize }: { model: Model; onCustomize: (model: Model) => void }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const share = async () => {
    const data = { title: model.title, text: `Olha este modelo de caneca: ${model.title}`, url: `${window.location.origin}/?modelo=${model.id}` };
    if (navigator.share) await navigator.share(data).catch(() => undefined); else await navigator.clipboard?.writeText(data.url);
  };
  return (
    <article className="model-card">
      <div className="card-head"><div className={`avatar ${model.accent}`}>C</div><div><strong>Canecas</strong><span>{model.category} · modelo oficial</span></div><button className="more-button" aria-label="Mais opções">•••</button></div>
      <div className="art-wrap"><Artwork model={model} /></div>
      <div className="card-actions"><div className="action-group"><button className={liked ? "active like" : ""} onClick={() => setLiked(!liked)} aria-label="Curtir">{icon("heart")}</button><button onClick={() => setShowComments(!showComments)} aria-label="Comentar">{icon("comment")}</button><button onClick={share} aria-label="Compartilhar">{icon("share")}</button></div><button className={saved ? "active" : ""} onClick={() => setSaved(!saved)} aria-label="Salvar">{icon("bookmark")}</button></div>
      <div className="card-body">
        <p className="social-proof"><strong>{model.likes + (liked ? 1 : 0)} curtidas</strong><span>{model.uses} personalizações</span></p>
        <h2>{model.title}</h2><p className="tags">{model.tags.map(tag => <span key={tag}>#{tag}</span>)}</p>
        <button className="comments-link" onClick={() => setShowComments(!showComments)}>Ver todos os {model.comments} comentários</button>
        {showComments && <div className="comments-box"><p><strong>marcia.s</strong> Ficou lindo! Quero fazer para minha mãe.</p><p><strong>ana.cuiaba</strong> A combinação de cores está perfeita.</p><div className="comment-compose"><input aria-label="Adicionar comentário" placeholder="Adicione um comentário…" /><button>Publicar</button></div></div>}
        <button className="customize-button" onClick={() => onCustomize(model)}>{icon("sparkles")} Usar este modelo</button>
      </div>
    </article>
  );
}

function CustomizeSheet({ model, onClose }: { model: Model; onClose: () => void }) {
  const [step, setStep] = useState<"form" | "generating" | "ready">("form");
  const [name, setName] = useState("");
  const [phrase, setPhrase] = useState(model.phrase);
  const submit = (event: FormEvent) => { event.preventDefault(); setStep("generating"); window.setTimeout(() => setStep("ready"), 1800); };
  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-label="Personalizar caneca">
      <button className="backdrop-close" onClick={onClose} aria-label="Fechar personalização" />
      <section className="customize-sheet"><div className="sheet-handle" /><button className="sheet-close" onClick={onClose} aria-label="Fechar">{icon("close")}</button>
        {step === "form" && <><div className="sheet-title"><span>{icon("sparkles")}</span><div><small>PERSONALIZE COM IA</small><h2>Deixe este modelo com a sua cara</h2></div></div><div className="custom-grid"><div className="selected-art"><Artwork model={model} compact /><span>Modelo escolhido</span></div><form onSubmit={submit}><label>Nome para a arte<input value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Maria" maxLength={30} required /></label><label>Frase<input value={phrase} onChange={e => setPhrase(e.target.value)} maxLength={80} required /></label><div className="two-fields"><label>Seu nome<input placeholder="Nome completo" required /></label><label>Celular<input placeholder="(65) 99999-9999" inputMode="tel" required /></label></div><label>E-mail<input type="email" placeholder="voce@email.com" required /></label><label className="consent"><input type="checkbox" required /><span>Concordo com o uso destes dados para gerar minha arte e atender meu pedido.</span></label><button className="generate-button" type="submit">{icon("sparkles")} Gerar minha arte</button><p className="form-note">Você verá a prévia antes de comprar.</p></form></div></>}
        {step === "generating" && <div className="generation-state"><div className="magic-loader">{icon("sparkles")}</div><small>PERSONALIZAÇÃO EM ANDAMENTO</small><h2>A IA está criando sua arte</h2><p>Estamos preservando o estilo do modelo e aplicando seu nome e sua frase.</p><div className="progress"><span /></div></div>}
        {step === "ready" && <div className="ready-state"><span className="ready-badge">Prévia pronta</span><div className="ready-art"><Artwork model={{ ...model, image: "", phrase: name ? `${name} · ${phrase}` : phrase }} /></div><h2>Sua caneca ficou linda!</h2><p>Esta é uma demonstração da experiência. A integração real com o Make será conectada na próxima etapa.</p><div className="ready-actions"><button className="secondary-button" onClick={() => setStep("form")}>Ajustar</button><button className="generate-button">Aprovar e continuar</button></div></div>}
      </section>
    </div>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Para você");
  const [query, setQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const filtered = useMemo(() => models.filter(model => { const categoryMatch = activeCategory === "Para você" || activeCategory === "Novidades" || activeCategory === "Mais usados" || model.category === activeCategory; const text = `${model.title} ${model.category} ${model.tags.join(" ")}`.toLowerCase(); return categoryMatch && text.includes(query.toLowerCase()); }), [activeCategory, query]);

  return <main>
    <header className="topbar"><a className="brand" href="#top" aria-label="Canecas - início"><span className="brand-mark">C</span><span>canecas<small>feita do seu jeito</small></span></a><label className="search-box">{icon("search")}<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar temas e presentes" /></label><nav className="top-actions"><a href="/admin">Painel</a><button className="login-button">{icon("user")} Entrar</button></nav></header>
    <div className="category-bar"><div>{categories.map(category => <button key={category} onClick={() => setActiveCategory(category)} className={activeCategory === category ? "active" : ""}>{category}</button>)}</div></div>
    <div className="page-shell" id="top">
      <aside className="left-rail"><nav><a className="active" href="#top"><span>⌂</span> Descobrir</a><a href="#salvos"><span>♡</span> Salvos</a><a href="#pedidos"><span>□</span> Meus pedidos</a></nav><div className="rail-card"><span className="rail-icon">✦</span><strong>Uma caneca só sua</strong><p>Escolha um modelo, escreva seu nome e veja a IA criar.</p><button onClick={() => setSelectedModel(models[0])}>Começar agora</button></div></aside>
      <section className="feed-column"><div className="feed-intro"><div><span className="eyebrow">MODELOS NOVOS TODOS OS DIAS</span><h1>Encontre uma arte que tenha a sua cara.</h1><p>Escolha, personalize e receba sua caneca em casa.</p></div><div className="intro-spark">✦</div></div><div className="mobile-search"><label className="search-box">{icon("search")}<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar um modelo" /></label></div>{filtered.length ? filtered.map(model => <ModelCard key={model.id} model={model} onCustomize={setSelectedModel} />) : <div className="empty-state"><span>✦</span><h2>Nenhum modelo encontrado</h2><p>Tente buscar outro tema ou categoria.</p></div>}</section>
      <aside className="right-rail"><section className="how-card"><span className="eyebrow">COMO FUNCIONA</span><ol><li><b>1</b><div><strong>Escolha um modelo</strong><span>Navegue por centenas de ideias.</span></div></li><li><b>2</b><div><strong>Personalize com IA</strong><span>Informe o nome e a frase.</span></div></li><li><b>3</b><div><strong>Aprove e receba</strong><span>Pague com segurança e acompanhe.</span></div></li></ol></section><section className="trust-card"><strong>Caneca branca 11 oz</strong><span>Impressão por sublimação</span><span>Prévia antes da compra</span><span>Pagamento protegido</span></section><p className="legal-links">Privacidade · Termos · Ajuda<br />© 2026 Canecas</p></aside>
    </div>
    <nav className="mobile-nav"><a className="active" href="#top"><span>⌂</span>Descobrir</a><a href="#salvos"><span>♡</span>Salvos</a><button onClick={() => setSelectedModel(models[0])}><span>✦</span>Criar</button><a href="#pedidos"><span>□</span>Pedidos</a><a href="#perfil"><span>○</span>Perfil</a></nav>
    {selectedModel && <CustomizeSheet model={selectedModel} onClose={() => setSelectedModel(null)} />}
  </main>;
}
