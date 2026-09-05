"""
SmartMart AI – Recommendation Engine Module
Handles stock transfer recommendations and supplier purchase reorders.
"""

from typing import Dict, Any, List

def process_stock_transfer(
    inventory: List[Dict[str, Any]],
    products: List[Dict[str, Any]],
    product_id: str,
    from_store_id: str,
    to_store_id: str,
    quantity: int
) -> Dict[str, Any]:
    """Executes inter-store stock transfer in working dataset."""
    source_p = next((p for p in products if p["id"] == product_id and p["storeId"] == from_store_id), None)
    dest_p = next((p for p in products if p["id"] == product_id and p["storeId"] == to_store_id), None)

    if not source_p or source_p["currentStock"] < quantity:
        return {
            "success": False,
            "message": f"Insufficient stock at source store. Source has {source_p['currentStock'] if source_p else 0} units."
        }

    source_p["currentStock"] -= quantity
    if dest_p:
        dest_p["currentStock"] += quantity
    
    return {
        "success": True,
        "message": f"Successfully transferred {quantity} units of {source_p['name']} from {from_store_id} to {to_store_id}.",
        "sourceNewStock": source_p["currentStock"],
        "destNewStock": dest_p["currentStock"] if dest_p else quantity
    }

def process_supplier_reorder(
    products: List[Dict[str, Any]],
    product_id: str,
    store_id: str,
    quantity: int,
    supplier_name: str = "Direct Supplier"
) -> Dict[str, Any]:
    """Places supplier purchase reorder PO."""
    target_p = next((p for p in products if p["id"] == product_id and p["storeId"] == store_id), None)

    if target_p:
        target_p["currentStock"] += quantity
        target_p["status"] = "healthy"
        new_stock = target_p["currentStock"]
        pname = target_p["name"]
    else:
        new_stock = quantity
        pname = product_id

    return {
        "success": True,
        "message": f"Reorder Purchase Order (PO) placed for {quantity} units of {pname} from {supplier_name}.",
        "newStock": new_stock
    }
