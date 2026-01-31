# 🌱Calc CO₂ 

## 📖 Sobre o Projeto
Este projeto foi desenvolvido como parte de um desafio do Bootcamp **GitHub Copilot - Código na Prática** na **DIO**.  
O objetivo é calcular as emissões de dióxido de carbono(CO₂) com base em diferentes meios de transporte e combustíveis, permitindo ao usuário visualizar o impacto ambiental de suas escolhas de deslocamento.

---

## 🚀 Funcionalidades
- Seleção de **meio de transporte** (carro, ônibus, caminhão, moto, bicicleta).  
- Escolha de **combustível** (gasolina, etanol, diesel, nenhum).  
- Cálculo de emissões **Tank-to-Wheel (TTW)** e **Well-to-Wheel (WTW)**.  
- Entrada manual de distância ou cálculo automático via API de mapas (em desenvolvimento).  
- Interface amigável com ícones representando cada modal.  
- Exibição clara do resultado em **kg CO₂**.  

---

## 🛠️ Tecnologias Utilizadas
- **HTML5** → estrutura da aplicação  
- **CSS3** → estilização e responsividade  
- **JavaScript (ES6+)** → lógica de cálculo e interação  
- **Modularização** → separação em arquivos (`utils.js`, `co2-factors.js`, `calculator.js`, `ui.js`)  
- **Console logs** → depuração e transparência no cálculo  

---

## 📂 Estrutura de Pastas
````
public/
 ├── assets/
 │    ├── img/                # ícones dos modais
 │    └── js/
 │         ├── utils.js       # funções auxiliares
 │         ├── co2-factors.js # fatores de emissão
 │         ├── calculator.js  # lógica de cálculo
 │         └── ui.js          # interação com a interface
 └── index.html               # página principal

````
---

## ⚙️ Como Executar
   ```Bash
1. Clone este repositório:

git clone https://github.com/seu-usuario/calc-co2.git

2. Acesse a pasta do projeto:

   cd calc-co2

3. Abra o arquivo index.html em seu navegador.

4. Preencha os campos de origem, destino e selecione o modal de transporte.

5. Clique em Calcular para visualizar as emissões.

````
---

📊 Exemplo de Uso
---
- Origem: Salvador
- Destino: São Paulo
- Modal: Carro (Gasolina)
- Distância: 1960 km
Resultado: ~4527 kg CO₂

---

📈 Próximos Passos
---
- Integração com API de mapas para cálculo automático de distância.
- Exportação dos resultados em PDF/CSV.
- Gráficos comparativos entre diferentes modais.

----

👩‍💻 Autora
---
Projeto desenvolvido por **Joelma Campos**, como parte do desafio da Digital Innovation One (DIO).

---

📜 Licença
---
Este projeto está sob a licença MIT.
Sinta-se livre para usar, modificar e compartilhar.

---

