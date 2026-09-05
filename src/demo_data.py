"""
RetailIQ - Preloaded Demo Dataset
Contains 3 stores, 25 products across 5 categories, 75 inventory records,
and 67 days of realistic sales transactions (July 1, 2026 - September 5, 2026).
"""

import math
from typing import List, Dict, Any

DEMO_STORES: List[Dict[str, Any]] = [
    {
        "id": "STR-001",
        "name": "Nexus Metro Flagship",
        "location": "Downtown Central, Mumbai",
        "address": "42 Phoenix Palladium, High Street Phoenix, Lower Parel, Mumbai 400013",
        "manager": "Rajesh Sharma",
        "phone": "+91 98201 44521",
        "email": "mumbai.flagship@nexusiq.retail",
        "operatingHours": "10:00 AM - 10:00 PM"
    },
    {
        "id": "STR-002",
        "name": "Nexus Tech Hub",
        "location": "Cyber City, Bengaluru",
        "address": "Plot 18, Electronic City Phase 1, Near Infosys Gate 3, Bengaluru 560100",
        "manager": "Priya Sundaram",
        "phone": "+91 99002 88319",
        "email": "bangalore.techhub@nexusiq.retail",
        "operatingHours": "09:30 AM - 09:30 PM"
    },
    {
        "id": "STR-003",
        "name": "Nexus Suburban Express",
        "location": "Westside Galleria, Delhi NCR",
        "address": "Shop G-14, DLF Avenue Mall, Sector 29, Gurugram 122002",
        "manager": "Vikram Malhotra",
        "phone": "+91 98110 33290",
        "email": "delhi.suburban@nexusiq.retail",
        "operatingHours": "10:30 AM - 10:30 PM"
    }
]

DEMO_PRODUCTS: List[Dict[str, Any]] = [
    # Peripherals
    {
        "id": "PRD-001",
        "name": "Logitech MX Master 3S Wireless Mouse",
        "sku": "LOGI-MX3S-GRY",
        "category": "Peripherals",
        "unit": "pcs",
        "costPrice": 6200,
        "sellingPrice": 8995,
        "reorderLevel": 25,
        "targetStock": 60,
        "supplier": "LogiTech Direct Asia",
        "leadTimeDays": 3,
        "description": "Ergonomic performance wireless mouse with 8K DPI tracking and Quiet Clicks."
    },
    {
        "id": "PRD-002",
        "name": "Keychron K2 Mechanical Keyboard (Hot-Swap)",
        "sku": "KEY-K2-RGB",
        "category": "Peripherals",
        "unit": "pcs",
        "costPrice": 5800,
        "sellingPrice": 8499,
        "reorderLevel": 20,
        "targetStock": 50,
        "supplier": "Keychron India Dist.",
        "leadTimeDays": 4,
        "description": "75% layout compact Bluetooth/wired mechanical keyboard with Gateron G Pro Brown switches."
    },
    {
        "id": "PRD-003",
        "name": "Dell UltraSharp 27\" 4K UHD USB-C Monitor",
        "sku": "DELL-U2723QE",
        "category": "Peripherals",
        "unit": "pcs",
        "costPrice": 38500,
        "sellingPrice": 49990,
        "reorderLevel": 10,
        "targetStock": 25,
        "supplier": "Dell Enterprise Solutions",
        "leadTimeDays": 5,
        "description": "27-inch 4K IPS Black monitor with 98% DCI-P3 and 90W USB-C power delivery."
    },
    {
        "id": "PRD-004",
        "name": "Anker PowerExpand 8-in-1 USB-C Hub",
        "sku": "ANK-HUB-8IN1",
        "category": "Peripherals",
        "unit": "pcs",
        "costPrice": 3200,
        "sellingPrice": 4999,
        "reorderLevel": 30,
        "targetStock": 80,
        "supplier": "Anker Innovations",
        "leadTimeDays": 2,
        "description": "Multiport adapter with 4K@60Hz HDMI, 100W Power Delivery, SD Card and Gigabit Ethernet."
    },
    {
        "id": "PRD-005",
        "name": "Ergonomic Aluminium Laptop Stand Pro",
        "sku": "ERG-STD-ALU",
        "category": "Peripherals",
        "unit": "pcs",
        "costPrice": 1400,
        "sellingPrice": 2499,
        "reorderLevel": 25,
        "targetStock": 70,
        "supplier": "Elevate Hardware Co.",
        "leadTimeDays": 3,
        "description": "360 rotating foldable ventilated aluminium riser for laptops up to 17 inches."
    },

    # Audio
    {
        "id": "PRD-006",
        "name": "Sony WH-1000XM5 Wireless ANC Headphones",
        "sku": "SNY-WH1000XM5-BLK",
        "category": "Audio",
        "unit": "pcs",
        "costPrice": 22500,
        "sellingPrice": 29990,
        "reorderLevel": 15,
        "targetStock": 40,
        "supplier": "Sony Consumer Electronics",
        "leadTimeDays": 4,
        "description": "Industry-leading noise canceling over-ear headphones with 30-hour battery life."
    },
    {
        "id": "PRD-007",
        "name": "Apple AirPods Pro (2nd Gen, USB-C)",
        "sku": "APL-APP2-USBC",
        "category": "Audio",
        "unit": "pcs",
        "costPrice": 19200,
        "sellingPrice": 24900,
        "reorderLevel": 30,
        "targetStock": 90,
        "supplier": "Apple Authorized Distribution",
        "leadTimeDays": 2,
        "description": "Active Noise Cancellation with Adaptive Audio and MagSafe USB-C case."
    },
    {
        "id": "PRD-008",
        "name": "JBL Flip 6 Portable Waterproof Speaker",
        "sku": "JBL-FLIP6-RED",
        "category": "Audio",
        "unit": "pcs",
        "costPrice": 7200,
        "sellingPrice": 9999,
        "reorderLevel": 20,
        "targetStock": 50,
        "supplier": "Harman International",
        "leadTimeDays": 3,
        "description": "IP67 waterproof and dustproof 2-way speaker system with 12 hours playtime."
    },
    {
        "id": "PRD-009",
        "name": "Bose QuietComfort Earbuds II",
        "sku": "BSE-QC-EB2",
        "category": "Audio",
        "unit": "pcs",
        "costPrice": 18500,
        "sellingPrice": 24900,
        "reorderLevel": 15,
        "targetStock": 35,
        "supplier": "Bose India Tech",
        "leadTimeDays": 4,
        "description": "Personalized noise cancellation with CustomTune technology."
    },
    {
        "id": "PRD-010",
        "name": "Rode VideoMicro II Ultracompact Shotgun Mic",
        "sku": "ROD-VMICRO-2",
        "category": "Audio",
        "unit": "pcs",
        "costPrice": 4800,
        "sellingPrice": 6990,
        "reorderLevel": 15,
        "targetStock": 40,
        "supplier": "Rode Microphones APAC",
        "leadTimeDays": 3,
        "description": "On-camera shotgun microphone for content creators and cameras."
    },

    # Power & Cables
    {
        "id": "PRD-011",
        "name": "Anker Prime 65W GaN Fast Wall Charger",
        "sku": "ANK-PRIME-65W",
        "category": "Power & Cables",
        "unit": "pcs",
        "costPrice": 2600,
        "sellingPrice": 3999,
        "reorderLevel": 35,
        "targetStock": 100,
        "supplier": "Anker Innovations",
        "leadTimeDays": 2,
        "description": "Ultra-compact 3-port fast charger with 2x USB-C and 1x USB-A."
    },
    {
        "id": "PRD-012",
        "name": "Baseus Blade 100W 20000mAh Power Bank",
        "sku": "BAS-BLD-100W",
        "category": "Power & Cables",
        "unit": "pcs",
        "costPrice": 4200,
        "sellingPrice": 5999,
        "reorderLevel": 20,
        "targetStock": 60,
        "supplier": "Baseus Supply Network",
        "leadTimeDays": 3,
        "description": "18mm ultra-thin high-power laptop power bank with digital status display."
    },
    {
        "id": "PRD-013",
        "name": "Belkin Braided 240W USB-C Cable (2m)",
        "sku": "BLK-C2C-240W",
        "category": "Power & Cables",
        "unit": "pcs",
        "costPrice": 1100,
        "sellingPrice": 1799,
        "reorderLevel": 40,
        "targetStock": 120,
        "supplier": "Belkin India Distribution",
        "leadTimeDays": 2,
        "description": "Durable double-braided nylon charging cable supporting up to 240W."
    },
    {
        "id": "PRD-014",
        "name": "UGREEN 100W 4-Port GaN Desktop Charger",
        "sku": "UGR-GAN-100W",
        "category": "Power & Cables",
        "unit": "pcs",
        "costPrice": 3800,
        "sellingPrice": 5499,
        "reorderLevel": 20,
        "targetStock": 50,
        "supplier": "UGREEN Electronics",
        "leadTimeDays": 3,
        "description": "Fast desktop charging station with 3 USB-C and 1 USB-A ports."
    },

    # Storage & Networking
    {
        "id": "PRD-015",
        "name": "Samsung T7 Shield 1TB Rugged Portable SSD",
        "sku": "SAM-T7S-1TB-BLU",
        "category": "Storage & Networking",
        "unit": "pcs",
        "costPrice": 8400,
        "sellingPrice": 11499,
        "reorderLevel": 25,
        "targetStock": 70,
        "supplier": "Samsung Semiconductor",
        "leadTimeDays": 3,
        "description": "Up to 1050 MB/s transfer speed with IP65 water and dust resistance."
    },
    {
        "id": "PRD-016",
        "name": "SanDisk Extreme PRO 128GB UHS-I SDXC Card",
        "sku": "SND-SD-128GB",
        "category": "Storage & Networking",
        "unit": "pcs",
        "costPrice": 1450,
        "sellingPrice": 2299,
        "reorderLevel": 50,
        "targetStock": 150,
        "supplier": "Western Digital / SanDisk",
        "leadTimeDays": 2,
        "description": "Read speeds up to 200MB/s, V30 rating for seamless 4K UHD video recording."
    },
    {
        "id": "PRD-017",
        "name": "TP-Link Deco X50 AX3000 Mesh WiFi 6 (3-Pack)",
        "sku": "TPL-DECO-X50-3PK",
        "category": "Storage & Networking",
        "unit": "pcs",
        "costPrice": 16500,
        "sellingPrice": 21999,
        "reorderLevel": 10,
        "targetStock": 30,
        "supplier": "TP-Link Network India",
        "leadTimeDays": 4,
        "description": "Whole home mesh WiFi 6 system covering up to 6,500 sq. ft."
    },
    {
        "id": "PRD-018",
        "name": "Synology DiskStation DS224+ 2-Bay NAS",
        "sku": "SYN-DS224-PLUS",
        "category": "Storage & Networking",
        "unit": "pcs",
        "costPrice": 27000,
        "sellingPrice": 34999,
        "reorderLevel": 8,
        "targetStock": 20,
        "supplier": "Synology Global",
        "leadTimeDays": 7,
        "description": "Compact 2-bay network-attached storage for private cloud and backups."
    },

    # Smart Office & Wearables
    {
        "id": "PRD-019",
        "name": "Apple Watch Series 9 GPS 45mm",
        "sku": "APL-AW9-45-MID",
        "category": "Smart Office & Wearables",
        "unit": "pcs",
        "costPrice": 34500,
        "sellingPrice": 42900,
        "reorderLevel": 12,
        "targetStock": 35,
        "supplier": "Apple Authorized Distribution",
        "leadTimeDays": 2,
        "description": "S9 SiP chip with Double Tap gesture and advanced health sensors."
    },
    {
        "id": "PRD-020",
        "name": "Samsung Galaxy Watch6 Classic 47mm LTE",
        "sku": "SAM-GW6C-47-BLK",
        "category": "Smart Office & Wearables",
        "unit": "pcs",
        "costPrice": 28000,
        "sellingPrice": 36999,
        "reorderLevel": 10,
        "targetStock": 30,
        "supplier": "Samsung Consumer Electronics",
        "leadTimeDays": 3,
        "description": "Rotating bezel with sapphire crystal glass and ECG blood pressure tracking."
    },
    {
        "id": "PRD-021",
        "name": "Elgato Stream Deck MK.2 (15 LCD Keys)",
        "sku": "ELG-SDECK-MK2",
        "category": "Smart Office & Wearables",
        "unit": "pcs",
        "costPrice": 11200,
        "sellingPrice": 14999,
        "reorderLevel": 15,
        "targetStock": 40,
        "supplier": "Corsair / Elgato Gaming",
        "leadTimeDays": 3,
        "description": "15 customizable tactile LCD keys for controlling apps and smart workflows."
    },
    {
        "id": "PRD-022",
        "name": "Logitech Brio 4K Ultra HD Pro Webcam",
        "sku": "LOGI-BRIO-4K",
        "category": "Smart Office & Wearables",
        "unit": "pcs",
        "costPrice": 14800,
        "sellingPrice": 19995,
        "reorderLevel": 15,
        "targetStock": 45,
        "supplier": "LogiTech Direct Asia",
        "leadTimeDays": 3,
        "description": "4K webcam with HDR, RightLight 3 light correction, and noise-canceling mics."
    },
    {
        "id": "PRD-023",
        "name": "Philips Hue White & Color Desk Lamp",
        "sku": "PHI-HUE-IRIS",
        "category": "Smart Office & Wearables",
        "unit": "pcs",
        "costPrice": 7800,
        "sellingPrice": 10999,
        "reorderLevel": 15,
        "targetStock": 40,
        "supplier": "Signify Lighting India",
        "leadTimeDays": 4,
        "description": "Smart ambient LED accent lighting with 16 million colors."
    },
    {
        "id": "PRD-024",
        "name": "Ember Temperature Control Smart Mug 2",
        "sku": "EMB-MUG2-14OZ",
        "category": "Smart Office & Wearables",
        "unit": "pcs",
        "costPrice": 9500,
        "sellingPrice": 13999,
        "reorderLevel": 10,
        "targetStock": 30,
        "supplier": "Ember Technologies",
        "leadTimeDays": 5,
        "description": "Smart battery mug that keeps hot beverages at exact desired temperature."
    },
    {
        "id": "PRD-025",
        "name": "Fujifilm Instax Mini 12 Instant Camera",
        "sku": "FUJ-INSTAX-M12-BLU",
        "category": "Smart Office & Wearables",
        "unit": "pcs",
        "costPrice": 5600,
        "sellingPrice": 7499,
        "reorderLevel": 20,
        "targetStock": 60,
        "supplier": "Fujifilm India Retail",
        "leadTimeDays": 3,
        "description": "Instant film camera with automatic exposure and built-in selfie mirror."
    }
]

# 75 store-product inventory records configured with intentional analytical scenarios
DEMO_INVENTORY: List[Dict[str, Any]] = [
    # Store 1: Mumbai Flagship
    {"storeId": "STR-001", "productId": "PRD-001", "currentStock": 12, "reorderLevel": 25, "lastRestocked": "2026-08-20"}, # 🔴 Stockout Risk (2.0 days)
    {"storeId": "STR-001", "productId": "PRD-002", "currentStock": 48, "reorderLevel": 20, "lastRestocked": "2026-08-28"}, # 🟢 Spike
    {"storeId": "STR-001", "productId": "PRD-003", "currentStock": 18, "reorderLevel": 10, "lastRestocked": "2026-08-15"},
    {"storeId": "STR-001", "productId": "PRD-004", "currentStock": 45, "reorderLevel": 30, "lastRestocked": "2026-08-10"},
    {"storeId": "STR-001", "productId": "PRD-005", "currentStock": 52, "reorderLevel": 25, "lastRestocked": "2026-08-18"},
    {"storeId": "STR-001", "productId": "PRD-006", "currentStock": 32, "reorderLevel": 15, "lastRestocked": "2026-08-22"},
    {"storeId": "STR-001", "productId": "PRD-007", "currentStock": 65, "reorderLevel": 30, "lastRestocked": "2026-08-25"},
    {"storeId": "STR-001", "productId": "PRD-008", "currentStock": 38, "reorderLevel": 20, "lastRestocked": "2026-08-12"},
    {"storeId": "STR-001", "productId": "PRD-009", "currentStock": 34, "reorderLevel": 15, "lastRestocked": "2026-08-05"}, # 🔴 Drop (-72%)
    {"storeId": "STR-001", "productId": "PRD-010", "currentStock": 28, "reorderLevel": 15, "lastRestocked": "2026-08-16"},
    {"storeId": "STR-001", "productId": "PRD-011", "currentStock": 82, "reorderLevel": 35, "lastRestocked": "2026-08-26"},
    {"storeId": "STR-001", "productId": "PRD-012", "currentStock": 44, "reorderLevel": 20, "lastRestocked": "2026-08-19"},
    {"storeId": "STR-001", "productId": "PRD-013", "currentStock": 96, "reorderLevel": 40, "lastRestocked": "2026-08-24"},
    {"storeId": "STR-001", "productId": "PRD-014", "currentStock": 36, "reorderLevel": 20, "lastRestocked": "2026-08-14"},
    {"storeId": "STR-001", "productId": "PRD-015", "currentStock": 6,  "reorderLevel": 25, "lastRestocked": "2026-08-15"}, # 🔴 Stockout Risk (2.4 days)
    {"storeId": "STR-001", "productId": "PRD-016", "currentStock": 110, "reorderLevel": 50, "lastRestocked": "2026-08-20"},
    {"storeId": "STR-001", "productId": "PRD-017", "currentStock": 22, "reorderLevel": 10, "lastRestocked": "2026-08-11"},
    {"storeId": "STR-001", "productId": "PRD-018", "currentStock": 14, "reorderLevel": 8,  "lastRestocked": "2026-08-01"},
    {"storeId": "STR-001", "productId": "PRD-019", "currentStock": 24, "reorderLevel": 12, "lastRestocked": "2026-08-27"},
    {"storeId": "STR-001", "productId": "PRD-020", "currentStock": 20, "reorderLevel": 10, "lastRestocked": "2026-08-21"},
    {"storeId": "STR-001", "productId": "PRD-021", "currentStock": 30, "reorderLevel": 15, "lastRestocked": "2026-08-17"},
    {"storeId": "STR-001", "productId": "PRD-022", "currentStock": 35, "reorderLevel": 15, "lastRestocked": "2026-08-23"},
    {"storeId": "STR-001", "productId": "PRD-023", "currentStock": 95, "reorderLevel": 15, "lastRestocked": "2026-07-20"}, # 🟠 Overstocked (190 days)
    {"storeId": "STR-001", "productId": "PRD-024", "currentStock": 22, "reorderLevel": 10, "lastRestocked": "2026-08-08"},
    {"storeId": "STR-001", "productId": "PRD-025", "currentStock": 48, "reorderLevel": 20, "lastRestocked": "2026-08-25"},

    # Store 2: Bengaluru Tech Hub
    {"storeId": "STR-002", "productId": "PRD-001", "currentStock": 45, "reorderLevel": 25, "lastRestocked": "2026-08-22"},
    {"storeId": "STR-002", "productId": "PRD-002", "currentStock": 38, "reorderLevel": 20, "lastRestocked": "2026-08-20"},
    {"storeId": "STR-002", "productId": "PRD-003", "currentStock": 20, "reorderLevel": 10, "lastRestocked": "2026-08-18"},
    {"storeId": "STR-002", "productId": "PRD-004", "currentStock": 60, "reorderLevel": 30, "lastRestocked": "2026-08-21"},
    {"storeId": "STR-002", "productId": "PRD-005", "currentStock": 55, "reorderLevel": 25, "lastRestocked": "2026-08-25"},
    {"storeId": "STR-002", "productId": "PRD-006", "currentStock": 8,  "reorderLevel": 15, "lastRestocked": "2026-08-14"}, # 🔴 Stockout Risk (2.5 days)
    {"storeId": "STR-002", "productId": "PRD-007", "currentStock": 55, "reorderLevel": 30, "lastRestocked": "2026-08-29"}, # 🟢 Spike (+133%)
    {"storeId": "STR-002", "productId": "PRD-008", "currentStock": 42, "reorderLevel": 20, "lastRestocked": "2026-08-16"},
    {"storeId": "STR-002", "productId": "PRD-009", "currentStock": 26, "reorderLevel": 15, "lastRestocked": "2026-08-19"},
    {"storeId": "STR-002", "productId": "PRD-010", "currentStock": 32, "reorderLevel": 15, "lastRestocked": "2026-08-24"},
    {"storeId": "STR-002", "productId": "PRD-011", "currentStock": 88, "reorderLevel": 35, "lastRestocked": "2026-08-28"},
    {"storeId": "STR-002", "productId": "PRD-012", "currentStock": 48, "reorderLevel": 20, "lastRestocked": "2026-08-20"},
    {"storeId": "STR-002", "productId": "PRD-013", "currentStock": 105, "reorderLevel": 40, "lastRestocked": "2026-08-27"},
    {"storeId": "STR-002", "productId": "PRD-014", "currentStock": 42, "reorderLevel": 20, "lastRestocked": "2026-08-17"},
    {"storeId": "STR-002", "productId": "PRD-015", "currentStock": 58, "reorderLevel": 25, "lastRestocked": "2026-08-26"}, # Surplus (transferable to STR-001)
    {"storeId": "STR-002", "productId": "PRD-016", "currentStock": 320, "reorderLevel": 50, "lastRestocked": "2026-07-15"}, # 🟠 Overstocked (152 days)
    {"storeId": "STR-002", "productId": "PRD-017", "currentStock": 25, "reorderLevel": 10, "lastRestocked": "2026-08-22"},
    {"storeId": "STR-002", "productId": "PRD-018", "currentStock": 18, "reorderLevel": 8,  "lastRestocked": "2026-08-12"},
    {"storeId": "STR-002", "productId": "PRD-019", "currentStock": 30, "reorderLevel": 12, "lastRestocked": "2026-08-29"},
    {"storeId": "STR-002", "productId": "PRD-020", "currentStock": 24, "reorderLevel": 10, "lastRestocked": "2026-08-23"},
    {"storeId": "STR-002", "productId": "PRD-021", "currentStock": 36, "reorderLevel": 15, "lastRestocked": "2026-08-25"},
    {"storeId": "STR-002", "productId": "PRD-022", "currentStock": 40, "reorderLevel": 15, "lastRestocked": "2026-08-24"},
    {"storeId": "STR-002", "productId": "PRD-023", "currentStock": 30, "reorderLevel": 15, "lastRestocked": "2026-08-15"},
    {"storeId": "STR-002", "productId": "PRD-024", "currentStock": 45, "reorderLevel": 10, "lastRestocked": "2026-06-25"}, # 🟠 Slow Moving (0 sales in 30 days)
    {"storeId": "STR-002", "productId": "PRD-025", "currentStock": 50, "reorderLevel": 20, "lastRestocked": "2026-08-20"},

    # Store 3: Delhi Suburban Express
    {"storeId": "STR-003", "productId": "PRD-001", "currentStock": 40, "reorderLevel": 25, "lastRestocked": "2026-08-20"}, # Surplus (transferable to STR-001)
    {"storeId": "STR-003", "productId": "PRD-002", "currentStock": 32, "reorderLevel": 20, "lastRestocked": "2026-08-18"},
    {"storeId": "STR-003", "productId": "PRD-003", "currentStock": 22, "reorderLevel": 10, "lastRestocked": "2026-08-05"}, # 🔴 Drop (-71%)
    {"storeId": "STR-003", "productId": "PRD-004", "currentStock": 180, "reorderLevel": 30, "lastRestocked": "2026-07-10"}, # 🟠 Overstocked (225 days)
    {"storeId": "STR-003", "productId": "PRD-005", "currentStock": 48, "reorderLevel": 25, "lastRestocked": "2026-08-16"},
    {"storeId": "STR-003", "productId": "PRD-006", "currentStock": 28, "reorderLevel": 15, "lastRestocked": "2026-08-20"}, # Surplus (transferable to STR-002)
    {"storeId": "STR-003", "productId": "PRD-007", "currentStock": 60, "reorderLevel": 30, "lastRestocked": "2026-08-26"},
    {"storeId": "STR-003", "productId": "PRD-008", "currentStock": 35, "reorderLevel": 20, "lastRestocked": "2026-08-15"},
    {"storeId": "STR-003", "productId": "PRD-009", "currentStock": 24, "reorderLevel": 15, "lastRestocked": "2026-08-18"},
    {"storeId": "STR-003", "productId": "PRD-010", "currentStock": 26, "reorderLevel": 15, "lastRestocked": "2026-08-22"},
    {"storeId": "STR-003", "productId": "PRD-011", "currentStock": 75, "reorderLevel": 35, "lastRestocked": "2026-08-25"},
    {"storeId": "STR-003", "productId": "PRD-012", "currentStock": 40, "reorderLevel": 20, "lastRestocked": "2026-08-17"},
    {"storeId": "STR-003", "productId": "PRD-013", "currentStock": 85, "reorderLevel": 40, "lastRestocked": "2026-08-23"},
    {"storeId": "STR-003", "productId": "PRD-014", "currentStock": 30, "reorderLevel": 20, "lastRestocked": "2026-08-15"},
    {"storeId": "STR-003", "productId": "PRD-015", "currentStock": 45, "reorderLevel": 25, "lastRestocked": "2026-08-21"},
    {"storeId": "STR-003", "productId": "PRD-016", "currentStock": 95, "reorderLevel": 50, "lastRestocked": "2026-08-19"},
    {"storeId": "STR-003", "productId": "PRD-017", "currentStock": 19, "reorderLevel": 10, "lastRestocked": "2026-08-14"},
    {"storeId": "STR-003", "productId": "PRD-018", "currentStock": 28, "reorderLevel": 8,  "lastRestocked": "2026-06-30"}, # 🟠 Slow Moving (1 sale in 30 days)
    {"storeId": "STR-003", "productId": "PRD-019", "currentStock": 22, "reorderLevel": 12, "lastRestocked": "2026-08-26"},
    {"storeId": "STR-003", "productId": "PRD-020", "currentStock": 18, "reorderLevel": 10, "lastRestocked": "2026-08-20"},
    {"storeId": "STR-003", "productId": "PRD-021", "currentStock": 25, "reorderLevel": 15, "lastRestocked": "2026-08-16"},
    {"storeId": "STR-003", "productId": "PRD-022", "currentStock": 30, "reorderLevel": 15, "lastRestocked": "2026-08-22"},
    {"storeId": "STR-003", "productId": "PRD-023", "currentStock": 28, "reorderLevel": 15, "lastRestocked": "2026-08-14"},
    {"storeId": "STR-003", "productId": "PRD-024", "currentStock": 20, "reorderLevel": 10, "lastRestocked": "2026-08-10"},
    {"storeId": "STR-003", "productId": "PRD-025", "currentStock": 42, "reorderLevel": 20, "lastRestocked": "2026-08-24"}
]

def pseudo_random(seed: int) -> float:
    x = math.sin(seed) * 10000
    return x - math.floor(x)

def generate_demo_sales() -> List[Dict[str, Any]]:
    records = []
    stores = DEMO_STORES
    products = DEMO_PRODUCTS
    
    # 67 days from July 1, 2026 to Sep 5, 2026
    import datetime
    start_date = datetime.date(2026, 7, 1)
    total_days = 67
    record_id = 1000

    for day_offset in range(total_days):
        current_date = start_date + datetime.timedelta(days=day_offset)
        date_str = current_date.strftime("%Y-%m-%d")
        
        is_weekend = current_date.weekday() in (5, 6) # Sat, Sun
        weekend_multiplier = 1.4 if is_weekend else 1.0
        is_recent_7_days = day_offset >= (total_days - 7)

        for store in stores:
            store_mult = 1.35 if store["id"] == "STR-001" else (1.15 if store["id"] == "STR-002" else 0.85)

            for product in products:
                store_num = int(store["id"].replace("STR-", ""))
                prod_num = int(product["id"].replace("PRD-", ""))
                seed = day_offset * 1000 + store_num * 100 + prod_num
                rand = pseudo_random(seed)

                # Base daily velocity
                base_units = 1.5
                p_id = product["id"]
                s_id = store["id"]

                if p_id == "PRD-001":
                    base_units = 6.0 if s_id == "STR-001" else 3.0
                elif p_id == "PRD-002":
                    base_units = 5.0 if (s_id == "STR-001" and is_recent_7_days) else 2.0
                elif p_id == "PRD-003":
                    base_units = 0.5 if (s_id == "STR-003" and is_recent_7_days) else 2.0
                elif p_id == "PRD-004":
                    base_units = 0.8 if s_id == "STR-003" else 2.5
                elif p_id == "PRD-005":
                    base_units = 3.2
                elif p_id == "PRD-006":
                    base_units = 3.2 if s_id == "STR-002" else 1.8
                elif p_id == "PRD-007":
                    base_units = 6.0 if (s_id == "STR-002" and is_recent_7_days) else 2.5
                elif p_id == "PRD-008":
                    base_units = 2.4
                elif p_id == "PRD-009":
                    base_units = 0.4 if (s_id == "STR-001" and is_recent_7_days) else 1.6
                elif p_id == "PRD-010":
                    base_units = 1.8
                elif p_id == "PRD-011":
                    base_units = 4.5
                elif p_id == "PRD-012":
                    base_units = 2.5
                elif p_id == "PRD-013":
                    base_units = 5.0
                elif p_id == "PRD-014":
                    base_units = 2.0
                elif p_id == "PRD-015":
                    base_units = 2.5 if s_id == "STR-001" else 1.6
                elif p_id == "PRD-016":
                    base_units = 2.1 if s_id == "STR-002" else 3.5
                elif p_id == "PRD-017":
                    base_units = 1.2
                elif p_id == "PRD-018":
                    base_units = (1.0 if day_offset == total_days - 12 else 0.0) if (s_id == "STR-003" and day_offset >= total_days - 30) else 0.6
                elif p_id == "PRD-019":
                    base_units = 1.5
                elif p_id == "PRD-020":
                    base_units = 1.3
                elif p_id == "PRD-021":
                    base_units = 1.8
                elif p_id == "PRD-022":
                    base_units = 1.6
                elif p_id == "PRD-023":
                    base_units = 0.5 if s_id == "STR-001" else 1.4
                elif p_id == "PRD-024":
                    base_units = 0.0 if (s_id == "STR-002" and day_offset >= total_days - 30) else 0.8
                elif p_id == "PRD-025":
                    base_units = 2.6

                target = base_units * weekend_multiplier * store_mult
                variance = (rand - 0.5) * 1.2
                units_sold = max(0, round(target + variance))

                # Exact zero enforce for slow moving scenarios
                if p_id == "PRD-024" and s_id == "STR-002" and day_offset >= total_days - 30:
                    units_sold = 0
                if p_id == "PRD-018" and s_id == "STR-003" and day_offset >= total_days - 30 and day_offset != total_days - 12:
                    units_sold = 0

                if units_sold > 0:
                    revenue = units_sold * product["sellingPrice"]
                    cost = units_sold * product["costPrice"]
                    profit = revenue - cost

                    records.append({
                        "id": f"SL-{record_id}",
                        "date": date_str,
                        "storeId": store["id"],
                        "productId": product["id"],
                        "unitsSold": units_sold,
                        "unitPrice": product["sellingPrice"],
                        "revenue": revenue,
                        "cost": cost,
                        "profit": profit
                    })
                    record_id += 1

    return records

DEMO_SALES: List[Dict[str, Any]] = generate_demo_sales()
