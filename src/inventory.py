"""
SmartMart AI – Inventory Intelligence Module
Analyzes inventory runways (Days Remaining = Current Stock / Avg Daily Sales),
stockout risks, low stock, overstock, slow-moving items, and stock transfers.
"""

from typing import Dict, Any, List

def calculate_inventory_runway(current_stock: int, avg_daily_sales: float) -> float:
    """Estimated Days Remaining = Current Stock ÷ Average Daily Sales."""
    if avg_daily_sales <= 0:
        return 999.0  # Stagnant / Infinite runway
    return round(current_stock / avg_daily_sales, 1)

def get_inventory_intelligence(
    products: List[Dict[str, Any]],
    stores: List[Dict[str, Any]],
    inventory: List[Dict[str, Any]],
    sales: List[Dict[str, Any]],
    store_id: str = "ALL",
    settings: Dict[str, Any] = None
) -> Dict[str, Any]:
    """Generates complete supermarket inventory intelligence report."""
    if settings is None:
        settings = {
            "stockoutThresholdDays": 3.0,
            "overstockThresholdDays": 60.0,
            "slowMovingThresholdDays": 30.0
        }

    stockout_thresh = settings.get("stockoutThresholdDays", 3.0)
    overstock_thresh = settings.get("overstockThresholdDays", 60.0)

    filtered_products = [
        p for p in products if store_id == "ALL" or p["storeId"] == store_id
    ]

    stockouts = []
    low_stock = []
    overstocked = []
    slow_moving = []
    fast_moving = []

    for p in filtered_products:
        curr_stock = p["currentStock"]
        avg_daily = p["averageDailySales"]
        days_rem = calculate_inventory_runway(curr_stock, avg_daily)
        reorder_lvl = p["reorderLevel"]

        item_data = {
            **p,
            "daysRemaining": days_rem,
            "runwayText": f"{days_rem} days" if days_rem < 900 else "No active sales"
        }

        # Classify status
        if curr_stock == 0 or days_rem <= stockout_thresh or p["status"] == "stockout_risk":
            stockouts.append(item_data)
        elif curr_stock <= reorder_lvl or p["status"] == "low_stock":
            low_stock.append(item_data)

        if days_rem >= overstock_thresh or p["status"] == "overstocked":
            excess_units = max(0, curr_stock - int(avg_daily * 30))
            tied_capital = excess_units * p["costPrice"]
            overstocked.append({
                **item_data,
                "excessUnits": excess_units,
                "tiedUpCapital": tied_capital
            })

        if avg_daily <= 0.2 or p["status"] == "slow_moving":
            slow_moving.append(item_data)

        if avg_daily >= 8.0 or p["status"] == "sales_spike":
            fast_moving.append(item_data)

    # Generate Inter-Store Stock Transfer Recommendations
    # Identify items low in Store A but with high surplus stock in Store B
    transfer_recommendations = []
    store_map = {s["id"]: s["name"] for s in stores}

    for store in stores:
        dest_sid = store["id"]
        dest_p_list = [p for p in products if p["storeId"] == dest_sid]

        for p in dest_p_list:
            d_runway = calculate_inventory_runway(p["currentStock"], p["averageDailySales"])
            if d_runway <= 3.0 or p["currentStock"] <= p["reorderLevel"]:
                # Search for a donor store with high stock for the same product name
                donor = next((
                    other for other in products
                    if other["name"] == p["name"]
                    and other["storeId"] != dest_sid
                    and other["currentStock"] >= 40
                ), None)

                if donor:
                    suggested_qty = min(20, round(donor["currentStock"] * 0.4))
                    transfer_recommendations.append({
                        "productId": p["id"],
                        "productName": p["name"],
                        "category": p["category"],
                        "destinationStoreId": dest_sid,
                        "destinationStoreName": store["name"],
                        "destinationCurrentStock": p["currentStock"],
                        "destinationRunwayDays": d_runway,
                        "sourceStoreId": donor["storeId"],
                        "sourceStoreName": store_map.get(donor["storeId"], donor["storeId"]),
                        "sourceCurrentStock": donor["currentStock"],
                        "suggestedTransferQty": suggested_qty,
                        "reason": f"{store['name']} has only {d_runway} days runway ({p['currentStock']} units left) while {store_map.get(donor['storeId'])} has {donor['currentStock']} units in stock."
                    })

    return {
        "products": filtered_products,
        "stockouts": stockouts,
        "lowStock": low_stock,
        "overstocked": overstocked,
        "slowMoving": slow_moving,
        "fastMoving": fast_moving,
        "transferRecommendations": transfer_recommendations,
        "counts": {
            "stockouts": len(stockouts),
            "lowStock": len(low_stock),
            "overstocked": len(overstocked),
            "slowMoving": len(slow_moving),
            "fastMoving": len(fast_moving),
            "transfers": len(transfer_recommendations)
        }
    }
