---
## <img src="assets/img/logo.png" alt="" width="70" height="70" aria-hidden="true"/>Calc CO₂

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Made with Copilot](https://img.shields.io/badge/Made%20with-Copilot-blue?style=for-the-badge&logo=github)
![Bootcamp](https://img.shields.io/badge/DIO-Bootcamp%20Copilot-purple?style=for-the-badge)

---
## 📖 Sobre o Projeto

Este projeto foi desenvolvido como parte de um desafio do **Bootcamp GitHub Copilot - Código na Prática** na DIO.  
O objetivo é calcular as emissões de dióxido de carbono (CO₂) com base em diferentes meios de transporte e combustíveis, permitindo ao usuário visualizar o impacto ambiental de suas escolhas de deslocamento.

---

## 🚀 Funcionalidades

- **Seleção de meio de transporte**
  - Carro, ônibus, caminhão, moto, bicicleta.
  - Interface amigável com ícones representando cada modal.

- **Escolha de combustível**
  - Gasolina, etanol, diesel ou nenhum (para bicicleta).

- **Cálculo de emissões de CO₂**
  - Suporte a **Tank-to-Wheel (TTW)** e **Well-to-Wheel (WTW)**.
  - Exibição clara do resultado em **kg CO₂**.
  - Equivalências ambientais (árvores necessárias, consumo de energia etc.).

- **Entrada de distância**
  - Manual (usuário informa a quilometragem).
  - Automática via **integração com API de mapas**.

- **Tema claro/escuro**
  - Alternância manual via botão.
  - Suporte automático ao `prefers-color-scheme`.
  - Transição suave entre os temas.
  - Persistência da preferência do usuário via `localStorage`.

- **Exportação de resultados**
  - Geração de relatório em **PDF**.

- **Interface responsiva e acessível**
  - Layout adaptado para desktop e mobile.
  - Foco visível e suporte a leitores de tela.

- **Histórico e transparência**
  - Uso de `console.log` para depuração e acompanhamento dos cálculos.
  - Estrutura modular (`utils.js`, `co2-factors.js`, `calculator.js`, `ui.js`).

---

## 🛠️ Tecnologias Utilizadas

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)![Console%20Logs](https://img.shields.io/badge/Console%20Logs-depuração-lightgrey?style=for-the-badge)![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)![Modularização](https://img.shields.io/badge/Modularização-arquitetura-blue?style=for-the-badge) <br>

---
## 📸 Demonstração

Aqui está uma prévia da interface do aplicativo:

![Interface do App](assets/img/interface.png )

---
## 🌐 Acesse o App
[Clique aqui para usar o CO₂ Calculator](https://jfcampos5.github.io/CO2-calculator/)

---

## 📂 Estrutura de Pastas
````
public/
├── assets/
│    ├── img/                # ícones dos modais
│    └── js/
│         ├── utils.js        # funções auxiliares
│         ├── co2-factors.js  # fatores de emissão
│         ├── calculator.js   # lógica de cálculo
│         └── ui.js           # interação com a interface
└── index.html                # página principal
``````
---

## ⚙️ Como Executar


   ```bash
   1. Clone este repositório:

   git clone https://github.com/seu-usuario/calc-co2.git
   
   2.Acesse a pasta do projeto:
      cd calc-co2

   3.Abra o arquivo index.html em seu navegador.

   4.Preencha os campos de origem, destino e selecione o modal de transporte.
   
   5.Clique em Calcular para visualizar as emissões.

````
---
📊 Exemplo de Uso
---
**Origem:** Salvador

**Destino:** São Paulo

**Modal:** Carro (Gasolina)

**Distância:** 1960 km

**Resultado:** ~4527 kg CO₂

---
📈 Próximos Passos
---
- Gráficos comparativos entre diferentes modais. 
- Ajustes visuais adicionais para melhorar a experiência em tema escuro. 
- Otimização da performance e refino da interface.

---
👩‍💻 Autora
---
Projeto desenvolvido por Joelma Campos, como parte do desafio da Digital Innovation One (DIO).

---
📜 Licença
---
Este projeto está sob a licença MIT.
Sinta-se livre para usar, modificar e compartilhar.
