"""
SmartMart AI – Sales Analytics Module
Calculates revenue trends, store sales, category performance, and period comparisons.
"""

from typing import Dict, Any, List
from src.utils import resolve_date_range

def calculate_sales_trend(
    sales: List[Dict[str, Any]],
    store_id: str = "ALL",
    preset: str = "last_30_days",
    custom_start: str = None,
    custom_end: str = None
) -> List[Dict[str, Any]]:
    """Groups daily revenue and units sold within selected date range."""
    start_date, end_date, _ = resolve_date_range(preset, custom_start, custom_end)

    filtered = [
        s for s in sales
        if (store_id == "ALL" or s["storeId"] == store_id)
        and (start_date <= s["date"] <= end_date)
    ]

    daily_map = {}
    for s in filtered:
        dt = s["date"]
        if dt not in daily_map:
            daily_map[dt] = {"date": dt, "revenue": 0.0, "units": 0}
        daily_map[dt]["revenue"] += s["revenue"]
        daily_map[dt]["units"] += s["unitsSold"]

    sorted_dates = sorted(daily_map.values(), key=lambda x: x["date"])
    return sorted_dates

def calculate_category_analytics(
    products: List[Dict[str, Any]],
    sales: List[Dict[str, Any]],
    store_id: str = "ALL"
) -> List[Dict[str, Any]]:
    """Groups sales revenue, units, and SKU counts by supermarket category."""
    cat_map = {}
    
    prod_map = {p["id"]: p for p in products}
    
    for s in sales:
        if store_id != "ALL" and s["storeId"] != store_id:
            continue
            
        pid = s["productId"]
        cat = prod_map[pid]["category"] if pid in prod_map else "General Grocery"
        
        if cat not in cat_map:
            cat_map[cat] = {"category": cat, "revenue": 0.0, "units": 0, "skus": set()}
            
        cat_map[cat]["revenue"] += s["revenue"]
        cat_map[cat]["units"] += s["unitsSold"]
        cat_map[cat]["skus"].add(pid)

    result = []
    for cat, data in cat_map.items():
        result.append({
            "category": cat,
            "revenue": round(data["revenue"], 2),
            "units": data["units"],
            "skuCount": len(data["skus"])
        })

    return sorted(result, key=lambda x: x["revenue"], reverse=True)

def calculate_sales_analytics(
    products: List[Dict[str, Any]],
    stores: List[Dict[str, Any]],
    sales: List[Dict[str, Any]],
    store_id: str = "ALL",
    preset: str = "last_30_days",
    custom_start: str = None,
    custom_end: str = None
) -> Dict[str, Any]:
    """Generates complete sales analytics report."""
    start_date, end_date, label = resolve_date_range(preset, custom_start, custom_end)

    trend = calculate_sales_trend(sales, store_id, preset, custom_start, custom_end)
    categories = calculate_category_analytics(products, sales, store_id)

    total_revenue = sum(t["revenue"] for t in trend)
    total_units = sum(t["units"] for t in trend)
    avg_daily_sales = round(total_units / max(1, len(trend)), 2)

    return {
        "period": {"startDate": start_date, "endDate": end_date, "label": label},
        "summary": {
            "totalRevenue": round(total_revenue, 2),
            "unitsSold": total_units,
            "avgDailySales": avg_daily_sales,
            "activeDays": len(trend)
        },
        "trend": trend,
        "categories": categories
    }
