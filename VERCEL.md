# Publicar no Vercel

Este projeto é um site estático. A pasta publicável é `dist`.

## Opção mais simples — Vercel Drop

1. Extraia o arquivo `wephotly-vercel.zip`.
2. Acesse https://vercel.com/new/drop.
3. Arraste a pasta extraída para a página.
4. Depois do deploy, adicione `www.wephotly.com` em **Settings > Domains**.

## Usando um repositório Git

Ao importar o repositório, selecione **Other** como framework, deixe o comando de build vazio e defina `dist` como **Output Directory**.

## Checkout futuro do Pagar.me

O endereço do checkout está centralizado em `dist/script.js`, na constante `CHECKOUT_ENDPOINT`. Substitua o valor atual pela URL do endpoint do seu backend. Esse endpoint deve receber `{ "plan": "mensal" }` ou `{ "plan": "anual" }` e responder com `{ "checkoutUrl": "https://..." }`.

Nunca coloque a chave secreta do Pagar.me neste site. A criação da cobrança deve ocorrer no backend do aplicativo.
