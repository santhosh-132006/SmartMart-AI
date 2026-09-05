"""
SmartMart AI – Utility & Helper Functions
Handles date preset resolutions, Indian Rupee (₹) formatting, and math helper functions.
"""

from datetime import datetime, timedelta

DEFAULT_SETTINGS = {
    "currency": "INR",
    "currencySymbol": "₹",
    "stockoutThresholdDays": 3.0,
    "overstockThresholdDays": 60.0,
    "slowMovingThresholdDays": 30.0,
    "salesSpikeThresholdPercent": 50.0,
    "salesDropThresholdPercent": 40.0,
    "theme": "light"
}

def format_currency(val: float, symbol: str = "₹") -> str:
    """Format currency values cleanly in Indian Rupee (₹) and Indian numbering system (Lakhs/Crores)."""
    if val is None:
        return f"{symbol}0"
    
    abs_val = abs(val)
    sign = "-" if val < 0 else ""
    
    if abs_val >= 10_000_000:
        return f"{sign}{symbol}{abs_val / 10_000_000:.2f} Cr"
    if abs_val >= 100_000:
        return f"{sign}{symbol}{abs_val / 100_000:.2f} L"
    
    # Format with Indian comma grouping
    s = f"{int(round(abs_val))}"
    if len(s) <= 3:
        formatted = s
    else:
        last3 = s[-3:]
        remaining = s[:-3]
        groups = []
        while len(remaining) > 2:
            groups.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        if remaining:
            groups.insert(0, remaining)
        formatted = ",".join(groups) + "," + last3
        
    return f"{sign}{symbol}{formatted}"

def resolve_date_range(preset: str = "last_30_days", custom_start: str = None, custom_end: str = None):
    """
    Resolve date presets into start_date and end_date strings (YYYY-MM-DD).
    Default anchor date: September 5, 2026.
    """
    anchor = datetime(2026, 9, 5)

    if preset == "today":
        start_dt = anchor
        end_dt = anchor
        label = "Today (Sep 5, 2026)"
    elif preset == "last_7_days":
        start_dt = anchor - timedelta(days=6)
        end_dt = anchor
        label = "Last 7 Days"
    elif preset == "last_30_days":
        start_dt = anchor - timedelta(days=29)
        end_dt = anchor
        label = "Last 30 Days"
    elif preset == "this_month":
        start_dt = datetime(2026, 9, 1)
        end_dt = anchor
        label = "This Month (Sep 2026)"
    elif preset == "previous_month":
        start_dt = datetime(2026, 8, 1)
        end_dt = datetime(2026, 8, 31)
        label = "Previous Month (Aug 2026)"
    elif preset == "custom" and custom_start and custom_end:
        try:
            start_dt = datetime.strptime(custom_start, "%Y-%m-%d")
            end_dt = datetime.strptime(custom_end, "%Y-%m-%d")
            label = f"Custom ({custom_start} to {custom_end})"
        except ValueError:
            start_dt = anchor - timedelta(days=29)
            end_dt = anchor
            label = "Last 30 Days"
    else:
        start_dt = anchor - timedelta(days=29)
        end_dt = anchor
        label = "Last 30 Days"

    return start_dt.strftime("%Y-%m-%d"), end_dt.strftime("%Y-%m-%d"), label
