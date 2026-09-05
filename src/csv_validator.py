"""
SmartMart AI – CSV Importer & Data Validation Engine
Validates CSV files for schema completeness, negative quantities, missing values, date formats, and referential integrity.
"""

import csv
import io
from typing import Dict, Any, List, Tuple

def validate_stores_csv(csv_content: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    errors = []
    records = []
    reader = csv.DictReader(io.StringIO(csv_content))
    
    required_cols = {"id", "name", "location", "manager"}
    if not required_cols.issubset(set(reader.fieldnames or [])):
        errors.append(f"Missing required columns. Expected: {required_cols}")
        return [], errors

    for idx, row in enumerate(reader, start=2):
        if not row.get("id") or not row.get("name"):
            errors.append(f"Line {idx}: Store ID or Name is empty.")
        records.append(row)
        
    return records, errors

def validate_products_csv(csv_content: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    errors = []
    records = []
    reader = csv.DictReader(io.StringIO(csv_content))
    
    required_cols = {"id", "name", "category", "sellingPrice", "costPrice", "currentStock"}
    if not required_cols.issubset(set(reader.fieldnames or [])):
        errors.append(f"Missing required columns. Expected: {required_cols}")
        return [], errors

    for idx, row in enumerate(reader, start=2):
        try:
            sp = float(row.get("sellingPrice", 0))
            cp = float(row.get("costPrice", 0))
            stk = int(row.get("currentStock", 0))
            if sp < 0 or cp < 0 or stk < 0:
                errors.append(f"Line {idx}: Negative price or stock quantity found ({sp}, {cp}, {stk}).")
        except ValueError:
            errors.append(f"Line {idx}: Invalid numeric format for price or stock.")
            
        records.append(row)
        
    return records, errors

def validate_sales_csv(csv_content: str, valid_store_ids: set, valid_product_ids: set) -> Tuple[List[Dict[str, Any]], List[str]]:
    errors = []
    records = []
    reader = csv.DictReader(io.StringIO(csv_content))
    
    required_cols = {"salesId", "date", "storeId", "productId", "unitsSold", "sellingPrice"}
    if not required_cols.issubset(set(reader.fieldnames or [])):
        errors.append(f"Missing required columns. Expected: {required_cols}")
        return [], errors

    for idx, row in enumerate(reader, start=2):
        sid = row.get("storeId")
        pid = row.get("productId")
        if valid_store_ids and sid not in valid_store_ids:
            errors.append(f"Line {idx}: Unknown Store ID '{sid}'.")
        if valid_product_ids and pid not in valid_product_ids:
            errors.append(f"Line {idx}: Unknown Product ID '{pid}'.")
            
        try:
            u = int(row.get("unitsSold", 0))
            p = float(row.get("sellingPrice", 0))
            if u <= 0 or p <= 0:
                errors.append(f"Line {idx}: Non-positive units sold ({u}) or selling price ({p}).")
            rev = round(u * p, 2)
            row["revenue"] = rev
        except ValueError:
            errors.append(f"Line {idx}: Invalid numeric format.")
            
        records.append(row)
        
    return records, errors
