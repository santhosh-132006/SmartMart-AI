"""
SmartMart AI – Main Python FastAPI Backend Server
Serves all REST analytics endpoints, Evidence-Based AI Copilot, Stock Auditing,
and static frontend mount for SmartMart Supermarket.
"""

import os
import json
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.data_loader import initialize_data_store
from src.data_processor import calculate_dynamic_stock
from src.inventory import get_inventory_intelligence
from src.sales import calculate_sales_analytics
from src.analytics import get_dashboard_analytics, generate_priority_triage_alerts
from src.copilot import process_smartmart_copilot_query
from src.recommendations import process_stock_transfer, process_supplier_reorder
from src.csv_validator import validate_stores_csv, validate_products_csv, validate_sales_csv
from src.utils import DEFAULT_SETTINGS

app = FastAPI(
    title="SmartMart AI API",
    description="Supermarket Sales & Inventory Copilot (TRACK_ID=PS03)",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Working Memory Dataset from 7 CSV files
DATA_STORE = initialize_data_store()
DATA_STORE["settings"] = dict(DEFAULT_SETTINGS)

# Request Models
class CopilotQueryRequest(BaseModel):
    query: str
    storeId: Optional[str] = "ALL"
    datePreset: Optional[str] = "last_30_days"
    customStart: Optional[str] = None
    customEnd: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    currency: Optional[str] = "INR"
    stockoutThresholdDays: Optional[float] = 3.0
    overstockThresholdDays: Optional[float] = 60.0
    slowMovingThresholdDays: Optional[float] = 30.0
    salesSpikeThresholdPercent: Optional[float] = 50.0
    salesDropThresholdPercent: Optional[float] = 40.0
    theme: Optional[str] = "light"

class TransferRequest(BaseModel):
    productId: str
    fromStoreId: str
    toStoreId: str
    quantity: int

class ReorderRequest(BaseModel):
    productId: str
    storeId: str
    quantity: int
    supplier: Optional[str] = "Direct Supplier"

class EmployeeRegisterRequest(BaseModel):
    name: str
    phoneNumber: str
    email: str
    employeeNo: str
    password: str
    branch: Optional[str] = "Karur Main Flagship"
    role: Optional[str] = "Employee"

class EmployeeLoginRequest(BaseModel):
    identifier: str
    password: str

# -------------------------------------------------------------
# 1. HEALTH & DATA ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "app": "SmartMart AI – Supermarket Sales & Inventory Copilot",
        "storesCount": len(DATA_STORE.get("stores", [])),
        "suppliersCount": len(DATA_STORE.get("suppliers", [])),
        "productsCount": len(DATA_STORE.get("products", [])),
        "salesRecordsCount": len(DATA_STORE.get("sales", [])),
        "inventoryRecordsCount": len(DATA_STORE.get("inventory", [])),
        "arrivalsCount": len(DATA_STORE.get("stock_arrivals", [])),
        "movementsCount": len(DATA_STORE.get("stock_movements", []))
    }

@app.post("/api/data/reset-demo")
def reset_demo():
    global DATA_STORE
    DATA_STORE = initialize_data_store()
    DATA_STORE["settings"] = dict(DEFAULT_SETTINGS)
    return {
        "message": "SmartMart dataset successfully reloaded.",
        "counts": {
            "stores": len(DATA_STORE["stores"]),
            "suppliers": len(DATA_STORE["suppliers"]),
            "products": len(DATA_STORE["products"]),
            "sales": len(DATA_STORE["sales"]),
            "stock_arrivals": len(DATA_STORE["stock_arrivals"]),
            "stock_movements": len(DATA_STORE["stock_movements"])
        }
    }

@app.get("/api/data/stores")
def get_stores():
    return DATA_STORE["stores"]

@app.get("/api/data/suppliers")
def get_suppliers():
    return DATA_STORE["suppliers"]

@app.get("/api/data/products")
def get_products():
    return DATA_STORE["products"]

@app.get("/api/data/inventory")
def get_inventory():
    return DATA_STORE["inventory"]

@app.get("/api/data/sales")
def get_sales(limit: int = 200):
    return DATA_STORE["sales"][:limit]

@app.get("/api/data/stock-arrivals")
def get_stock_arrivals(limit: int = 200):
    return DATA_STORE["stock_arrivals"][:limit]

@app.get("/api/data/stock-movements")
def get_stock_movements(limit: int = 200):
    return DATA_STORE["stock_movements"][:limit]

@app.get("/api/data/dynamic-stock-calculation")
def get_stock_calculation(productId: str, storeId: str = "ALL"):
    target_p = next((p for p in DATA_STORE["products"] if p["id"] == productId), None)
    opening_stock = target_p["openingStock"] if target_p else 100
    return calculate_dynamic_stock(
        productId,
        storeId,
        opening_stock,
        DATA_STORE["sales"],
        DATA_STORE["stock_movements"],
        DATA_STORE["stock_arrivals"]
    )

# -------------------------------------------------------------
# 2. ANALYTICS & DASHBOARD
# -------------------------------------------------------------
@app.get("/api/analytics/dashboard")
def get_dashboard(
    storeId: str = "ALL",
    preset: str = "last_30_days",
    startDate: Optional[str] = None,
    endDate: Optional[str] = None
):
    return get_dashboard_analytics(
        DATA_STORE["products"],
        DATA_STORE["stores"],
        DATA_STORE["inventory"],
        DATA_STORE["sales"],
        storeId,
        preset,
        startDate,
        endDate,
        DATA_STORE["settings"]
    )

@app.get("/api/analytics/sales")
def get_sales_analytics_route(
    storeId: str = "ALL",
    preset: str = "last_30_days",
    startDate: Optional[str] = None,
    endDate: Optional[str] = None
):
    return calculate_sales_analytics(
        DATA_STORE["products"],
        DATA_STORE["stores"],
        DATA_STORE["sales"],
        storeId,
        preset,
        startDate,
        endDate
    )

@app.get("/api/analytics/inventory")
def get_inventory_analytics_route(storeId: str = "ALL"):
    return get_inventory_intelligence(
        DATA_STORE["products"],
        DATA_STORE["stores"],
        DATA_STORE["inventory"],
        DATA_STORE["sales"],
        storeId,
        DATA_STORE["settings"]
    )

@app.get("/api/analytics/alerts")
def get_alerts_route(storeId: str = "ALL"):
    alerts = generate_priority_triage_alerts(
        DATA_STORE["products"],
        DATA_STORE["stores"],
        DATA_STORE["inventory"],
        DATA_STORE["sales"],
        DATA_STORE["settings"]
    )
    if storeId != "ALL":
        alerts = [a for a in alerts if a["storeId"] == storeId]

    return {
        "high": [a for a in alerts if a["priority"] == "high"],
        "medium": [a for a in alerts if a["priority"] == "medium"],
        "positive": [a for a in alerts if a["priority"] == "positive"],
        "totalCount": len(alerts)
    }

# -------------------------------------------------------------
# 3. EVIDENCE-BASED AI COPILOT
# -------------------------------------------------------------
@app.post("/api/copilot/query")
def copilot_query(req: CopilotQueryRequest):
    return process_smartmart_copilot_query(
        query=req.query,
        stores=DATA_STORE["stores"],
        products=DATA_STORE["products"],
        inventory=DATA_STORE["inventory"],
        sales=DATA_STORE["sales"],
        stock_arrivals=DATA_STORE["stock_arrivals"],
        stock_movements=DATA_STORE["stock_movements"],
        selected_store_id=req.storeId or "ALL",
        settings=DATA_STORE["settings"]
    )

# -------------------------------------------------------------
# 4. INVENTORY ACTIONS: TRANSFER & REORDER
# -------------------------------------------------------------
@app.post("/api/inventory/transfer")
def transfer_stock_route(req: TransferRequest):
    return process_stock_transfer(
        DATA_STORE["inventory"],
        DATA_STORE["products"],
        req.productId,
        req.fromStoreId,
        req.toStoreId,
        req.quantity
    )

@app.post("/api/inventory/reorder")
def reorder_stock_route(req: ReorderRequest):
    return process_supplier_reorder(
        DATA_STORE["products"],
        req.productId,
        req.storeId,
        req.quantity,
        req.supplier or "Direct Supplier"
    )

# -------------------------------------------------------------
# 5. DATA UPLOAD & SETTINGS
# -------------------------------------------------------------
@app.post("/api/data/upload")
async def upload_csv_file(dataType: str = Form(...), file: UploadFile = File(...)):
    content = (await file.read()).decode("utf-8-sig", errors="ignore")
    valid_store_ids = {s["id"] for s in DATA_STORE["stores"]}
    valid_product_ids = {p["id"] for p in DATA_STORE["products"]}

    if dataType == "stores":
        parsed, errors = validate_stores_csv(content)
        if not errors:
            DATA_STORE["stores"] = parsed
            return {"success": True, "count": len(parsed), "message": f"Successfully imported {len(parsed)} stores."}
        return {"success": False, "errors": errors}

    elif dataType == "products":
        parsed, errors = validate_products_csv(content)
        if not errors:
            DATA_STORE["products"] = parsed
            return {"success": True, "count": len(parsed), "message": f"Successfully imported {len(parsed)} products."}
        return {"success": False, "errors": errors}

    elif dataType == "sales":
        parsed, errors = validate_sales_csv(content, valid_store_ids, valid_product_ids)
        if not errors:
            DATA_STORE["sales"].extend(parsed)
            return {"success": True, "count": len(parsed), "message": f"Successfully imported {len(parsed)} sales transactions."}
        return {"success": False, "errors": errors}

    raise HTTPException(status_code=400, detail="Invalid data type specified.")

@app.get("/api/settings")
def get_settings():
    return DATA_STORE["settings"]

@app.post("/api/settings")
def update_settings(req: SettingsUpdateRequest):
    if req.currency:
        DATA_STORE["settings"]["currency"] = req.currency
        DATA_STORE["settings"]["currencySymbol"] = "₹" if req.currency == "INR" else "$"
    if req.stockoutThresholdDays is not None:
        DATA_STORE["settings"]["stockoutThresholdDays"] = req.stockoutThresholdDays
    if req.overstockThresholdDays is not None:
        DATA_STORE["settings"]["overstockThresholdDays"] = req.overstockThresholdDays
    if req.slowMovingThresholdDays is not None:
        DATA_STORE["settings"]["slowMovingThresholdDays"] = req.slowMovingThresholdDays
    if req.theme:
        DATA_STORE["settings"]["theme"] = req.theme

    return DATA_STORE["settings"]

# -------------------------------------------------------------
# 6. AUTHENTICATION & EMPLOYEE MANAGEMENT
# -------------------------------------------------------------
EMPLOYEES_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "employees.json")

def load_employees() -> List[Dict[str, Any]]:
    if os.path.exists(EMPLOYEES_FILE):
        try:
            with open(EMPLOYEES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return [
        {
            "name": "Amit Kapoor",
            "phoneNumber": "+91 98765 43210",
            "email": "employee@smartmart.retail",
            "employeeNo": "EMP-1001",
            "branch": "Karur Store Floor",
            "role": "Employee",
            "roleId": "employee",
            "password": "smartmart2026",
            "avatar": "🛒",
            "allowedViews": ["products", "arrivals", "movements", "stores", "settings"]
        }
    ]

def save_employees(employees_list: List[Dict[str, Any]]) -> None:
    try:
        os.makedirs(os.path.dirname(EMPLOYEES_FILE), exist_ok=True)
        with open(EMPLOYEES_FILE, "w", encoding="utf-8") as f:
            json.dump(employees_list, f, indent=2)
    except Exception as e:
        print(f"Error persisting employees: {e}")

DATA_STORE["employees"] = load_employees()

@app.get("/api/auth/employees")
def list_employees():
    sanitized = []
    for emp in DATA_STORE.get("employees", []):
        copy_emp = dict(emp)
        copy_emp.pop("password", None)
        sanitized.append(copy_emp)
    return {"count": len(sanitized), "employees": sanitized}

@app.post("/api/auth/register")
def register_employee(req: EmployeeRegisterRequest):
    name = req.name.strip()
    phone = req.phoneNumber.strip()
    email = req.email.strip().lower()
    emp_no = req.employeeNo.strip().upper()
    password = req.password.strip()
    branch = req.branch.strip() if req.branch else "Karur Store Floor"

    if not name or not phone or not email or not emp_no or not password:
        raise HTTPException(status_code=400, detail="All fields (Name, Phone Number, Mail ID, Employee No, Password) are required.")

    employees = DATA_STORE.get("employees", [])

    # Check for duplicate email or employeeNo
    for e in employees:
        if e.get("email", "").lower() == email:
            raise HTTPException(status_code=400, detail=f"Employee with email '{email}' already exists.")
        if e.get("employeeNo", "").upper() == emp_no:
            raise HTTPException(status_code=400, detail=f"Employee number '{emp_no}' is already registered.")

    role_str = (req.role or "Employee").strip()
    if role_str.lower() == "owner":
        role_title = "Owner"
        role_id = "owner"
        avatar = "👑"
        allowed = ["dashboard", "copilot", "sales", "products", "stores", "arrivals", "movements", "suppliers", "settings"]
    elif role_str.lower() == "manager":
        role_title = "Manager"
        role_id = "manager"
        avatar = "👔"
        allowed = ["dashboard", "copilot", "sales", "products", "stores", "arrivals", "movements", "suppliers", "settings"]
    else:
        role_title = "Employee"
        role_id = "employee"
        avatar = "🛒"
        allowed = ["dashboard", "products", "arrivals", "movements", "stores", "settings"]

    new_emp = {
        "name": name,
        "phoneNumber": phone,
        "email": email,
        "employeeNo": emp_no,
        "branch": branch,
        "role": role_title,
        "roleId": role_id,
        "avatar": avatar,
        "allowedViews": allowed,
        "password": password
    }

    employees.append(new_emp)
    DATA_STORE["employees"] = employees
    save_employees(employees)

    user_resp = dict(new_emp)
    user_resp.pop("password", None)
    return {
        "success": True,
        "message": f"{role_title} {name} ({emp_no}) successfully registered!",
        "user": user_resp
    }

@app.post("/api/auth/login")
def login_employee(req: EmployeeLoginRequest):
    ident = req.identifier.strip()
    pwd = req.password.strip()

    demo_accounts = {
        "owner@smartmart.retail": {
            "name": "Rajesh Sharma",
            "role": "Owner",
            "roleId": "owner",
            "email": "owner@smartmart.retail",
            "branch": "All Branches (Network Admin)",
            "avatar": "👑",
            "allowedViews": ["dashboard", "copilot", "sales", "products", "stores", "arrivals", "movements", "suppliers", "settings"]
        },
        "manager@smartmart.retail": {
            "name": "Priya Nair",
            "role": "Manager",
            "roleId": "manager",
            "email": "manager@smartmart.retail",
            "branch": "Karur Main Flagship",
            "avatar": "👔",
            "allowedViews": ["dashboard", "copilot", "sales", "products", "stores", "arrivals", "movements", "suppliers", "settings"]
        }
    }

    ident_lower = ident.lower()
    if ident_lower in demo_accounts and pwd == "smartmart2026":
        return {"success": True, "user": demo_accounts[ident_lower]}

    for emp in DATA_STORE.get("employees", []):
        if (emp.get("email", "").lower() == ident_lower or emp.get("employeeNo", "").upper() == ident.upper()) and emp.get("password") == pwd:
            user_resp = dict(emp)
            user_resp.pop("password", None)
            return {"success": True, "user": user_resp}

    raise HTTPException(status_code=401, detail="Invalid Mail ID/Employee No or password.")

# Mount static frontend directory from frontend/dist
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dist_dir = os.path.join(base_dir, "frontend", "dist")
frontend_dir = os.path.join(base_dir, "frontend")

if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="frontend")
elif os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
