import os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path):
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Colors
    BG_DARK = RGBColor(11, 15, 23)       # #0B0F17
    CARD_BG = RGBColor(17, 24, 39)       # #111827
    CARD_BORDER = RGBColor(31, 41, 55)   # #1F2937
    ACCENT_BLUE = RGBColor(56, 189, 248) # #38BDF8
    ACCENT_INDIGO = RGBColor(99, 102, 241) # #6366F1
    ACCENT_GREEN = RGBColor(52, 211, 153)  # #34D399
    ACCENT_AMBER = RGBColor(251, 191, 36)  # #FBBF24
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(156, 163, 175) # #9CA3AF
    TEXT_SLATE = RGBColor(203, 213, 225) # #CBD5E1

    def add_slide_header(slide, slide_num, category, title, subtitle):
        # Background
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()

        # Header bar
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(1.2))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        # Category / Tag
        p_cat = tf.paragraphs[0]
        p_cat.text = f"{slide_num:02d} • {category.upper()}"
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = ACCENT_BLUE

        # Main Title
        p_title = tf.add_paragraph()
        p_title.text = title
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE
        p_title.space_before = Pt(3)

        # Subtitle
        if subtitle:
            p_sub = tf.add_paragraph()
            p_sub.text = subtitle
            p_sub.font.size = Pt(12)
            p_sub.font.color.rgb = TEXT_MUTED
            p_sub.space_before = Pt(2)

        # Subtle bottom line in header
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.65), Inches(11.733), Inches(0.02))
        line.fill.solid()
        line.fill.fore_color.rgb = CARD_BORDER
        line.line.fill.background()

    # -------------------------------------------------------------------------
    # SLIDE 1: TITLE SLIDE
    # -------------------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = BG_DARK
    bg1.line.fill.background()

    # University Header
    univ_box = s1.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.733), Inches(0.8))
    tf1 = univ_box.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "RV UNIVERSITY, BENGALURU • STARTUP PRACTICUM 1 — CIE-3"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE

    p2 = tf1.add_paragraph()
    p2.text = "Academic Year: 2026–2027 | B.Sc. (Hons) Computer Science, Semester 5"
    p2.font.size = Pt(11)
    p2.font.color.rgb = TEXT_MUTED

    # Main Brand & Title
    title_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.733), Inches(2.2))
    tft = title_box.text_frame
    tft.word_wrap = True
    pt = tft.paragraphs[0]
    pt.text = "FixFlow"
    pt.font.size = Pt(44)
    pt.font.bold = True
    pt.font.color.rgb = TEXT_WHITE

    pt2 = tft.add_paragraph()
    pt2.text = "Smart Electronics Repair Management & Customer Tracking Platform"
    pt2.font.size = Pt(20)
    pt2.font.bold = True
    pt2.font.color.rgb = ACCENT_BLUE
    pt2.space_before = Pt(6)

    pt3 = tft.add_paragraph()
    pt3.text = "Every Repair. Every Customer. Every Detail. In One Place."
    pt3.font.size = Pt(13)
    pt3.font.color.rgb = TEXT_SLATE
    pt3.space_before = Pt(4)

    # Team Members Container Cards
    team = [
        {"name": "Abhimanyu Kotari", "usn": "1RV23CS001", "role": "Team Lead & Full-Stack Architect"},
        {"name": "Akshatha", "usn": "1RV23CS015", "role": "Product Strategy & Market Research"},
        {"name": "Hemant B.Y", "usn": "1RV23CS042", "role": "Backend Systems & Database Design"},
        {"name": "Charan M", "usn": "1RV23CS033", "role": "UI/UX & Multilingual Localization"}
    ]

    card_w = Inches(2.75)
    gap = Inches(0.24)
    left_start = Inches(0.8)
    top_pos = Inches(4.5)

    for i, member in enumerate(team):
        c_left = left_start + i * (card_w + gap)
        card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, top_pos, card_w, Inches(2.2))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1)

        tfc = card.text_frame
        tfc.word_wrap = True
        tfc.margin_left = tfc.margin_right = tfc.margin_top = Inches(0.25)
        
        pc1 = tfc.paragraphs[0]
        pc1.text = member["name"]
        pc1.font.size = Pt(15)
        pc1.font.bold = True
        pc1.font.color.rgb = TEXT_WHITE

        pc2 = tfc.add_paragraph()
        pc2.text = f"USN: {member['usn']}"
        pc2.font.size = Pt(11)
        pc2.font.color.rgb = ACCENT_BLUE
        pc2.space_before = Pt(4)

        pc3 = tfc.add_paragraph()
        pc3.text = member["role"]
        pc3.font.size = Pt(11)
        pc3.font.color.rgb = TEXT_MUTED
        pc3.space_before = Pt(6)

    # -------------------------------------------------------------------------
    # SLIDE 2: EXECUTIVE SUMMARY & OPPORTUNITY
    # -------------------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    add_slide_header(s2, 1, "Executive Summary", "The Unorganized Repair Economy & Our Core Mission", "Why the local electronics repair ecosystem is ripe for modernization")

    cards_s2 = [
        {"title": "The Reality", "desc": "India is home to over 650,000 unorganized electronics repair shops handling mobile, laptop, and appliance fixes with physical paper books and WhatsApp chats.", "highlight": "90%+ Paper Register Dependency"},
        {"title": "The Friction", "desc": "Lost repair slips, disputed estimates, endless customer status phone calls, and zero digital customer history cause daily chaos and loss of repeat business.", "highlight": "2.5+ Hours Lost Daily on Inquiries"},
        {"title": "The FixFlow Vision", "desc": "A unified MERN SaaS operating system purpose-built for Indian repair shops: localized in 5 regional languages, zero-app customer tracking, and integrated WhatsApp/UPI payments.", "highlight": "Freemium & Instant Multi-Branch"}
    ]

    for i, c in enumerate(cards_s2):
        c_left = Inches(0.8) + i * Inches(4.0)
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(2.0), Inches(3.733), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = c["title"]
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = ACCENT_BLUE

        p_h = tf.add_paragraph()
        p_h.text = c["highlight"]
        p_h.font.size = Pt(12)
        p_h.font.bold = True
        p_h.font.color.rgb = ACCENT_AMBER
        p_h.space_before = Pt(4)

        p_d = tf.add_paragraph()
        p_d.text = c["desc"]
        p_d.font.size = Pt(13)
        p_d.font.color.rgb = TEXT_SLATE
        p_d.space_before = Pt(12)

    # -------------------------------------------------------------------------
    # SLIDE 3: PROBLEM STATEMENT & MARKET PAIN POINTS
    # -------------------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    add_slide_header(s3, 2, "Problem Identification", "Three Critical Bottlenecks Paralyzing Local Repair Shops", "Quantifying the daily operational pain points for technicians and consumers")

    problems = [
        {"num": "01", "name": "Paper-Register Chaos & Lost Tickets", "points": [
            "Handwritten paper job sheets get soiled, misplaced, or destroyed.",
            "Zero centralized audit trail of diagnostic notes, parts used, or costs.",
            "Disputes over pre-existing scratches, battery health, and accessory drop-offs."
        ]},
        {"num": "02", "name": "The 'Is My Phone Ready?' Disruption", "points": [
            "Customers call the shop 3 to 5 times per repair ticket.",
            "Technicians must pause active microscope/soldering work to check physical registers.",
            "Wastes over 2.5 hours of productive bench time every day per technician."
        ]},
        {"num": "03", "name": "The Regional Language Barrier", "points": [
            "Enterprise software (RepairDesk, RepairShopr) is English-only and expensive ($100+/mo).",
            "Local shopkeepers and junior technicians think and work in regional vernaculars.",
            "Lack of local language options creates high resistance to software adoption."
        ]}
    ]

    for i, p in enumerate(problems):
        c_left = Inches(0.8) + i * Inches(4.0)
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(2.0), Inches(3.733), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.3)

        p1 = tf.paragraphs[0]
        p1.text = p["num"]
        p1.font.size = Pt(28)
        p1.font.bold = True
        p1.font.color.rgb = ACCENT_INDIGO

        p2 = tf.add_paragraph()
        p2.text = p["name"]
        p2.font.size = Pt(16)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE
        p2.space_before = Pt(4)

        for pt_text in p["points"]:
            p_pt = tf.add_paragraph()
            p_pt.text = f"• {pt_text}"
            p_pt.font.size = Pt(12)
            p_pt.font.color.rgb = TEXT_SLATE
            p_pt.space_before = Pt(8)

    # -------------------------------------------------------------------------
    # SLIDE 4: MARKET GAP & COMPETITIVE LANDSCAPE
    # -------------------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    add_slide_header(s4, 3, "Market Gap & Positioning", "Where FixFlow Fits vs. Existing Alternatives", "A purpose-built solution that bridges the gap between complex enterprise POS and basic ledger apps")

    comps = [
        {"title": "Enterprise Repair POS\n(RepairDesk, RepairShopr)", "items": [
            "❌ Costs $99 – $199/month (Prohibitive for Indian shops)",
            "❌ Complex English-only interfaces with high learning curve",
            "❌ Built for US/EU multi-chain franchise ecosystems",
            "❌ Heavy setup requiring barcode scanners and thermal printers"
        ]},
        {"title": "Generic Ledger Apps\n(Vyapar, Khatabook)", "items": [
            "❌ Only track basic debits, credits, and general invoices",
            "❌ Zero repair lifecycle tracking (Intake → Diagnosis → Pickup)",
            "❌ No device serial/IMEI, technician assignment, or fault logging",
            "❌ No live repair tracking portal for customers"
        ]},
        {"title": "FixFlow: The Smart Middle Ground\n(Purpose-Built Indian Repair SaaS)", "items": [
            "✔ Free-to-enter SaaS model (₹0 Solo tier, affordable upgrades)",
            "✔ 5 Native Indian Regional Languages (Kannada, Hindi, etc.)",
            "✔ Zero-App customer repair tracking with verified phone security",
            "✔ Direct WhatsApp & UPI payments without gateway commission cuts"
        ]}
    ]

    for i, c in enumerate(comps):
        c_left = Inches(0.8) + i * Inches(4.0)
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(2.0), Inches(3.733), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = ACCENT_BLUE if i == 2 else CARD_BORDER
        card.line.width = Pt(2 if i == 2 else 1)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.25)

        p = tf.paragraphs[0]
        p.text = c["title"]
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = ACCENT_GREEN if i == 2 else TEXT_WHITE

        for it in c["items"]:
            pi = tf.add_paragraph()
            pi.text = it
            pi.font.size = Pt(12)
            pi.font.color.rgb = TEXT_WHITE if i == 2 else TEXT_SLATE
            pi.space_before = Pt(8)

    # -------------------------------------------------------------------------
    # SLIDE 5: MARKET SIZING — TAM, SAM, SOM
    # -------------------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    add_slide_header(s5, 4, "Market Opportunity", "Market Sizing: TAM • SAM • SOM Analysis", "Capturing India's multi-billion dollar aftermarket device repair economy")

    tam_data = [
        {"level": "TAM", "val": "$1.8 Billion", "title": "Total Addressable Market", "desc": "The entire consumer electronics repair, refurbishing, and aftermarket spare parts ecosystem across India (650,000+ repair centers and technician shops)."},
        {"level": "SAM", "val": "$320 Million", "title": "Serviceable Addressable Market", "desc": "120,000+ semi-organized and organized mobile, laptop, and consumer electronics repair shops in Tier 1 and Tier 2 cities adopting digital tools."},
        {"level": "SOM", "val": "$18 Million", "title": "Serviceable Obtainable Market", "desc": "Targeting 35,000+ repair workshops in Bengaluru, Karnataka, and major South Indian commercial hubs within 24–36 months through freemium conversion."}
    ]

    for i, t in enumerate(tam_data):
        c_left = Inches(0.8) + i * Inches(4.0)
        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(2.0), Inches(3.733), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = t["level"]
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = ACCENT_BLUE

        pv = tf.add_paragraph()
        pv.text = t["val"]
        pv.font.size = Pt(30)
        pv.font.bold = True
        pv.font.color.rgb = ACCENT_GREEN
        pv.space_before = Pt(4)

        pt = tf.add_paragraph()
        pt.text = t["title"]
        pt.font.size = Pt(14)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_WHITE
        pt.space_before = Pt(8)

        pd = tf.add_paragraph()
        pd.text = t["desc"]
        pd.font.size = Pt(12)
        pd.font.color.rgb = TEXT_SLATE
        pd.space_before = Pt(10)

    # -------------------------------------------------------------------------
    # SLIDE 6: PROPOSED SOLUTION & ARCHITECTURE
    # -------------------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    add_slide_header(s6, 5, "Proposed Solution", "Dual-Portal Product Experience: Workshop + Tracking", "One unified platform delivering seamless operations for shops and instant visibility for customers")

    sol_cards = [
        {"title": "Shop Operations Engine", "badge": "FOR WORKSHOP OWNERS & TECHS", "bullets": [
            "Quick Counter Intake with optional non-compulsory fields (IMEI, brand, estimate).",
            "Multi-Tenant Isolation with RBAC (Shop Owner vs. Staff Technician).",
            "5-Stage Visual Kanban Pipeline: Intake → Diagnosis → In Repair → Ready → Delivered.",
            "Automatic Customer Deduplication using normalized E.164 phone numbers across branches."
        ]},
        {"title": "FixFlow Track Portal", "badge": "FOR CONSUMERS & CUSTOMERS", "bullets": [
            "Zero-App Customer Access: No app downloads or complex logins required.",
            "Live Visual Stepper Timeline showing real-time diagnosis, parts, and completion status.",
            "Direct One-Tap Technician Call shortcut for urgent questions.",
            "Integrated WhatsApp & UPI settlement links for zero-friction payment."
        ]}
    ]

    for i, s in enumerate(sol_cards):
        c_left = Inches(0.8) + i * Inches(6.0)
        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(2.0), Inches(5.733), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.35)

        p = tf.paragraphs[0]
        p.text = s["badge"]
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = ACCENT_BLUE

        p1 = tf.add_paragraph()
        p1.text = s["title"]
        p1.font.size = Pt(20)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p1.space_before = Pt(4)

        for b in s["bullets"]:
            pb = tf.add_paragraph()
            pb.text = f"• {b}"
            pb.font.size = Pt(12)
            pb.font.color.rgb = TEXT_SLATE
            pb.space_before = Pt(10)

    # -------------------------------------------------------------------------
    # SLIDE 7: MULTILINGUAL LOCALIZATION (5 CORE LANGUAGES)
    # -------------------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    add_slide_header(s7, 6, "Multilingual Localization", "Empowering Bharat: 5 Core Regional Languages", "Eliminating the English barrier to drive grassroots adoption across Indian repair clusters")

    s7_box = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), Inches(11.733), Inches(1.2))
    s7_box.fill.solid()
    s7_box.fill.fore_color.rgb = CARD_BG
    s7_box.line.color.rgb = CARD_BORDER
    tf7 = s7_box.text_frame
    tf7.word_wrap = True
    tf7.margin_left = tf7.margin_top = Inches(0.2)
    p = tf7.paragraphs[0]
    p.text = "Why Multilingual is Our Core Competitive Advantage:"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER
    p2 = tf7.add_paragraph()
    p2.text = "Over 70% of electronics repair staff and shopkeepers in Tier 2/3 markets are non-native English speakers. FixFlow provides native, in-app translations for 5 core regional languages with zero reliance on unreliable external browser translation."
    p2.font.size = Pt(11)
    p2.font.color.rgb = TEXT_SLATE
    p2.space_before = Pt(4)

    langs = [
        {"code": "en", "name": "English", "native": "English", "desc": "Universal standard for commercial, franchise, and urban multi-branch centers."},
        {"code": "kn", "name": "Kannada", "native": "ಕನ್ನಡ", "desc": "Home market priority for Bengaluru, Mysuru, Hubballi electronics markets."},
        {"code": "hi", "name": "Hindi", "native": "हिन्दी", "desc": "Broadest national reach across North and Central Indian repair clusters."},
        {"code": "te", "name": "Telugu", "native": "తెలుగు", "desc": "Crucial for major electronics hubs in Hyderabad, Vijayawada, and Vizag."},
        {"code": "ta", "name": "Tamil", "native": "தமிழ்", "desc": "Core language for electronics and industrial repair hubs in Chennai and Coimbatore."}
    ]

    card_w = Inches(2.2)
    gap = Inches(0.18)
    for i, l in enumerate(langs):
        c_left = Inches(0.8) + i * (card_w + gap)
        card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(3.4), card_w, Inches(3.4))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.25)

        p = tf.paragraphs[0]
        p.text = l["native"]
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = ACCENT_BLUE

        p1 = tf.add_paragraph()
        p1.text = l["name"]
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p1.space_before = Pt(2)

        p2 = tf.add_paragraph()
        p2.text = l["desc"]
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_SLATE
        p2.space_before = Pt(8)

    # -------------------------------------------------------------------------
    # SLIDE 8: SECURE VERIFIED PHONE TRACKING
    # -------------------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    add_slide_header(s8, 7, "Security & Privacy", "Verified Phone Tracking & Tenant Isolation", "Protecting customer privacy and preventing malicious data scraping")

    sec_cards = [
        {"title": "Anti-Enumeration Defense", "bullets": [
            "Search queries for phone numbers return identical response times and status codes.",
            "Prevents attackers from brute-forcing mobile numbers to verify if someone is a registered customer.",
            "Standardized generic feedback keeps customer lists confidential."
        ]},
        {"title": "Strict Multi-Tenant Isolation", "bullets": [
            "Every MongoDB query strictly filters by authenticated workspace ID.",
            "Workshop A cannot read, query, or modify tickets or staff belonging to Workshop B.",
            "Compound indexing on (workspace, customer) guarantees tenant boundary integrity."
        ]},
        {"title": "E.164 Phone Normalization", "bullets": [
            "Customer phone numbers are normalized to global standard format (+91 for India).",
            "Eliminates duplicate accounts caused by leading zeros, spaces, or hyphens.",
            "Ensures instant cross-branch ticket association when customers visit other outlets."
        ]}
    ]

    for i, sc in enumerate(sec_cards):
        c_left = Inches(0.8) + i * Inches(4.0)
        card = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(2.0), Inches(3.733), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = sc["title"]
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = ACCENT_BLUE

        for b in sc["bullets"]:
            pb = tf.add_paragraph()
            pb.text = f"• {b}"
            pb.font.size = Pt(12)
            pb.font.color.rgb = TEXT_SLATE
            pb.space_before = Pt(8)

    # -------------------------------------------------------------------------
    # SLIDE 9: WHATSAPP & UPI INSTANT PAYMENTS
    # -------------------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    add_slide_header(s9, 8, "Payment Integration", "Direct WhatsApp & UPI Settlement Gateway", "Frictionless device pickup and zero payment gateway commission deductions")

    pay_cards = [
        {"title": "The Counter Problem", "bullets": [
            "Customers often dispute final amounts or delay pickup due to cash shortages.",
            "Third-party payment gateways (Razorpay, Stripe) deduct 2% to 3% on every transaction.",
            "Small repair businesses operate on thin margins and reject high gateway fees."
        ]},
        {"title": "Direct UPI Intent Links", "bullets": [
            "FixFlow generates instant UPI intent deep-links for GPay, PhonePe, and Paytm.",
            "Payments go directly to the shop owner's bank account via registered UPI VPA.",
            "0% commission deduction — 100% of the repair earnings remain with the technician."
        ]},
        {"title": "WhatsApp Pay & Auto-Receipt", "bullets": [
            "Customer can initiate payment directly through WhatsApp with pre-filled ticket details.",
            "Instant payment confirmation automatically updates ticket status to 'Ready for Pickup'.",
            "Generates digital repair passport and receipt for customer warranty proof."
        ]}
    ]

    for i, pc in enumerate(pay_cards):
        c_left = Inches(0.8) + i * Inches(4.0)
        card = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(2.0), Inches(3.733), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = pc["title"]
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = ACCENT_GREEN

        for b in pc["bullets"]:
            pb = tf.add_paragraph()
            pb.text = f"• {b}"
            pb.font.size = Pt(12)
            pb.font.color.rgb = TEXT_SLATE
            pb.space_before = Pt(8)

    # -------------------------------------------------------------------------
    # SLIDE 10: TECHNICAL ARCHITECTURE & STACK
    # -------------------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    add_slide_header(s10, 9, "Technical Stack", "MERN Stack Architecture & Production Deployment", "Robust, cloud-native engineering tested with 55 automated integration tests")

    tech_cards = [
        {"layer": "Frontend UI (SPA)", "tech": "React 18 • Tailwind CSS • Vite", "details": [
            "Single Page Application bundled with Vite for fast sub-second loading.",
            "Tailwind CSS responsive design optimized for mobile and desktop counters.",
            "Custom LanguageContext managing 5 regional languages without browser reload.",
            "Client-side mutation defense preventing third-party translation corruption."
        ]},
        {"layer": "Backend API", "tech": "Node.js • Express.js • JWT", "details": [
            "RESTful API architecture with granular route controllers.",
            "Stateless JWT authentication enforcing Role-Based Access Control (Owner vs. Staff).",
            "Rate limiting and input validation sanitizing all repair inputs.",
            "Native Node.js test runner validating 55 end-to-end integration test cases."
        ]},
        {"layer": "Database & Cloud", "tech": "MongoDB Atlas • Render CI/CD", "details": [
            "MongoDB Atlas cloud cluster with replica sets and schema indexes.",
            "Mongoose ODM modeling Workspace, Repairer, Customer, Ticket, and Staff entities.",
            "Automated continuous deployment (CI/CD) on Render via GitHub webhooks.",
            "Zero downtime migrations with decoupled client/server builds."
        ]}
    ]

    for i, tc in enumerate(tech_cards):
        c_left = Inches(0.8) + i * Inches(4.0)
        card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(2.0), Inches(3.733), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.3)

        p = tf.paragraphs[0]
        p.text = tc["layer"]
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = ACCENT_BLUE

        p1 = tf.add_paragraph()
        p1.text = tc["tech"]
        p1.font.size = Pt(16)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p1.space_before = Pt(3)

        for d in tc["details"]:
            pd = tf.add_paragraph()
            pd.text = f"• {d}"
            pd.font.size = Pt(11)
            pd.font.color.rgb = TEXT_SLATE
            pd.space_before = Pt(7)

    # -------------------------------------------------------------------------
    # SLIDE 11: BUSINESS MODEL & MONETIZATION
    # -------------------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    add_slide_header(s11, 10, "Business Model", "Freemium SaaS Pricing & Growth Economics", "A bottom-up self-serve funnel that converts solo technicians into paying multi-seat workshops")

    plans = [
        {"name": "Solo Free", "price": "₹0 / mo", "badge": "ENTRY TIER", "target": "Solo technicians testing digital tracking", "features": [
            "1 Active Technician Seat",
            "Up to 30 Repair Tickets / mo",
            "All 5 Regional Languages",
            "Public Customer Tracking",
            "Standard In-App Support"
        ]},
        {"name": "Starter", "price": "₹499 / mo", "badge": "GROWTH TIER", "target": "Growing 2–3 bench technician shops", "features": [
            "Up to 3 Staff Technicians",
            "Unlimited Repair Tickets",
            "SMS & WhatsApp Notifications",
            "Customer Directory & Search",
            "Daily & Weekly Repair Reports"
        ]},
        {"name": "Pro", "price": "₹1,199 / mo", "badge": "POPULAR", "target": "Established busy repair centers", "features": [
            "Up to 10 Staff Technicians",
            "Unlimited Repair Tickets",
            "Digital Repair Passport PDF",
            "Spare Parts Inventory Tracking",
            "Custom Shop Branding on Slips"
        ]},
        {"name": "Business", "price": "₹2,499 / mo", "badge": "ENTERPRISE", "target": "Multi-outlet citywide repair chains", "features": [
            "Unlimited Staff & Technicians",
            "Multi-Branch Store Management",
            "Centralized Inventory Sharing",
            "Dedicated Account Manager",
            "Priority 24/7 Phone Support"
        ]}
    ]

    card_w = Inches(2.75)
    gap = Inches(0.24)
    for i, pl in enumerate(plans):
        c_left = Inches(0.8) + i * (card_w + gap)
        card = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(2.0), card_w, Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = ACCENT_BLUE if i == 2 else CARD_BORDER
        card.line.width = Pt(2 if i == 2 else 1)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.25)

        p = tf.paragraphs[0]
        p.text = pl["badge"]
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = ACCENT_AMBER if i == 2 else ACCENT_BLUE

        p1 = tf.add_paragraph()
        p1.text = pl["name"]
        p1.font.size = Pt(17)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p1.space_before = Pt(2)

        p2 = tf.add_paragraph()
        p2.text = pl["price"]
        p2.font.size = Pt(20)
        p2.font.bold = True
        p2.font.color.rgb = ACCENT_GREEN
        p2.space_before = Pt(2)

        for f in pl["features"]:
            pf = tf.add_paragraph()
            pf.text = f"✔ {f}"
            pf.font.size = Pt(11)
            pf.font.color.rgb = TEXT_SLATE
            pf.space_before = Pt(6)

    # -------------------------------------------------------------------------
    # SLIDE 12: TEAM ALLOCATION, ROADMAP & CONCLUSION
    # -------------------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    add_slide_header(s12, 11, "Roadmap & Team Execution", "Team Responsibilities & Strategic Growth Vision", "Executing our milestones to digitally transform local Indian repair commerce")

    # Team responsibilities box
    t_box = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.8))
    t_box.fill.solid()
    t_box.fill.fore_color.rgb = CARD_BG
    t_box.line.color.rgb = CARD_BORDER
    tft = t_box.text_frame
    tft.word_wrap = True
    tft.margin_left = tft.margin_top = Inches(0.3)

    pt = tft.paragraphs[0]
    pt.text = "Team Responsibilities & Ownership"
    pt.font.size = Pt(18)
    pt.font.bold = True
    pt.font.color.rgb = ACCENT_BLUE

    t_allocs = [
        ("Abhimanyu Kotari", "Lead Architect", "Full-stack MERN engineering, Render CI/CD deployment, API security, and state persistence."),
        ("Akshatha", "Product Strategy", "Market research, user survey validation, competitor matrix, and TAM/SAM/SOM financial modeling."),
        ("Hemant B.Y", "Backend & Database", "MongoDB multi-tenant schema isolation, RBAC middleware, and payment integration."),
        ("Charan M", "UI/UX & Localization", "Responsive counter layout, 5-language translation dictionary, and component testing.")
    ]

    for name, role, task in t_allocs:
        p_name = tft.add_paragraph()
        p_name.text = f"{name} • {role}"
        p_name.font.size = Pt(13)
        p_name.font.bold = True
        p_name.font.color.rgb = TEXT_WHITE
        p_name.space_before = Pt(8)

        p_desc = tft.add_paragraph()
        p_desc.text = task
        p_desc.font.size = Pt(11)
        p_desc.font.color.rgb = TEXT_SLATE
        p_desc.space_before = Pt(2)

    # Roadmap Box
    r_box = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.8))
    r_box.fill.solid()
    r_box.fill.fore_color.rgb = CARD_BG
    r_box.line.color.rgb = CARD_BORDER
    tfr = r_box.text_frame
    tfr.word_wrap = True
    tfr.margin_left = tfr.margin_top = Inches(0.3)

    pr = tfr.paragraphs[0]
    pr.text = "Execution Roadmap & Milestones"
    pr.font.size = Pt(18)
    pr.font.bold = True
    pr.font.color.rgb = ACCENT_GREEN

    phases = [
        ("Phase 1: Pilot Launch (Q1 2027)", "Deploy in 50 Bengaluru repair shops (SP Road & Jayanagar). Refine counter intake speed and vernacular feedback."),
        ("Phase 2: Parts Network (Q2 2027)", "Integrate wholesale spare parts supplier listings. Enable one-click component ordering directly from repair job cards."),
        ("Phase 3: AI Diagnostics (Q3 2027)", "Implement computer vision component inspection and AI-assisted repair estimate generation based on symptom history."),
        ("Conclusion & Vision", "“FixFlow transforms fragmented repair businesses into transparent, multilingual, digitally empowered service hubs.”")
    ]

    for title, desc in phases:
        ptit = tfr.add_paragraph()
        ptit.text = title
        ptit.font.size = Pt(13)
        ptit.font.bold = True
        ptit.font.color.rgb = ACCENT_AMBER if "Conclusion" in title else TEXT_WHITE
        ptit.space_before = Pt(8)

        pdesc = tfr.add_paragraph()
        pdesc.text = desc
        pdesc.font.size = Pt(11)
        pdesc.font.color.rgb = TEXT_SLATE
        pdesc.space_before = Pt(2)

    # Save
    prs.save(output_path)
    print(f"Presentation saved to: {output_path}")

if __name__ == "__main__":
    out_dir = r"C:\Users\Abhimanyu Kotari\.gemini\antigravity\scratch\fixflow"
    out_file = os.path.join(out_dir, "FixFlow_Startup_Practicum_12_Slide_Presentation.pptx")
    create_deck(out_file)
