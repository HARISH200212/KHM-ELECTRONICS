// Category Image Mapping
const categoryImages = {
    "Gadgets & More": "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800",
    "Gimbals & Mic": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    "Cables": "https://images.unsplash.com/photo-1601524908010-a4ed0fdf24c7?auto=format&fit=crop&q=80&w=800",
    "Air pods": "https://images.unsplash.com/photo-1613110363240-4bd06b9b3e9b?auto=format&fit=crop&q=80&w=800",
    "Watches": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800",
    "Speakers": "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&q=80&w=800",
    "Home & Living": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800",
    "Next-Gen Toys": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800",
};

// Complete Real KH Playsonic Products with Enhanced Data
const realProducts = [
    // Gimbals & Mic
    {
        id: 1,
        name: "C16 AI Tracking Selfie Stick Tripod",
        originalPrice: 3500,
        price: 2850,
        discount: 19,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 3,
        category: "Gimbals & Mic",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
        description: "Advanced AI tracking selfie stick with gimbal stabilizer for smooth recording.",
        specs: { "Tracking": "360° AI", "Height": "1.6M", "Mode": "Desktop/Handheld" },
        features: [
            "360° AI-Powered Face Tracking",
            "1.6M Extendable Aluminum Height",
            "3-Axis Gimbal Stabilization",
            "Dual Mode: Desktop & Handheld",
            "Built-in Bluetooth Remote Control",
            "8-Hour Continuous Battery Life",
            "Universal Phone Compatibility (4.7-6.7 inch)",
            "Lightweight Portable Design (380g)"
        ]
    },
    {
        id: 2,
        name: "Q13 1.8M AI 360° Selfie Stick Tripod",
        originalPrice: 2350,
        price: 2350,
        discount: 0,
        onSale: false,
        deliveryDays: 4,
        category: "Gimbals & Mic",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
        description: "Long-reach AI tripod with 360-degree face tracking software.",
        specs: { "Height": "1.8M", "Rotation": "360°", "Battery": "Built-in" },
        features: [
            "Extra Long 1.8M Reach",
            "360° Smooth Rotation System",
            "AI Face Detection & Tracking",
            "Premium Aluminum Alloy Build",
            "Anti-Shake Technology",
            "Quick-Release Phone Mount",
            "Compact Foldable Design",
            "USB-C Fast Charging"
        ]
    },
    {
        id: 3,
        name: "C19 AI Extendable Selfie Stick Tripod (1.9M)",
        originalPrice: 3999,
        price: 3150,
        discount: 21,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 2,
        category: "Gimbals & Mic",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
        description: "Premium extendable tripod with AI face tracking up to 1.9M height.",
        specs: { "Height": "1.9M", "AI": "Face Tracking", "Mode": "Tripod/Selfie" },
        features: [
            "Maximum 1.9M Extension Height",
            "Intelligent AI Face Tracking",
            "Professional Grade Stabilization",
            "360° Panoramic Rotation",
            "Wireless Bluetooth 5.0 Remote",
            "10-Hour Extended Battery",
            "Carbon Fiber Lightweight Body",
            "Multi-Angle Adjustable Head"
        ]
    },
    {
        id: 4,
        name: "M1 3-Axis Merak One Gimbal",
        originalPrice: 4299,
        price: 3450,
        discount: 20,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 3,
        category: "Gimbals & Mic",
        image: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=800",
        description: "Professional 3-axis gimbal stabilizer for smartphones.",
        specs: { "Axis": "3-Axis", "Battery": "8h", "Payload": "280g" },
        features: [
            "Professional 3-Axis Stabilization",
            "280g Maximum Payload Capacity",
            "8-Hour Continuous Operation",
            "Intelligent Gesture Control",
            "Object Tracking & Follow Mode",
            "Timelapse & Motion Timelapse",
            "Inception Mode (360° Roll)",
            "Portable Foldable Design"
        ]
    },
    {
        id: 5,
        name: "Mobile Phone Neck Bracket",
        originalPrice: 1450,
        price: 1450,
        discount: 0,
        onSale: false,
        deliveryDays: 5,
        category: "Gimbals & Mic",
        image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800",
        description: "Hands-free neck mount for first-person POV recording.",
        specs: { "Type": "Neck Mount", "Rotation": "360°", "Compat": "Universal" },
        features: [
            "Hands-Free POV Recording",
            "360° Flexible Rotation",
            "Universal Phone Compatibility",
            "Ergonomic Neck Design",
            "Adjustable Viewing Angles",
            "Lightweight & Comfortable Wear"
        ]
    },

    // Gaming Gears
    {
        id: 6,
        name: "Elite X RGB Wired Gaming Controller",
        originalPrice: 2199,
        price: 1750,
        discount: 20,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 2,
        category: "Gadgets & More",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
        description: "High-precision RGB gaming controller for PC with ergonomic design.",
        specs: { "RGB": "Dynamic", "Platform": "PC/Steam", "Type": "Wired" },
        features: [
            "Dynamic RGB Lighting Effects",
            "Precise Hall Effect Triggers",
            "Anti-Drift Analog Sticks",
            "Ergonomic Contoured Grid",
            "Turbo & Macro Functions",
            "3M Braided USB Cable",
            "PC/Steam Compatible",
            "Vibration Feedback System"
        ]
    },
    {
        id: 7,
        name: "Elite Play Wireless PS4 Controller (Blue)",
        originalPrice: 3499,
        price: 2850,
        discount: 19,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 3,
        category: "Gaming Gears",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
        description: "Wireless PS4 controller with dual vibration and touch pad.",
        specs: { "Type": "Wireless BT", "Vibration": "Dual Motor", "Audio": "3.5mm Jack" },
        features: [
            "Wireless Bluetooth 4.0 Connection",
            "Dual Vibration Motor System",
            "Integrated Touch Pad Control",
            "3.5mm Audio Jack Built-in",
            "15-Hour Battery Life",
            "LED Player Indicators",
            "Motion Sensor (6-axis)",
            "Share Button for Screenshots"
        ]
    },
    {
        id: 8,
        name: "Elite Ops Wireless Gamepad for Google TV",
        originalPrice: 2150,
        price: 2150,
        discount: 0,
        onSale: false,
        deliveryDays: 4,
        category: "Gaming Gears",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
        description: "Wireless gamepad compatible with Google TV and Android TV.",
        specs: { "Platform": "Android/Google TV", "Type": "Wireless", "Battery": "10h" },
        features: [
            "Google TV & Android Compatible",
            "Wireless 2.4GHz Connection",
            "10-Hour Battery Endurance",
            "Ergonomic Lightweight Design",
            "Responsive D-Pad & Buttons",
            "USB-C Rechargeable Battery"
        ]
    },
    {
        id: 9,
        name: "FOX Go Wireless Bluetooth Gamepad",
        originalPrice: 2799,
        price: 2250,
        discount: 20,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 2,
        category: "Gaming Gears",
        image: "https://images.unsplash.com/photo-1600080972464-8e5f3580211?auto=format&fit=crop&q=80&w=800",
        description: "Compact wireless gamepad for mobile gaming.",
        specs: { "Connection": "Bluetooth 5.0", "Battery": "12h", "Platform": "Mobile/PC" },
        features: [
            "Bluetooth 5.0 Low Latency",
            "12-Hour Gaming Battery",
            "Mobile & PC Cross-Platform",
            "Compact Travel-Friendly Size",
            "Adjustable Phone Clip",
            "Turbo Mode Function",
            "LED Status Indicators",
            "USB-C Fast Charging"
        ]
    },
    {
        id: 10,
        name: "Wired DualShock Controller for PS2",
        originalPrice: 699,
        price: 550,
        discount: 21,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 5,
        category: "Gaming Gears",
        image: "https://images.unsplash.com/photo-1600080972464-8e5f3580211?auto=format&fit=crop&q=80&w=800",
        description: "Classic wired controller compatible with PlayStation 2.",
        specs: { "Type": "Wired", "Platform": "PS2", "Vibration": "Dual Motor" },
        features: [
            "PS2 Native Compatibility",
            "Dual Motor Vibration",
            "Pressure Sensitive Buttons",
            "2M Long Durable Cable",
            "Classic DualShock Layout",
            "Plug & Play Operation"
        ]
    },

    // Watches
    {
        id: 11,
        name: "HK16 Series 9+ Women's Smartwatch",
        originalPrice: 3999,
        price: 2999,
        discount: 25,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 2,
        category: "Watches",
        image: "https://images.unsplash.com/photo-1544117518-e7963b11b044?auto=format&fit=crop&q=80&w=800",
        description: "Elegant Series 9+ smartwatch with comprehensive health tracking.",
        specs: { "Display": "OLED", "Size": "41mm", "Battery": "5 Days" },
        features: [
            "Stunning AMOLED Display",
            "Heart Rate & SpO2 Monitor",
            "Menstrual Cycle Tracking",
            "5-Day Extended Battery Life",
            "50+ Sports Modes",
            "Sleep Quality Analysis",
            "IP68 Water Resistance",
            "Always-On Display Mode"
        ]
    },
    {
        id: 12,
        name: "Mr. Charcoal Arabic Numeral Watch",
        originalPrice: 499,
        price: 499,
        discount: 0,
        onSale: false,
        deliveryDays: 4,
        category: "Watches",
        image: "https://images.unsplash.com/photo-1544117518-e7963b11b044?auto=format&fit=crop&q=80&w=800",
        description: "Classic analog watch with Arabic numeral design.",
        specs: { "Type": "Analog", "Water": "IP54", "Band": "Leather" },
        features: [
            "Elegant Arabic Numeral Dial",
            "Premium Leather Strap",
            "Japanese Quartz Movement",
            "IP54 Splash Resistance",
            "Luminous Hands Display",
            "Classic Minimalist Design"
        ]
    },
    {
        id: 13,
        name: "Car Wheel Rolling Dial Watch",
        originalPrice: 699,
        price: 499,
        discount: 29,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 3,
        category: "Watches",
        image: "https://images.unsplash.com/photo-1544117518-e7963b11b044?auto=format&fit=crop&q=80&w=800",
        description: "Unique car wheel inspired rolling dial design.",
        specs: { "Type": "Analog", "Design": "Car Wheel", "Band": "Silicone" },
        features: [
            "Unique Rolling Wheel Dial",
            "Automotive-Inspired Design",
            "Durable Silicone Band",
            "Precision Quartz Movement",
            "Water Resistant 3ATM",
            "Scratch-Resistant Glass"
        ]
    },

    // Next-Gen Toys
    {
        id: 14,
        name: "Foam RC Fighter Jet",
        originalPrice: 2499,
        price: 1998,
        discount: 20,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 4,
        category: "Next-Gen Toys",
        image: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&q=80&w=800",
        description: "High-speed foam RC jet with simplified controls for all ages.",
        specs: { "Material": "EPP Foam", "Freq": "2.4GHz", "Range": "120M" },
        features: [
            "Durable EPP Foam Construction",
            "2.4GHz Anti-Interference Control",
            "120M Control Range",
            "Easy Beginner-Friendly Controls",
            "Aerobatic Flight Capable",
            "Quick Charge USB Battery",
            "Replaceable Propellers Included",
            "Crash-Resistant Design"
        ]
    },
    {
        id: 15,
        name: "Flying Whale 3-in-1 Air, Land & Water Toy",
        originalPrice: 2515,
        price: 2515,
        discount: 0,
        onSale: false,
        deliveryDays: 3,
        category: "Next-Gen Toys",
        image: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&q=80&w=800",
        description: "Versatile toy that works on air, land, and water.",
        specs: { "Modes": "Air/Land/Water", "Battery": "600mAh", "Freq": "2.4GHz" },
        features: [
            "3-in-1 Multi-Terrain Operation",
            "Land, Water & Air Modes",
            "600mAh Rechargeable Battery",
            "2.4GHz Stable Connection",
            "Waterproof Construction",
            "LED Navigation Lights",
            "Auto-Stabilization System",
            "15-Minute Flight Time"
        ]
    },
    {
        id: 16,
        name: "1:43 RC Drift Nissan GT-R R34 (Silver)",
        originalPrice: 4999,
        price: 3999,
        discount: 20,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 2,
        category: "Next-Gen Toys",
        image: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&q=80&w=800",
        description: "Premium scale RC drift car with authentic Nissan GT-R design.",
        specs: { "Scale": "1:43", "Type": "Drift", "Speed": "15km/h" },
        features: [
            "Authentic Nissan GT-R R34 Design",
            "Professional Drift Tires",
            "1:43 Scale Precision Detail",
            "15km/h Top Speed",
            "Proportional Steering Control",
            "Rechargeable Li-Po Battery",
            "Working LED Headlights",
            "Premium Display Stand Included"
        ]
    },
    {
        id: 17,
        name: "Mini RC Car – 1/64 Scale",
        originalPrice: 1299,
        price: 999,
        discount: 23,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 5,
        category: "Next-Gen Toys",
        image: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&q=80&w=800",
        description: "Ultra compact remote control car for indoor racing.",
        specs: { "Scale": "1:64", "Range": "15M", "Battery": "USB Charge" },
        features: [
            "Ultra-Compact 1:64 Scale",
            "Indoor Racing Optimized",
            "15M Control Range",
            "USB Rechargeable Battery",
            "Quick Charge Technology",
            "Precise Steering Response"
        ]
    },

    // Audio & Air Pods
    {
        id: 18,
        name: "Cowboy Wireless Earbuds with 2 Caps",
        originalPrice: 11999,
        price: 8999,
        discount: 25,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 2,
        category: "Air pods",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800",
        description: "Premium cowboy style wireless earbuds with superior sound clarity.",
        specs: { "Bluetooth": "5.3", "Battery": "40h", "ANC": "Hybrid" },
        features: [
            "Premium Sound with Deep Bass",
            "Hybrid Active Noise Cancellation",
            "Bluetooth 5.3 Low Latency",
            "40-Hour Total Battery Life",
            "Dual Interchangeable Caps",
            "Touch Control Interface",
            "IPX5 Sweat Resistance",
            "Wireless Charging Case"
        ]
    },
    {
        id: 19,
        name: "MP3 Music Player with Bluetooth & Built-in Speaker",
        originalPrice: 949,
        price: 949,
        discount: 0,
        onSale: false,
        deliveryDays: 4,
        category: "Air pods",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800",
        description: "Portable MP3 player with Bluetooth and built-in speaker.",
        specs: { "Bluetooth": "5.0", "Storage": "32GB", "Speaker": "Built-in" },
        features: [
            "32GB Expandable Storage",
            "Bluetooth 5.0 Connectivity",
            "Built-in Stereo Speaker",
            "2.4-inch Color Display",
            "FM Radio Function",
            "Voice Recorder Feature"
        ]
    },

    // Speakers
    {
        id: 20,
        name: "Zeb Juke Bar 2500 – 2.0 Channel Soundbar",
        originalPrice: 4499,
        price: 3499,
        discount: 22,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 3,
        category: "Speakers",
        image: "https://images.unsplash.com/photo-1614113143851-89173b064b81?auto=format&fit=crop&q=80&w=800",
        description: "2.0 Channel powerful soundbar for immersive home theater experience.",
        specs: { "Output": "35W", "Input": "BT/USB/AUX", "Type": "2.0 Channel" },
        features: [
            "35W Powerful Audio Output",
            "2.0 Channel Stereo Sound",
            "Multiple Input Options",
            "Bluetooth Wireless Streaming",
            "Wall Mount Compatible",
            "Remote Control Included",
            "LED Display Panel",
            "Sleek Modern Design"
        ]
    },
    {
        id: 21,
        name: "Bang Pro 10W (TWS) Wireless Bluetooth Speaker",
        originalPrice: 2299,
        price: 1849,
        discount: 20,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 2,
        category: "Speakers",
        image: "https://images.unsplash.com/photo-1614113143851-89173b064b81?auto=format&fit=crop&q=80&w=800",
        description: "Portable TWS speaker with powerful 10W output.",
        specs: { "Output": "10W", "TWS": "Yes", "Battery": "8h" },
        features: [
            "10W High-Power Output",
            "True Wireless Stereo Pairing",
            "8-Hour Playback Time",
            "Portable Compact Design",
            "Built-in Microphone",
            "USB-C Fast Charging"
        ]
    },
    {
        id: 22,
        name: "16W HD Sound Bluetooth Speaker with Wireless Charging",
        originalPrice: 2499,
        price: 1999,
        discount: 20,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 3,
        category: "Speakers",
        image: "https://images.unsplash.com/photo-1614113143851-89173b064b81?auto=format&fit=crop&q=80&w=800",
        description: "Premium speaker with 15W wireless charging pad built-in.",
        specs: { "Output": "16W", "Charging": "15W Wireless", "Battery": "10h" },
        features: [
            "16W HD Sound Quality",
            "15W Wireless Phone Charging",
            "10-Hour Battery Life",
            "Bluetooth 5.0 Connection",
            "Touch Control Panel",
            "LED Ambient Lighting",
            "Clock & Alarm Function",
            "Dual Charging Capability"
        ]
    },
    {
        id: 23,
        name: "2.0 Multimedia Speaker with Aux Connectivity",
        originalPrice: 499,
        price: 369,
        discount: 26,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 5,
        category: "Speakers",
        image: "https://images.unsplash.com/photo-1614113143851-89173b064b81?auto=format&fit=crop&q=80&w=800",
        description: "Affordable desktop multimedia speaker with AUX input.",
        specs: { "Output": "6W", "Input": "AUX/USB", "Type": "Desktop" },
        features: [
            "6W Total Audio Output",
            "USB Powered Operation",
            "AUX Input Connectivity",
            "Volume Control Knob",
            "Compact Desktop Design",
            "Plug & Play Setup"
        ]
    },
    {
        id: 24,
        name: "3W Wearable Bluetooth Speaker with Mic",
        originalPrice: 2399,
        price: 1899,
        discount: 21,
        onSale: true,
        saleEndDate: "2027-12-31T23:59:59.999Z",
        deliveryDays: 3,
        category: "Speakers",
        image: "https://images.unsplash.com/photo-1614113143851-89173b064b81?auto=format&fit=crop&q=80&w=800",
        description: "Wearable speaker with built-in microphone for calls.",
        specs: { "Output": "3W", "Mic": "Built-in", "Type": "Wearable" },
        features: [
            "Wearable Clip-On Design",
            "Built-in HD Microphone",
            "Hands-Free Calling",
            "6-Hour Battery Life",
            "IPX4 Splash Resistant",
            "Lightweight & Portable"
        ]
    },
    {
        id: 100,
        name: "360° stealth-concept drone",
        originalPrice: 9999,
        price: 7499,
        discount: 25,
        onSale: true,
        deliveryDays: 1,
        category: "Next-Gen Toys",
        image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800",
        spritesheet: "https://www.cssscript.com/demo/product-viewer-animate-sprite/car.jpg",
        frameCount: 24,
        description: "A technical demonstration of full 360-degree interactive rotation using image sequences.",
        specs: { "Type": "360° Interactive", "Frames": "24", "HUD": "Active" },
        features: [
            "Full 360-Degree Interactive Rotation",
            "High-Resolution Image Sequence",
            "Sci-Fi HUD Overlay Enabled",
            "Smooth Frame-by-Frame Scrubbing"
        ]
    }
];

export const products = realProducts;
