# 🦊 VitrineFox — Plataforma de Vitrine & E-commerce Oficial

Vitrine profissional de produtos com alta performance, banco de dados persistente centralizado, painel administrativo protegido, upload real de imagens, controle de estoque em tempo real, sacola de compras com persistência e checkout com rastreio de pedidos.

---

## 📌 1. Descrição do Projeto

O **VitrineFox** foi arquitetado especificamente para resolver o problema clássico de aplicações desacopladas onde alterações no painel do administrador (feitas no celular do proprietário) não refletiam nos celulares dos visitantes. 

Com uma arquitetura cliente-servidor centralizada e suporte a banco relacional **Supabase PostgreSQL** (com fallback automático e resiliente em arquivo atômico `/data/vitrinefox_db.json`), qualquer produto cadastrado, editado ou removido pelo dono da loja fica imediatamente disponível para todos os clientes em qualquer aparelho (celular, tablet ou computador).

---

## 🛠️ 2. Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- **Backend:** Node.js, Express REST API, Body Parsers com suporte a uploads de 15MB.
- **Banco de Dados:** Supabase PostgreSQL com migrações versionadas e Row Level Security (RLS) + Fallback atômico em JSON.
- **Armazenamento de Mídia:** Supabase Storage (bucket `product-images`) e disco persistente local `/uploads`.
- **Pagamentos & Checkout:** Estrutura preparada para integração oficial com Mercado Pago (Pix com Copia e Cola, Cartão e Boleto) com webhook idempotente.
- **Segurança:** Rate limiting contra força bruta (5 tentativas / 5 minutos de bloqueio), tokens de sessão HMAC, higienização de inputs e sem credenciais expostas no cliente.

---

## 📋 3. Pré-requisitos

- **Node.js**: Versão 18.x ou superior (Recomendado: 20 LTS ou 22).
- **npm** ou **yarn**.
- Conta gratuita no [Supabase](https://supabase.com) (para banco PostgreSQL em nuvem e imagens).
- Conta no [GitHub](https://github.com) e na [Vercel](https://vercel.com) (para publicação).

---

## 🚀 4. Instalação e Execução Local

### Passo 1: Clone o repositório
```bash
git clone https://github.com/seu-usuario/vitrinefox.git
cd vitrinefox
```

### Passo 2: Instale as dependências
```bash
npm install
```

### Passo 3: Configure as variáveis de ambiente
Copie o arquivo de exemplo:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações (veja a seção 10).

### Passo 4: Inicie o servidor de desenvolvimento
```bash
npm run dev
```
O VitrineFox estará disponível em `http://localhost:3000`.

---

## 🔐 5. Acesso ao Painel do Dono (Mecanismo Discreto)

Para proteger a loja de acessos indevidos e manter uma vitrine limpa:
1. Acesse o site no navegador.
2. No topo da página (cabeçalho), **clique 15 vezes consecutivas sobre o logotipo escrito "VitrineFox"**.
3. O contador registrará os toques e abrirá a janela secreta de autenticação.
4. Digite a senha administrativa do proprietário (padrão inicial configurado: `felipe123!`).
5. O painel completo será aberto com Dashboard de Vendas, Cadastro de Produtos, Upload e Controle de Estoque.

> **Importante:** Após 5 tentativas incorretas consecutivas, o sistema bloqueia temporariamente o IP por 5 minutos via rate limiting no servidor.

---

## 🗄️ 6. Como Configurar o Supabase

1. Crie uma conta no [Supabase](https://supabase.com) e clique em **"New Project"**.
2. Defina o nome do projeto (ex: `vitrinefox-db`) e uma senha forte para o banco de dados.
3. Escolha a região mais próxima (ex: `South America (São Paulo) - sa-east-1`).
4. Após o provisionamento, vá em **Project Settings > API**:
   - Copie a **Project URL** (`https://xyzcompany.supabase.co`).
   - Copie a chave **anon public** (`eyJhbGci...`).
   - Copie a chave **service_role secret** (`eyJhbGci...`) — *utilize apenas no servidor*.

---

## 📜 7. Como Executar as Migrations do Banco

1. No painel do seu projeto no Supabase, clique em **SQL Editor** no menu lateral esquerdo.
2. Clique em **"New Query"**.
3. Abra o arquivo localizado no repositório em `supabase/migrations/20261014_init.sql`.
4. Copie todo o conteúdo e cole no SQL Editor do Supabase.
5. Clique no botão **"Run"** (ou pressione `Ctrl + Enter`).
6. Todas as tabelas (`categories`, `products`, `orders`, `order_items`, `payment_events`), índices e políticas RLS de segurança serão criadas automaticamente.

---

## 🖼️ 8. Como Configurar o Armazenamento de Imagens

1. No Supabase, vá em **Storage > Buckets**.
2. O script SQL de migração já cria o bucket `product-images` com acesso público para visualização.
3. Se desejar criar manualmente:
   - Clique em **"New Bucket"**.
   - Nome: `product-images`.
   - Marque a opção **"Public bucket"**.
   - Salve.

---

## 🔑 9. Configuração das Variáveis de Ambiente (.env)

No arquivo `.env` (ou nas configurações da Vercel):

```env
PORT=3000
NODE_ENV=production

# Senha de Acesso Administrativo
ADMIN_PASSWORD=felipe123!
JWT_SECRET=coloque_uma_frase_aleatoria_longa_aqui

# Credenciais do Supabase
SUPABASE_URL=https://seu-id.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

# Mercado Pago (Opcional para testes locais)
MERCADO_PAGO_ACCESS_TOKEN=TEST-...
MERCADO_PAGO_PUBLIC_KEY=TEST-...
MERCADO_PAGO_WEBHOOK_SECRET=...
```

---

## 💳 10. Configuração do Mercado Pago & Webhooks

1. Crie uma conta de desenvolvedor no [Mercado Pago Developers](https://www.mercadopago.com.br/developers).
2. Vá em **Suas Aplicações > Criar Aplicação** e selecione "Pagamentos Online".
3. Copie o **Access Token** de Teste ou Produção e insira no `MERCADO_PAGO_ACCESS_TOKEN`.
4. Em **Notificações Webhook**, configure a URL:
   `https://sua-loja.vercel.app/api/webhooks/mercadopago`
5. O endpoint valida idempotência usando a tabela `payment_events` para evitar processamento duplicado de pedidos e estoques.

---

## 📦 11. Como Enviar para o GitHub

```bash
# Inicialize o repositório git (se ainda não fez)
git init
git add .
git commit -m "feat: VitrineFox versao completa para producao"

# Crie o repositório no GitHub e vincule:
git remote add origin https://github.com/seu-usuario/vitrinefox.git
git branch -M main
git push -u origin main
```

---

## ☁️ 12. Como Publicar na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
2. Clique em **"Add New..." > "Project"**.
3. Selecione o repositório `vitrinefox` e clique em **"Import"**.
4. Em **Environment Variables**, adicione as mesmas variáveis do seu `.env`:
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `MERCADO_PAGO_ACCESS_TOKEN`
5. Clique em **"Deploy"**.
6. A Vercel construirá o projeto e fornecerá o domínio público (ex: `https://vitrinefox.vercel.app`).

---

## 🔄 13. Como Atualizar o Site Após Alterações

Para atualizar o catálogo ou adicionar novos produtos:
- **Você NÃO precisa fazer um novo deploy nem editar código.** Basta acessar o site pelo celular, clicar 15 vezes no logotipo, entrar com a senha e salvar os novos produtos no painel. Eles aparecerão instantaneamente para todos os visitantes.

Para atualizar o código-fonte da aplicação:
```bash
git add .
git commit -m "feat: novas melhorias"
git push origin main
```
A Vercel atualizará o site automaticamente via CI/CD.

---

## ❓ 14. Resolução dos Erros Mais Comuns

| Erro / Sintoma | Causa Mais Provável | Solução |
| :--- | :--- | :--- |
| **"Produto sumiu após atualizar a página"** | Produto cadastrado em modo local sem persistência | O VitrineFox já salva no banco compartilhado. Verifique se o servidor está rodando ou se as credenciais do Supabase estão preenchidas. |
| **"Limite de 5 tentativas excedido"** | Rate limiting ativado após senhas incorretas | Aguarde 5 minutos para o desbloqueio automático ou reinicie o servidor. |
| **"Erro ao fazer upload da imagem"** | Imagem acima de 10MB ou formato não suportado | Envie imagens em formato JPG, PNG ou WEBP com até 10MB. |
| **"Estoque insuficiente ao finalizar compra"** | Outro cliente comprou as unidades simultaneamente | O sistema revalida o estoque no servidor para evitar vendas duplicadas. Ajuste o estoque no painel do dono. |

---

Desenvolvido para a **VitrineFox**.
