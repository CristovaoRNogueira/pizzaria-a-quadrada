# 🍕 Pizzaria a Quadrada - Sistema Completo (PWA)

Sistema completo de pedidos online para pizzaria com PostgreSQL, Prisma, integração WhatsApp e PWA.

## 🚀 Funcionalidades

### 📱 **Frontend (React + TypeScript + PWA)**
- **Cardápio interativo** com pizzas quadradas, redondas, doces e bebidas
- **Sistema de pedidos** com carrinho inteligente
- **Painel administrativo** completo
- **Integração WhatsApp** automática
- **Configurações de horário** e pagamento
- **Acompanhamento de pedidos** em tempo real
- **Instalável como aplicativo** (PWA)

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

# Docker e Docker Compose
docker --version
docker-compose --version
```

### 2. **Instalação**
```bash
# Clonar repositório
git clone <repo-url>
cd pizzaria-quadrada

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env conforme necessário
```

### 3. **Executar com Docker (Recomendado)**
```bash
# Iniciar todos os serviços
npm run docker:up

# Visualizar logs
npm run docker:logs

# Parar todos os serviços
npm run docker:down
```

### 4. **Executar sem Docker (Desenvolvimento)**
```bash
# Iniciar PostgreSQL e Redis localmente
# (Você precisará ter PostgreSQL e Redis instalados)

# Configurar banco de dados
npm run db:generate
npm run db:push
npm run db:seed

# Iniciar aplicação
npm run start
```

### 5. **Acessar Aplicação**
- **Frontend:** http://localhost:80 ou http://localhost:5173 (dev)
- **Backend:** http://localhost:3001
- **Admin:** http://localhost/admin ou http://localhost:5173/admin (dev)

## 🔐 Credenciais Padrão

- **Email:** admin@pizzariaquadrada.com
- **Senha:** pizzaria2024

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Executar frontend em desenvolvimento
npm run backend      # Executar backend em desenvolvimento
npm run start        # Executar frontend e backend juntos

# Banco de dados
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Aplicar schema ao banco
npm run db:migrate   # Criar migração
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Popular banco com dados

# Docker
npm run docker:build # Construir imagens
npm run docker:up    # Iniciar contêineres
npm run docker:down  # Parar contêineres
npm run docker:logs  # Ver logs

# Produção
npm run build        # Build para produção
npm run preview      # Preview do build
```

## 🌐 Deploy para AWS

### **Opção 1: AWS Elastic Beanstalk + RDS**

1. **Preparar para Deploy**
```bash
# Instalar EB CLI
pip install awsebcli

# Inicializar EB
eb init

# Criar ambiente EB
eb create pizzaria-quadrada-prod
```

2. **Configurar RDS (PostgreSQL)**
```bash
# Criar instância RDS PostgreSQL via console AWS
# Configurar security groups
# Anotar endpoint de conexão
```

3. **Configurar Variáveis de Ambiente no EB**
```bash
eb setenv DATABASE_URL="postgresql://user:pass@rds-endpoint:5432/db" \
  JWT_SECRET="production-secret" \
  ADMIN_EMAIL="admin@pizzariaquadrada.com" \
  ADMIN_PASSWORD="pizzaria2024" \
  WHATSAPP_API_URL="http://localhost:21465" \
  WHATSAPP_SESSION="pizzaria-quadrada" \
  PIX_KEY="77999742491" \
  PIX_NAME="Pizzaria a Quadrada" \
  PORT="3001"
```

4. **Deploy**
```bash
eb deploy
```

### **Opção 2: AWS ECS + Fargate + RDS**

1. **Criar Repositório ECR**
```bash
aws ecr create-repository --repository-name pizzaria-quadrada
```

2. **Construir e Enviar Imagens**
```bash
# Fazer login no ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<region>.amazonaws.com

# Construir e enviar imagens
docker-compose -f docker-compose.prod.yml build
docker tag pizzaria_backend:latest <aws-account-id>.dkr.ecr.<region>.amazonaws.com/pizzaria-quadrada:backend
docker tag pizzaria_frontend:latest <aws-account-id>.dkr.ecr.<region>.amazonaws.com/pizzaria-quadrada:frontend
docker push <aws-account-id>.dkr.ecr.<region>.amazonaws.com/pizzaria-quadrada:backend
docker push <aws-account-id>.dkr.ecr.<region>.amazonaws.com/pizzaria-quadrada:frontend
```

3. **Criar Cluster ECS e Task Definitions**
```bash
# Via console AWS:
# - Criar cluster ECS
# - Criar task definitions para backend e frontend
# - Configurar serviços para cada task
# - Configurar Application Load Balancer
```

4. **Configurar RDS e ElastiCache**
```bash
# Via console AWS:
# - Criar instância RDS PostgreSQL
# - Criar cluster ElastiCache Redis
# - Configurar security groups
```

### **Opção 3: AWS Amplify (Frontend) + ECS (Backend)**

1. **Configurar Amplify para Frontend**
```bash
# Instalar Amplify CLI
npm install -g @aws-amplify/cli

# Inicializar Amplify
amplify init

# Adicionar hospedagem
amplify add hosting

# Publicar
amplify publish
```

2. **Configurar ECS para Backend**
```bash
# Seguir passos da Opção 2 apenas para o backend
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

4. **Problemas com WPPConnect**
```bash
# Verificar se o contêiner está rodando
docker ps | grep wppconnect

# Verificar logs
docker logs pizzaria_wppconnect

# Reiniciar serviço
docker restart pizzaria_wppconnect
```

## 📞 Suporte

- **Email:** suporte@pizzariaquadrada.com
- **WhatsApp:** +55 77 99974-2491

---

**Pizzaria a Quadrada** - *A qualidade é nossa diferença!* 🍕