# 🚀 Guia Rápido de Deploy - WhatsApp Automação

## ⚡ Deploy em 5 Minutos (Vercel)

### 1. Prepare os arquivos
```bash
# Certifique-se que tem estes arquivos:
package.json
vercel.json
.env.example
```

### 2. GitHub
1. Acesse https://github.com
2. Clique "New repository"
3. Nome: `whatsapp-automation`
4. Upload todos os arquivos

### 3. Vercel Deploy
1. Acesse https://vercel.com
2. "Sign up" com GitHub
3. "Import Project"
4. Selecione seu repositório
5. "Deploy"

### 4. Configurar Variáveis
No painel Vercel:
- Settings → Environment Variables
- Adicione: `NODE_ENV=production`

✅ **Pronto! Sua aplicação está online**

---

## 🔧 Deploy Alternativo (Railway)

### 1. Railway
1. https://railway.app
2. Login com GitHub
3. "New Project"
4. "Deploy from GitHub"
5. Selecione repositório

### 2. Configurar
- Detecta automaticamente Node.js
- Deploy automático

✅ **URL gerada automaticamente**

---

## ⚠️ Problemas Comuns

**Erro de Build:**
- Verifique se package.json está correto
- Confirme que todas as dependências estão listadas

**Puppeteer não funciona:**
- Adicione variável: `PUPPETEER_HEADLESS=true`
- Para Railway/Render: funcionará automaticamente

**WebSocket não conecta:**
- Verifique se a plataforma suporta WebSockets
- Vercel e Railway suportam

---

## 📱 Próximos Passos

1. **Teste sua aplicação online**
2. **Configure domínio personalizado** (opcional)
3. **Adicione banco de dados** (para produção)
4. **Configure SSL** (automático na maioria)

**Tempo total: 5-15 minutos**