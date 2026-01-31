# EcoTrip (entrega DIO)

Projeto EcoTrip — calculadora de emissões (frontend + servidor).  
Instruções rápidas de execução:

1. Vá para a pasta do servidor:
   cd server

2. Copie o modelo de variáveis de ambiente:
   Copy-Item .env.example .env

   - (Opcional) Adicione sua chave ORS em server/.env:
     ORS_API_KEY=SEU_TOKEN_AQUI
   - Se não adicionar chave, o app usará distância em linha reta e permite inserir distância manual.

3. Instale dependências e execute:
   npm install
   npm start

4. Abra no navegador:
   http://localhost:3000

Atenção: não comite o arquivo server/.env (já está ignorado pelo .gitignore).
