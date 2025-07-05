# 🍕 Pizzaria a Quadrada - Sistema Completo

Sistema completo de pedidos online para pizzaria com PostgreSQL, Prisma e integração WhatsApp.

## 🚀 Funcionalidades

### 📱 **Frontend (React + TypeScript)**
- **Cardápio interativo** com pizzas quadradas, redondas, doces e bebidas
- **Sistema de pedidos** com carrinho inteligente
- **Painel administrativo** completo
- **Integração WhatsApp** automática
- **Configurações de horário** e pagamento

### 🗄️ **Backend (Node.js + Express + Prisma)**
- **API RESTful** completa
- **Autenticação JWT** para admin
- **PostgreSQL** como banco de dados
- **Prisma ORM** para gerenciamento de dados
- **Validação** e tratamento de erros

### 📊 **Banco de Dados (PostgreSQL)**
- **Pizzas** com categorias e preços
- **Pedidos** com status em tempo real
- **Clientes** com histórico
- **Configurações** de negócio
- **Horários** de funcionamento

## 🛠️ Configuração Local

### 1. **Pré-requisitos**
```bash
# Node.js 18+
node --version

# PostgreSQL 15+
psql --version

# Docker (opcional)
docker --version
```

### 2. **Instalação**
```bash
# Clonar repositório
git clone <repo-url>
cd pizzaria-quadrada

# Instalar dependências
npm install

# Configurar banco de dados (Docker)
docker-compose up -d

# Ou instalar PostgreSQL localmente
# Criar banco: pizzaria_quadrada
```

### 3. **Configuração do Banco**
```bash
# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações
# DATABASE_URL="postgresql://pizzaria:pizzaria123@localhost:5432/pizzaria_quadrada"

# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:push

# Popular banco com dados iniciais
npm run db:seed
```

### 4. **Executar Aplicação**
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev

# Acessar aplicação
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# Admin: http://localhost:5173/admin
```

## 🔐 Credenciais Padrão

- **Email:** admin@pizzariaquadrada.com
- **Senha:** pizzaria2024

## 📋 Scripts Disponíveis

```bash
# Frontend
npm run dev          # Executar em desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build

# Banco de dados
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Aplicar schema ao banco
npm run db:migrate   # Criar migração
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Popular banco com dados

# Backend
cd server && npm run dev  # Executar backend
```

## 🌐 Deploy para AWS

### **Opção 1: AWS Amplify (Recomendado)**

1. **Preparar para Deploy**
```bash
# Build da aplicação
npm run build

# Configurar variáveis de ambiente
# VITE_API_URL=https://sua-api.amazonaws.com/api
```

2. **Deploy no Amplify**
```bash
# Instalar AWS CLI
aws configure

# Conectar repositório ao Amplify
# Via console AWS ou CLI
```

### **Opção 2: AWS EC2 + RDS**

1. **Configurar RDS (PostgreSQL)**
```bash
# Criar instância RDS PostgreSQL
# Configurar security groups
# Anotar endpoint de conexão
```

2. **Configurar EC2**
```bash
# Criar instância EC2 (Ubuntu 22.04)
# Instalar Node.js, PM2, Nginx

# Conectar via SSH
ssh -i sua-chave.pem ubuntu@ip-da-instancia

# Instalar dependências
sudo apt update
sudo apt install nodejs npm nginx
sudo npm install -g pm2
```

3. **Deploy da Aplicação**
```bash
# Clonar repositório
git clone <repo-url>
cd pizzaria-quadrada

# Instalar dependências
npm install

# Configurar .env para produção
DATABASE_URL="postgresql://user:pass@rds-endpoint:5432/db"
JWT_SECRET="production-secret"
VITE_API_URL="https://seu-dominio.com/api"

# Build frontend
npm run build

# Configurar Prisma
npm run db:generate
npm run db:push
npm run db:seed

# Iniciar backend com PM2
cd server
pm2 start index.ts --name "pizzaria-api"

# Configurar Nginx
sudo nano /etc/nginx/sites-available/pizzaria
```

4. **Configuração Nginx**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend
    location / {
        root /home/ubuntu/pizzaria-quadrada/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **Opção 3: AWS ECS + Fargate**

1. **Criar Dockerfile**
```dockerfile
# Frontend
FROM node:18-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Backend
FROM node:18-alpine AS backend
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server/ .
RUN npm run build

# Production
FROM node:18-alpine
WORKDIR /app
COPY --from=backend /app .
COPY --from=frontend /app/dist ./public
EXPOSE 3001
CMD ["npm", "start"]
```

2. **Deploy com ECS**
```bash
# Build e push para ECR
aws ecr create-repository --repository-name pizzaria-quadrada
docker build -t pizzaria-quadrada .
docker tag pizzaria-quadrada:latest <account>.dkr.ecr.region.amazonaws.com/pizzaria-quadrada:latest
docker push <account>.dkr.ecr.region.amazonaws.com/pizzaria-quadrada:latest

# Criar task definition e service no ECS
```

## 📊 Monitoramento

### **CloudWatch (AWS)**
- Logs da aplicação
- Métricas de performance
- Alertas automáticos

### **Prisma Studio**
```bash
# Acessar dados em tempo real
npm run db:studio
```

## 🔧 Troubleshooting

### **Problemas Comuns**

1. **Erro de conexão com banco**
```bash
# Verificar se PostgreSQL está rodando
docker ps
# ou
sudo systemctl status postgresql
```

2. **Erro no Prisma**
```bash
# Regenerar cliente
npm run db:generate
```

3. **Erro de CORS**
```bash
# Verificar configuração no backend
# Adicionar domínio nas origens permitidas
```

## 📞 Suporte

- **Email:** suporte@pizzariaquadrada.com
- **WhatsApp:** +55 77 99974-2491
- **Documentação:** [Link para docs]

---

**Pizzaria a Quadrada** - *A qualidade é nossa diferença!* 🍕