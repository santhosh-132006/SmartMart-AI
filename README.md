# SmartMart AI – Supermarket Sales & Inventory Copilot

> **TRACK_ID: PS03 | Supermarket Sales and Inventory Copilot for Multi-Store Retail Managers**

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/santhosh-132006/SmartMart-AI)

🚀 **Run Online in Browser (1-Click):** [https://codespaces.new/santhosh-132006/SmartMart-AI](https://codespaces.new/santhosh-132006/SmartMart-AI)

---

## 📹 Demo Video Link
- **Demo Video:** [Watch SmartMart AI Walkthrough & Demo](https://youtube.com) *(Insert your demo video link here)*

---

## 🌟 Overview & Core Principles

**SmartMart AI** is an intelligent decision-support system designed specifically for supermarket managers overseeing multi-store operations, 200+ unique products, stock arrivals, stock movements, and suppliers.

The system is built on strict data grounding principles:
- **NO CLAIM WITHOUT NUMBERS.**
- **NO RECOMMENDATION WITHOUT EVIDENCE.**
- **NO GUESSING WHEN DATA IS UNAVAILABLE.**

Every AI answer, priority triage alert, and stock movement audit provides explicit evidence, mathematical calculations, recommendations, and underlying assumptions.

---

## 🚀 Key Features

- **🤖 Evidence-Based SmartMart Copilot**: Ask natural language questions (*"What products are running out?"*, *"Should I reorder Aavin Milk?"*, *"When did Aavin Milk last arrive?"*, *"Which branch has the highest sales?"*). Every answer delivers structured Evidence, Calculations, Recommendations, and Assumptions.
- **🛒 200+ Unique Supermarket Products**: 18 supermarket categories including Rice & Grains, Pulses & Dals, Dairy, Cooking Oil, Bakery, Biscuits, Beverages, Personal Care, Household Products, Baby Care, Fruits, and Vegetables.
- **🏪 3 Supermarket Branches**:
  1. `STR-001`: SmartMart – Karur Main Branch
  2. `STR-002`: SmartMart – Tiruppur Branch
  3. `STR-003`: SmartMart – Coimbatore Branch
- **📊 Real-Time Multi-Store Analytics**: Live KPIs for Monthly Revenue (₹ INR), Units Sold, Asset Value, Gross Margin %, Stockout Risks, Low Stock, Overstock, and Slow-Moving SKUs.
- **🔴 Priority Triage ("What Needs Attention Today?")**: Automatic classification into High Priority (stockout risks, critical shortages, sales drops), Medium Priority (overstock, slow-moving items), and Positive Signals (sales spikes, fast-moving items).
- **📦 Visual Product Timeline & Audit**: Inspect complete product life-cycles from Opening Stock → Stock Received → Sales → Current Remaining Stock.
- **🧮 Dynamic Current Stock Calculation Engine**:
  $$\text{Current Stock} = \text{Opening Stock} + \text{Stock Received} + \text{Transfers In} + \text{Returns} - \text{Units Sold} - \text{Transfers Out} - \text{Damaged Stock} - \text{Adjustments}$$
- **🔄 Inter-Store Stock Transfers**: Solves stockout risks by rebalancing surplus inventory from donor stores before issuing new supplier POs.
- **📁 CSV Data Management & Validation**: Upload custom Stores, Products, and Sales CSV files with validation rules for negative prices, invalid dates, and schema compliance.

---

## 📂 Repository Structure

```text
your-project/
│
├── app.py                 # Main entrypoint: starts backend & serves frontend on port 8000
├── requirements.txt       # Python backend dependencies
├── README.md              # Documentation, setup & execution guide
│
├── src/                   # Core Python backend modules
│   ├── __init__.py        # Package marker
│   ├── data_loader.py     # Loads 7 CSV datasets from data/
│   ├── data_processor.py  # Stock calculation formulas, sales velocity & anomaly detection
│   ├── inventory.py       # Inventory runways, stockouts, overstock & transfer optimizer
│   ├── sales.py           # Revenue trends, category performance & daily analytics
│   ├── analytics.py       # Dashboard KPIs & "What Needs Attention Today?" triage
│   ├── copilot.py         # Evidence-Based Copilot engine (Answer, Evidence, Calc, Rec)
│   ├── recommendations.py # Inter-store transfer & supplier reorder PO processor
│   ├── csv_validator.py  # CSV schema & rule validation
│   └── utils.py           # INR currency formatters (₹) & date preset resolvers
│
├── frontend/
│   └── dist/              # Built & static production web application
│       ├── index.html     # SPA Single Page Application layout
│       ├── css/           # CSS design system (style.css)
│       └── js/            # Modular frontend controllers (app.js, api.js, copilot.js, etc.)
│
└── data/                  # 7 Supermarket CSV Datasets
    ├── products.csv       # 200+ unique supermarket SKUs
    ├── stores.csv         # Karur Main, Tiruppur, and Coimbatore branches
    ├── sales.csv          # 90 days sales transaction history
    ├── inventory.csv      # Per-store inventory ledgers
    ├── stock_arrivals.csv # Stock arrival logs (Invoice, batch, supplier)
    ├── stock_movements.csv# Granular movement audit log
    └── suppliers.csv      # Supplier master directory
```

---

## 🛠️ Prerequisites & Setup

### Requirements
- Python **3.9+**

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Application
Run the primary startup command:
```bash
python app.py
```

### 3. Open in Browser
Open your browser and navigate to:
**[http://localhost:8000](http://localhost:8000)** (or `http://127.0.0.1:8000`)

---

## ⚙️ Environment Variables

| Variable Name | Default Value | Description |
|---|---|---|
| `PORT` | `8000` | Server HTTP port binding |
| `HOST` | `0.0.0.0` | Host IP address binding |

Example running on custom port:
```bash
PORT=8080 python app.py
```

---

## 🤖 SmartMart AI Copilot Prompts

Try asking the Copilot:
- *"What products are running out?"*
- *"Which products should I reorder?"*
- *"Which products are overstocked?"*
- *"How did Aavin Milk perform this month?"*
- *"When did Aavin Milk last arrive?"*
- *"Which branch has the highest sales?"*

---

## 📜 License
MIT License
