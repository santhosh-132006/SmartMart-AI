"""
SmartMart AI – Data Loader Module
Loads, parses, and maintains in-memory supermarket datasets from the 7 CSV files in data/.
"""

import os
import csv
from typing import Dict, Any, List

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

def load_csv(filename: str) -> List[Dict[str, Any]]:
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return []
    
    records = []
    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            parsed = {}
            for k, v in row.items():
                v_str = str(v).strip()
                # Cast numeric types if appropriate
                if v_str.isdigit():
                    parsed[k] = int(v_str)
                else:
                    try:
                        parsed[k] = float(v_str) if ("." in v_str and v_str.replace(".", "", 1).isdigit()) else v_str
                    except ValueError:
                        parsed[k] = v_str
            records.append(parsed)
    return records

def initialize_data_store() -> Dict[str, Any]:
    """Loads all 7 supermarket CSV datasets into an in-memory dictionary."""
    return {
        "stores": load_csv("stores.csv"),
        "suppliers": load_csv("suppliers.csv"),
        "products": load_csv("products.csv"),
        "inventory": load_csv("inventory.csv"),
        "sales": load_csv("sales.csv"),
        "stock_arrivals": load_csv("stock_arrivals.csv"),
        "stock_movements": load_csv("stock_movements.csv")
    }
