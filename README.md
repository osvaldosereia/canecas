# Canecas

Loja mobile-first para escolher modelos oficiais, personalizar canecas brancas 11 oz com IA e acompanhar o pedido.

## Entregue nesta primeira versão

- feed responsivo de modelos oficiais;
- busca e filtros por categoria;
- interações de curtir, salvar, compartilhar e comentar;
- fluxo demonstrativo de personalização com nome, frase e contato;
- estados de geração e aprovação da prévia;
- painel administrativo com pedidos, fila da IA e aprovação de modelos;
- três artes originais otimizadas para demonstração.

## Próximas integrações

- Firebase Authentication, Firestore e Storage;
- webhook assíncrono do Make para personalização com OpenAI;
- Mercado Pago;
- Melhor Envio e entrega local;
- autenticação e proteção do painel administrativo.

## Desenvolvimento

Requer Node.js 22.13 ou superior.

```bash
npm ci
npm run dev
```

Validações disponíveis:

```bash
npm run lint
npm test
```

As credenciais das integrações não devem ser incluídas no repositório. Elas serão configuradas apenas no ambiente de execução.
