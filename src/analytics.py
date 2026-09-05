"""
SmartMart AI – Main Analytics Engine & Priority Triage Module
Calculates multi-store KPIs, store comparison matrices, and "What Needs Attention Today?" triage alerts.
"""

from typing import Dict, Any, List
from src.utils import resolve_date_range
from src.data_processor import detect_sales_spikes_and_drops
from src.inventory import get_inventory_intelligence

def generate_priority_triage_alerts(
    products: List[Dict[str, Any]],
    stores: List[Dict[str, Any]],
    inventory: List[Dict[str, Any]],
    sales: List[Dict[str, Any]],
    settings: Dict[str, Any] = None
) -> List[Dict[str, Any]]:
    """
    Generates "What Needs Attention Today?" priority alerts:
    - 🔴 High Priority: Stock-out risks, critical low stock, major sales drops
    - 🟠 Medium Priority: Overstock, slow-moving products
    - 🟢 Positive Signals: Sales spikes, fast-moving items, top store performance
    Each alert contains: Problem + Product + Store + Actual Numbers + Reason + Recommendation
    """
    alerts = []
    store_map = {s["id"]: s["name"] for s in stores}

    # 1. Stockout Risks & Low Stock (High Priority)
    for p in products:
        days_rem = p.get("estimatedDaysRemaining", 999.0)
        curr_stock = p["currentStock"]
        reorder_lvl = p["reorderLevel"]
        avg_daily = p["averageDailySales"]
        s_name = store_map.get(p["storeId"], p["storeId"])

        if curr_stock == 0 or days_rem <= 3.0 or p["status"] == "stockout_risk":
            alerts.append({
                "id": f"ALT-STOCKOUT-{p['id']}-{p['storeId']}",
                "priority": "high",
                "priorityLabel": "🔴 High Priority",
                "type": "Stock-out Risk",
                "productId": p["id"],
                "productName": p["name"],
                "storeId": p["storeId"],
                "storeName": s_name,
                "numbers": f"Stock: {curr_stock} units | Runway: {days_rem} days | Avg Daily Sales: {avg_daily} units",
                "reason": f"{p['name']} at {s_name} has only {curr_stock} units left with an average velocity of {avg_daily} units/day. Estimated runway is {days_rem} days.",
                "recommendation": f"Immediately place supplier purchase reorder for {max(30, int(avg_daily * 14))} units or transfer stock from another branch."
            })
        elif curr_stock <= reorder_lvl or p["status"] == "low_stock":
            alerts.append({
                "id": f"ALT-LOWSTOCK-{p['id']}-{p['storeId']}",
                "priority": "high",
                "priorityLabel": "🔴 High Priority",
                "type": "Low Stock Warning",
                "productId": p["id"],
                "productName": p["name"],
                "storeId": p["storeId"],
                "storeName": s_name,
                "numbers": f"Stock: {curr_stock} units | Reorder Level: {reorder_lvl} units | Runway: {days_rem} days",
                "reason": f"Current stock ({curr_stock} units) has fallen below reorder threshold ({reorder_lvl} units) at {s_name}.",
                "recommendation": f"Prepare reorder PO for {max(25, int(avg_daily * 10))} units."
            })

    # 2. Sales Spikes & Drops
    anomaly_data = detect_sales_spikes_and_drops(sales, products)

    for drop in anomaly_data["drops"]:
        alerts.append({
            "id": f"ALT-DROP-{drop['productId']}-{drop['storeId']}",
            "priority": "high",
            "priorityLabel": "🔴 High Priority",
            "type": "Major Sales Drop",
            "productId": drop["productId"],
            "productName": drop["productName"],
            "storeId": drop["storeId"],
            "storeName": drop["storeName"],
            "numbers": f"Recent Velocity: {drop['recentAvg']} units/day vs Historical: {drop['historicalAvg']} units/day ({drop['pctChange']}%)",
            "reason": drop["reason"],
            "recommendation": "Inspect product pricing, shelf placement, or competitor promotions at this branch."
        })

    for spike in anomaly_data["spikes"]:
        alerts.append({
            "id": f"ALT-SPIKE-{spike['productId']}-{spike['storeId']}",
            "priority": "positive",
            "priorityLabel": "🟢 Positive Signal",
            "type": "Sales Spike",
            "productId": spike["productId"],
            "productName": spike["productName"],
            "storeId": spike["storeId"],
            "storeName": spike["storeName"],
            "numbers": f"Recent Velocity: {spike['recentAvg']} units/day vs Historical: {spike['historicalAvg']} units/day (+{spike['pctChange']}%)",
            "reason": spike["reason"],
            "recommendation": "Ensure adequate safety stock to prevent unexpected stockouts during this demand surge."
        })

    # 3. Overstock & Slow-Moving (Medium Priority)
    for p in products:
        days_rem = p.get("estimatedDaysRemaining", 999.0)
        curr_stock = p["currentStock"]
        avg_daily = p["averageDailySales"]
        s_name = store_map.get(p["storeId"], p["storeId"])

        if (days_rem >= 60.0 and curr_stock >= 100) or p["status"] == "overstocked":
            excess = max(0, curr_stock - int(avg_daily * 30))
            tied_capital = excess * p["costPrice"]
            alerts.append({
                "id": f"ALT-OVERSTOCK-{p['id']}-{p['storeId']}",
                "priority": "medium",
                "priorityLabel": "🟠 Medium Priority",
                "type": "Overstock Warning",
                "productId": p["id"],
                "productName": p["name"],
                "storeId": p["storeId"],
                "storeName": s_name,
                "numbers": f"Stock: {curr_stock} units | Runway: {days_rem} days | Excess Capital Tied-Up: ₹{tied_capital:,.2f}",
                "reason": f"Excess inventory holding {excess} surplus units at {s_name}, tying up working capital.",
                "recommendation": "Initiate promotional bundle discount or reallocate surplus stock to high-demand branches."
            })
        elif avg_daily <= 0.2 or p["status"] == "slow_moving":
            alerts.append({
                "id": f"ALT-SLOW-{p['id']}-{p['storeId']}",
                "priority": "medium",
                "priorityLabel": "🟠 Medium Priority",
                "type": "Slow-Moving Product",
                "productId": p["id"],
                "productName": p["name"],
                "storeId": p["storeId"],
                "storeName": s_name,
                "numbers": f"Stock: {curr_stock} units | Avg Daily Velocity: {avg_daily} units/day",
                "reason": f"Product velocity is stagnant at {s_name} with less than 2 units sold per month.",
                "recommendation": "Evaluate promotional clearance or replace SKU allocation."
            })

    return alerts

def get_dashboard_analytics(
    products: List[Dict[str, Any]],
    stores: List[Dict[str, Any]],
    inventory: List[Dict[str, Any]],
    sales: List[Dict[str, Any]],
    store_id: str = "ALL",
    preset: str = "last_30_days",
    custom_start: str = None,
    custom_end: str = None,
    settings: Dict[str, Any] = None
) -> Dict[str, Any]:
    """Computes complete dashboard KPIs, alerts, trends, and store analytics."""
    start_date, end_date, period_label = resolve_date_range(preset, custom_start, custom_end)

    # Filter sales
    filtered_sales = [
        s for s in sales
        if (store_id == "ALL" or s["storeId"] == store_id)
        and (start_date <= s["date"] <= end_date)
    ]

    total_sales = sum(s["revenue"] for s in filtered_sales)
    units_sold = sum(s["unitsSold"] for s in filtered_sales)

    # Inventory rollup
    filtered_products = [p for p in products if store_id == "ALL" or p["storeId"] == store_id]
    total_inventory_units = sum(p["currentStock"] for p in filtered_products)
    total_inventory_value = sum(p["currentStock"] * p["costPrice"] for p in filtered_products)
    total_profit = sum((p["sellingPrice"] - p["costPrice"]) * p["unitsSoldThisMonth"] for p in filtered_products)

    # Status counts
    stockouts_count = len([p for p in filtered_products if p["currentStock"] == 0 or p.get("estimatedDaysRemaining", 999) <= 3.0 or p["status"] == "stockout_risk"])
    low_stock_count = len([p for p in filtered_products if p["currentStock"] <= p["reorderLevel"] or p["status"] == "low_stock"])
    overstock_count = len([p for p in filtered_products if p.get("estimatedDaysRemaining", 0) >= 60.0 or p["status"] == "overstocked"])
    slow_moving_count = len([p for p in filtered_products if p["averageDailySales"] <= 0.2 or p["status"] == "slow_moving"])
    spikes_count = len([p for p in filtered_products if p["status"] == "sales_spike"])

    # Triage alerts
    alerts = generate_priority_triage_alerts(products, stores, inventory, sales, settings)
    if store_id != "ALL":
        alerts = [a for a in alerts if a["storeId"] == store_id]

    # Store Comparison Matrix
    store_matrix = []
    for s in stores:
        s_prods = [p for p in products if p["storeId"] == s["id"]]
        s_sales = [sl for sl in sales if sl["storeId"] == s["id"] and start_date <= sl["date"] <= end_date]
        s_rev = sum(sl["revenue"] for sl in s_sales)
        s_units = sum(sl["unitsSold"] for sl in s_sales)
        s_stock_val = sum(p["currentStock"] * p["costPrice"] for p in s_prods)

        store_matrix.append({
            "id": s["id"],
            "name": s["name"],
            "location": s["location"],
            "manager": s["manager"],
            "phone": s["phone"],
            "totalRevenue": round(s_rev, 2),
            "unitsSold": s_units,
            "inventoryValue": round(s_stock_val, 2),
            "productCount": len(s_prods),
            "stockoutsCount": len([p for p in s_prods if p["currentStock"] <= p["reorderLevel"]])
        })

    return {
        "period": {
            "preset": preset,
            "startDate": start_date,
            "endDate": end_date,
            "label": period_label
        },
        "kpis": {
            "totalSales": round(total_sales, 2),
            "unitsSold": units_sold,
            "totalProfit": round(total_profit, 2),
            "grossMargin": round((total_profit / max(1, total_sales)) * 100, 1),
            "currentInventoryUnits": total_inventory_units,
            "inventoryValue": round(total_inventory_value, 2),
            "lowStockCount": low_stock_count,
            "potentialStockoutCount": stockouts_count,
            "overstockedCount": overstock_count,
            "slowMovingCount": slow_moving_count,
            "salesSpikesCount": spikes_count
        },
        "alertsTriage": {
            "high": [a for a in alerts if a["priority"] == "high"],
            "medium": [a for a in alerts if a["priority"] == "medium"],
            "positive": [a for a in alerts if a["priority"] == "positive"],
            "totalCount": len(alerts)
        },
        "stores": store_matrix,
        "topSellingProducts": sorted(filtered_products, key=lambda x: x["unitsSoldThisMonth"], reverse=True)[:5],
        "criticalShortages": [p for p in filtered_products if p["currentStock"] <= p["reorderLevel"]][:5]
    }
