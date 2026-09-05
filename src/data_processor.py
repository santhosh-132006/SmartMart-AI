"""
SmartMart AI – Data Processor Module
Processes sales, computes dynamic stock calculations, velocity, sales spikes/drops, and product performance.
"""

from typing import Dict, Any, List, Tuple

def calculate_dynamic_stock(
    product_id: str,
    store_id: str,
    opening_stock: int,
    sales_list: List[Dict[str, Any]],
    movements_list: List[Dict[str, Any]],
    arrivals_list: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Dynamically calculates Current Stock:
    Current Stock = Opening Stock + Stock Received + Transfers In + Returns - Units Sold - Transfers Out - Damaged Stock - Adjustments
    Returns exact mathematical audit dictionary.
    """
    units_sold = sum(
        s["unitsSold"] for s in sales_list
        if s["productId"] == product_id and (store_id == "ALL" or s["storeId"] == store_id)
    )
    
    # Filter movements
    prod_movements = [
        m for m in movements_list
        if m["productId"] == product_id and (store_id == "ALL" or m["storeId"] == store_id)
    ]
    
    stock_received = sum(m["quantity"] for m in prod_movements if m["movementType"] == "Stock Received")
    transfers_in = sum(m["quantity"] for m in prod_movements if m["movementType"] == "Stock Transfer In")
    transfers_out = sum(m["quantity"] for m in prod_movements if m["movementType"] == "Stock Transfer Out")
    damaged = sum(m["quantity"] for m in prod_movements if m["movementType"] == "Damaged Stock")
    returns = sum(m["quantity"] for m in prod_movements if m["movementType"] == "Returned Stock")
    adjustments = sum(m["quantity"] for m in prod_movements if m["movementType"] == "Stock Adjustment")

    calculated_current = max(0, opening_stock + stock_received + transfers_in + returns - units_sold - transfers_out - damaged - adjustments)

    formula_str = f"{opening_stock} (Opening) + {stock_received} (Received) + {transfers_in} (Transfers In) + {returns} (Returns) - {units_sold} (Units Sold) - {transfers_out} (Transfers Out) - {damaged} (Damaged) - {adjustments} (Adjustments) = {calculated_current}"

    return {
        "productId": product_id,
        "storeId": store_id,
        "openingStock": opening_stock,
        "stockReceived": stock_received,
        "transfersIn": transfers_in,
        "returns": returns,
        "unitsSold": units_sold,
        "transfersOut": transfers_out,
        "damagedStock": damaged,
        "adjustments": adjustments,
        "calculatedCurrentStock": calculated_current,
        "formula": formula_str
    }

def calculate_sales_velocity(
    sales_records: List[Dict[str, Any]],
    product_id: str,
    store_id: str = "ALL",
    days: int = 30
) -> Tuple[float, int]:
    """Calculates average daily sales volume and total units over recent N days."""
    filtered = [
        s for s in sales_records
        if s["productId"] == product_id and (store_id == "ALL" or s["storeId"] == store_id)
    ]
    total_units = sum(s["unitsSold"] for s in filtered)
    avg_daily = total_units / max(1, days)
    return round(avg_daily, 2), total_units

def detect_sales_spikes_and_drops(
    sales_records: List[Dict[str, Any]],
    products: List[Dict[str, Any]],
    spike_threshold_pct: float = 50.0,
    drop_threshold_pct: float = 40.0
) -> Dict[str, List[Dict[str, Any]]]:
    """Compares recent 7-day sales velocity vs prior 30-day average to detect spikes and drops."""
    spikes = []
    drops = []

    # Map product historical average
    for p in products:
        pid = p["id"]
        pname = p["name"]
        sid = p["storeId"]
        
        prod_sales = [s for s in sales_records if s["productId"] == pid and s["storeId"] == sid]
        if not prod_sales:
            continue
            
        # Recent 7 days vs prior period
        recent_7 = prod_sales[-7:] if len(prod_sales) >= 7 else prod_sales
        prior_30 = prod_sales[:-7] if len(prod_sales) > 7 else prod_sales
        
        recent_avg = sum(s["unitsSold"] for s in recent_7) / max(1, len(recent_7))
        prior_avg = sum(s["unitsSold"] for s in prior_30) / max(1, len(prior_30))
        
        if prior_avg > 0:
            pct_change = ((recent_avg - prior_avg) / prior_avg) * 100
            
            if pct_change >= spike_threshold_pct:
                spikes.append({
                    "productId": pid,
                    "productName": pname,
                    "storeId": sid,
                    "storeName": p.get("storeName", sid),
                    "historicalAvg": round(prior_avg, 2),
                    "recentAvg": round(recent_avg, 2),
                    "pctChange": round(pct_change, 1),
                    "reason": f"Sales velocity surged +{round(pct_change, 1)}% ({round(recent_avg, 1)} units/day vs {round(prior_avg, 1)} historical avg)."
                })
            elif pct_change <= -drop_threshold_pct:
                drops.append({
                    "productId": pid,
                    "productName": pname,
                    "storeId": sid,
                    "storeName": p.get("storeName", sid),
                    "historicalAvg": round(prior_avg, 2),
                    "recentAvg": round(recent_avg, 2),
                    "pctChange": round(pct_change, 1),
                    "reason": f"Sales velocity dropped {round(pct_change, 1)}% ({round(recent_avg, 1)} units/day vs {round(prior_avg, 1)} historical avg)."
                })

    return {"spikes": spikes, "drops": drops}
