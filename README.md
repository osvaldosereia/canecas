# Canecas

Loja mobile-first para escolher modelos oficiais e personalizar uma caneca branca de 11 oz com IA.

## Implementado

- feed responsivo com busca e filtros;
- ações funcionais de curtir, salvar e compartilhar;
- áreas reais de modelos salvos e pedidos;
- personalização com nome, frase e contato;
- API segura para o webhook do Make, sem expor segredos no navegador;
- callback assíncrono para receber a arte quadrada e o mockup da caneca;
- persistência das solicitações no banco D1;
- modo de demonstração automático enquanto o webhook não está configurado;
- painel administrativo protegido e conectado aos pedidos e personalizações reais;
- biblioteca dinâmica de modelos com fila de revisão, publicação e pausa pelo admin;
- endpoint autenticado para a automação do Make enviar novas artes ao feed;
- indicadores operacionais, busca, filtros, mudança de etapa, observações e rastreio;
- cálculo de frete com retirada local e integração preparada para o Melhor Envio;
- criação de pedido e Checkout Pro do Mercado Pago;
- retorno de pagamento e Webhook autenticado para atualizar o pedido.

Os comentários públicos e o envio de artes por clientes ficaram fora desta fase para reduzir moderação, direitos autorais e funções que não ajudam diretamente a compra.

## Integração com o Make

Configure as variáveis descritas em `.env.example` apenas no ambiente de execução. O site envia ao Make:

- referência do modelo oficial;
- nome e frase personalizados;
- dados do cliente;
- prompt pronto para gerar a arte quadrada e o mockup de uma caneca branca 11 oz;
- URL de callback e autenticação compartilhada.

O Make deve responder imediatamente com um `jobId` ou com as URLs prontas. Para o fluxo assíncrono, deve chamar o callback recebido no payload com:

```json
{
  "status": "ready",
  "jobId": "identificador-no-make",
  "artImageUrl": "https://.../arte-quadrada.png",
  "mugMockupUrl": "https://.../mockup-caneca.png"
}
```

## Entrada de novos modelos

O cenário que cria artes oficiais deve enviar `POST /api/models/ingest` com `Authorization: Bearer <MODEL_FEED_WEBHOOK_SECRET>`. Cada arte entra como “Aguardando revisão” e só aparece no feed depois de aprovada no admin.

```json
{
  "sourceJobId": "make-123",
  "title": "Amor que acolhe",
  "category": "Família",
  "tags": ["amor", "família", "presente"],
  "imageUrl": "https://.../arte-quadrada.png",
  "phrase": "Amor que acolhe",
  "accent": "rose"
}
```

## Desenvolvimento

Requer Node.js 22.13 ou superior.

```bash
npm ci
npm run dev
```

Validações:

```bash
npm run lint
npm test
```

## Pagamento e frete

O preço, o CEP de origem e as credenciais ficam somente nas variáveis de ambiente. Sem credenciais, a interface usa valores de demonstração e cria o pedido sem realizar cobrança.

O Checkout Pro mantém os dados de cartão fora do site. O Webhook do Mercado Pago valida a assinatura, consulta o pagamento na API e confere moeda, valor e referência antes de marcar um pedido como pago.

O Melhor Envio recebe o CEP de destino e as dimensões da caneca branca 11 oz. O valor selecionado é recalculado no servidor durante a criação do pedido para impedir alteração pelo navegador.

Próximos passos: cadastrar as credenciais de teste, conectar o cenário gerador de modelos, executar compras de homologação e integrar a compra/impressão das etiquetas após o pagamento aprovado.
