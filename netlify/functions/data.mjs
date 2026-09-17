// netlify/functions/data.mjs
// Public GET: returns the current site content (blog posts, projects, about, resume).
// Protected POST: overwrites site content. Requires header "x-admin-password" that
// matches the ADMIN_PASSWORD environment variable set in Netlify site settings.

import { getStore } from '@netlify/blobs';

// Seed data — this is what the site was launched with. It's used the very first time
// the function runs (before anything has been saved to Blobs), so the site never
// shows an empty admin panel.
const SEED_DATA = {
  "blogPosts": {
    "ai-tools": {
      "cat": "AI & Design",
      "date": "Apr 1, 2026",
      "title": "AI Design Tools: Midjourney, DALL-E & Adobe Firefly",
      "cover": "a",
      "img": "images/blog/ai-design-tools.jpg",
      "intro": "AI design tools are changing the way creative professionals explore ideas, build concepts and move from rough direction to polished visual output.",
      "sections": [
        [
          "Why AI tools matter",
          "The best use of AI is not replacing creative thinking. It is accelerating exploration. Designers can test compositions, art directions, visual moods and concepts in minutes, then refine the strongest direction with traditional design tools."
        ],
        [
          "A practical workflow",
          "Start with a clear brief, generate several visual directions, shortlist the strongest concepts, refine the selected direction and finally prepare production-ready assets. Keeping the human review step is essential for consistency and brand quality."
        ],
        [
          "Choosing the right tool",
          "Use image-generation tools when you need concept exploration, editing tools when you need precise control, and collaborative design tools when the final interface needs structured layouts and reusable components."
        ]
      ],
      "filterCat": "ai",
      "excerpt": "A practical guide to choosing the right AI design workflow.",
      "coverClass": "b1"
    },
    "uiux-basics": {
      "cat": "Web Design",
      "date": "Apr 19, 2026",
      "title": "UI/UX Design Basics: App & Website Fundamentals",
      "cover": "b",
      "img": "images/blog/uiux-design-basics.jpg",
      "intro": "A strong interface starts with clarity. Good UI/UX helps users understand what they can do, where they are and what should happen next.",
      "sections": [
        [
          "Start with user goals",
          "Before choosing colors or components, understand the user task. A clear hierarchy should make the primary action obvious and reduce unnecessary decisions."
        ],
        [
          "Structure before decoration",
          "Wireframes, content hierarchy and spacing should be solved before visual polish. This makes the final design more consistent and easier to develop responsively."
        ],
        [
          "Design for every screen",
          "Responsive design is not just shrinking desktop content. Layouts, type scale, spacing and interactions should adapt intentionally across desktop, tablet and mobile."
        ]
      ],
      "filterCat": "web",
      "excerpt": "Core principles for building clear and user-friendly interfaces.",
      "coverClass": "b2"
    },
    "ai-web-design": {
      "cat": "AI & Design",
      "date": "Apr 3, 2026",
      "title": "How AI Is Changing Modern Web Design",
      "cover": "c",
      "img": "images/blog/ai-web-design.jpg",
      "intro": "AI is becoming part of the modern design workflow, from research and copy exploration to visual concepts and development assistance.",
      "sections": [
        [
          "Faster exploration",
          "AI can help generate multiple directions quickly. This is useful during discovery when a team needs to compare ideas before committing to one visual language."
        ],
        [
          "Human taste still matters",
          "Generated output can be inconsistent. Designers and developers still need to judge usability, accessibility, brand fit, performance and technical feasibility."
        ],
        [
          "A better workflow",
          "Treat AI as a creative assistant. Give it constraints, review the output critically and use it to remove repetitive work rather than removing the design thinking itself."
        ]
      ],
      "filterCat": "ai",
      "excerpt": "What designers and developers should know about the new workflow.",
      "coverClass": "b3"
    },
    "responsive-wordpress": {
      "cat": "Tutorials",
      "date": "Mar 22, 2026",
      "title": "How to Build a Responsive WordPress Website",
      "cover": "d",
      "img": "images/blog/responsive-wordpress.jpg",
      "intro": "Responsive WordPress development requires more than making a page look good on desktop. Every section needs a deliberate mobile and tablet behavior.",
      "sections": [
        [
          "Build a flexible structure",
          "Use a consistent container width, sensible spacing and flexible columns. Avoid fixed dimensions that can cause overflow on smaller screens."
        ],
        [
          "Check real breakpoints",
          "Test navigation, typography, images, forms and cards at several viewport sizes. A layout that works at one mobile width may still break at another."
        ],
        [
          "Optimize the final experience",
          "Compress images, remove unnecessary scripts and keep interactions lightweight. Performance and usability should be treated as part of the design."
        ]
      ],
      "filterCat": "tutorial",
      "excerpt": "A simple checklist for creating a reliable responsive layout.",
      "coverClass": "b4"
    },
    "developer-portfolio": {
      "cat": "Career Tips",
      "date": "Mar 10, 2026",
      "title": "How to Build a Strong Developer Portfolio",
      "cover": "e",
      "img": "images/blog/developer-portfolio.jpg",
      "intro": "A portfolio should quickly communicate what you do, what you have built and why a client should trust your work.",
      "sections": [
        [
          "Show outcomes",
          "Instead of only listing technologies, explain the problem, your role, the solution and the result. A concise case study is more useful than a long list of tools."
        ],
        [
          "Make projects easy to explore",
          "Use filters, strong thumbnails, short summaries and a clear project link. Visitors should reach the relevant work without searching through a crowded page."
        ],
        [
          "Keep it current",
          "Remove weak or outdated examples and keep the portfolio focused on the type of work you want next."
        ]
      ],
      "filterCat": "career",
      "excerpt": "Practical ideas for presenting projects and skills professionally.",
      "coverClass": "b5"
    },
    "design-systems": {
      "cat": "Graphic Design",
      "date": "Feb 28, 2026",
      "title": "Design Systems for Consistent Branding",
      "cover": "f",
      "img": "images/blog/design-systems.jpg",
      "intro": "A small design system can make a website feel more professional by keeping colors, typography, components and spacing consistent.",
      "sections": [
        [
          "Define the foundations",
          "Choose your core colors, type scale, spacing rhythm, border radius and common shadows. These foundations become the visual rules for the interface."
        ],
        [
          "Create reusable components",
          "Buttons, cards, form fields, navigation and badges should follow repeatable patterns. This reduces visual drift as the website grows."
        ],
        [
          "Document simple rules",
          "A useful system does not need to be huge. Clear examples and a few practical rules are enough to help designers and developers stay aligned."
        ]
      ],
      "filterCat": "graphic",
      "excerpt": "Simple ways to keep visual identity consistent across digital products.",
      "coverClass": "b6"
    }
  },
  "projects": [
    {
      "id": "proj-1",
      "category": "wordpress elementor",
      "tag": "WordPress · Elementor",
      "title": "Pest & bug control services",
      "desc": "Modern corporate website with responsive sections and conversion-focused layout.",
      "image": "images/projects/mmpest-control-in-usa.png",
      "url": "https://mmpest.com.au/"
    },
    {
      "id": "proj-2",
      "category": "elementor wordpress",
      "tag": "WooCommerce",
      "title": "TranscendMental Breathwork",
      "desc": "Product-focused shopping experience with clean UI and mobile-first design.",
      "image": "images/projects/transcend-mentalWebsite.jpg",
      "url": "https://transcendmental.com/"
    },
    {
      "id": "proj-3",
      "category": "uiux elementor",
      "tag": "UI/UX · Elementor",
      "title": "Grippersoft Website Design",
      "desc": "Elegant agency website with reusable content sections and responsive layout.",
      "image": "images/projects/grippersoft-website.png",
      "url": "https://grippersoft.com/"
    },
    {
      "id": "proj-4",
      "category": "wordpress ecommerce",
      "tag": "WordPress",
      "title": "Felt Happy Market",
      "desc": "Felt Happy Market helps you craft magical, screen-free gifts that spark imagination and connection.",
      "image": "images/projects/felt-happy-market.jpg",
      "url": "https://felthappymarket.com/"
    },
    {
      "id": "proj-5",
      "category": "elementor",
      "tag": "wordpress · Elementor",
      "title": "NewWalk Counsiling Service",
      "desc": "New Walk Counseling Services is designed for the high-impact individual who needs a confidential space to take off the mask.",
      "image": "images/projects/new-walk-counsiling-service.jpg",
      "url": "https://www.newwalkcounselingservices.com"
    },
    {
      "id": "proj-6",
      "category": "adult wordpress",
      "tag": "wordpress · Elementor",
      "title": "SMOKE BY NIGHT",
      "desc": "A Luxury and Premier Hookah Experience. Your Night Your Way.",
      "image": "images/projects/smoke-by-night-luxury-hookah-adult-website.png",
      "url": "https://smokebynight.com/"
    },
    {
      "id": "proj-7",
      "category": "adult wordpress",
      "tag": "wordpress · Elementor",
      "title": "BOHO BARTENDING",
      "desc": "Bobo vibe on your event, turning every gathering into a chic. Celebration with handcrafted cocktails",
      "image": "images/projects/boho-bar-website.png",
      "url": "https://bohobartending.com/"
    },
    {
      "id": "proj-8",
      "category": "wordpress elementor",
      "tag": "wordpress · Elementor",
      "title": "Air Duct Cleaning Service",
      "desc": "Modern corporate website with responsive sections and conversion-focused layout.",
      "image": "images/projects/air-duct-cleaning-team.jpg",
      "url": "#"
    },
    {
      "id": "proj-9",
      "category": "elementor wordpress",
      "tag": "wordpress · Elementor",
      "title": "Gym Floor Contractors",
      "desc": "Serving all of California, South Bay Floor Bros pride ourselves on delivering exceptional quality.",
      "image": "images/projects/flor-bros-website.png",
      "url": "https://sbfloorbros.com/new/"
    },
    {
      "id": "proj-10",
      "category": "elementor plumbing",
      "tag": "wordpress · Elementor",
      "title": "It’s Clearly Plumbing",
      "desc": "The Clear Choice for Plumbing.",
      "image": "images/projects/its-clearly-plumbing-website.png",
      "url": "https://itsclearlyplumbing.com.au/"
    },
    {
      "id": "proj-11",
      "category": "elementor wordpress",
      "tag": "wordpress · Elementor",
      "title": "SunVision IQ Company",
      "desc": "Through the vision of the sun, we create intelligent solutions.",
      "image": "images/projects/sunvision-iq-company.png",
      "url": "https://sunvisioniq.com/"
    },
    {
      "id": "proj-12",
      "category": "elementor wordpress",
      "tag": "wordpress · Elementor",
      "title": "Rx3 Coommunication",
      "desc": "Delivering infrastructure. Powering federal missions.",
      "image": "images/projects/r3x-communications.png",
      "url": "https://rx3communications.com/"
    },
    {
      "id": "proj-13",
      "category": "elementor wordpress",
      "tag": "wordpress · Elementor",
      "title": "Crown Leadership International Group",
      "desc": "Crown Leadership International Group is a business organization.",
      "image": "images/projects/crownleadership.png",
      "url": "https://crownleadership.com.au/"
    },
    {
      "id": "proj-14",
      "category": "elementor",
      "tag": "wordpress · Elementor",
      "title": "Opengates Project",
      "desc": "Great architecture is more than design.",
      "image": "images/projects/open-gets-projects-constructions-website.png",
      "url": "https://opengatesproject.com/"
    },
    {
      "id": "proj-15",
      "category": "elementor",
      "tag": "wordpress · Elementor",
      "title": "Rucker Electric",
      "desc": "High Production Capacity and Reliable Lead Times",
      "image": "images/projects/rucker-electric-powering-tomorrow.png",
      "url": "https://ruckerelectric.com/"
    },
    {
      "id": "proj-16",
      "category": "elementor wordpress",
      "tag": "wordpress · Elementor",
      "title": "Mekki App",
      "desc": "High Production Capacity and Reliable Lead Times",
      "image": "images/projects/mekki-app-website.png",
      "url": "#"
    },
    {
      "id": "proj-17",
      "category": "elementor wordpress",
      "tag": "wordpress · Elementor",
      "title": "Review Spot Website",
      "desc": "Modern corporate website with responsive sections and conversion-focused layout.",
      "image": "images/projects/real-reviews.png",
      "url": "https://rviewspot.com/"
    },
    {
      "id": "proj-18",
      "category": "elementor wordpress",
      "tag": "wordpress · Elementor",
      "title": "Roofingbox Company",
      "desc": "Professional roof installation, replacement, repair, and inspection.",
      "image": "images/projects/roofingbox-company.png",
      "url": "https://dev-roofingbox-test.pantheonsite.io/"
    },
    {
      "id": "proj-19",
      "category": "shopify",
      "tag": "wordpress · Elementor",
      "title": "Balkan Finance Academy",
      "desc": "This platform is the bridge between the untapped potential of the Balkans.",
      "image": "images/projects/balkan-finance-academy.png",
      "url": "https://balkanfinanceacademy.com/"
    },
    {
      "id": "proj-20",
      "category": "elementor wordpress",
      "tag": "wordpress · Elementor",
      "title": "Relataionship with Ericka Ush",
      "desc": "Modern website with responsive sections and conversion-focused layout.",
      "image": "images/projects/relationships.png",
      "url": "#"
    },
    {
      "id": "proj-21",
      "category": "elementor wordpress",
      "tag": "wordpress · Elementor",
      "title": "Commpound Media",
      "desc": "Discover and connect with the right talent to amplify your business.",
      "image": "images/projects/connect-collaborate-create-impact.png",
      "url": "https://commpound.io/"
    },
    {
      "id": "proj-22",
      "category": "elementor wordpress",
      "tag": "wordpress · Elementor",
      "title": "Higher Power Solutions Net",
      "desc": "Commercial Security & Low-Voltage Systems in Charlotte, NC.",
      "image": "images/projects/higher-power-solutions-net.png",
      "url": "https://higherpowersolutions.net/"
    },
    {
      "id": "proj-23",
      "category": "ecommerce wordpress",
      "tag": "wordpress · Elementor",
      "title": "The Wilson Sister",
      "desc": "Two sisters. One mission. Keeping art and themselves afloat.",
      "image": "images/projects/the-wilson-sister.png",
      "url": "https://thewilsonsisters.co.uk/"
    },
    {
      "id": "proj-24",
      "category": "ecommerce",
      "tag": "WooCommerce · Elementor",
      "title": "Darior",
      "desc": "Darior has been a premium leather lifestyle brand website.",
      "image": "images/projects/darior-premium-leather.png",
      "url": "https://darior.com/"
    },
    {
      "id": "proj-25",
      "category": "ecommerce elementor",
      "tag": "WooCommerce · Elementor",
      "title": "Pawsitive Pet Care",
      "desc": "Professional Veterinary Care for Your Beloved Pets.",
      "image": "images/projects/pawsitive-pet-care-website.png",
      "url": "https://pawsitive.grippersoft.com/"
    },
    {
      "id": "proj-26",
      "category": "wordpress Jetengine",
      "tag": "Custom WordPress · Elementor",
      "title": "Corporate Law Associates",
      "desc": "Your Trusted Partner in Corporate Law & Tax Planning.",
      "image": "images/projects/corporate-law-website.png",
      "url": "https://cla-bd.com/"
    },
    {
      "id": "proj-27",
      "category": "WordPress elementor Jetengine",
      "tag": "Jetengine · Elementor",
      "title": "Nc Cleaning in USA",
      "desc": "Sydney Based 24/7 Residential & Commercial Property Cleaning & Maintenance Services.",
      "image": "images/projects/nccleaning-website-in-usa.png",
      "url": "https://nccleaning.com.au/"
    },
    {
      "id": "proj-28",
      "category": "WordPress elementor",
      "tag": "Jetengine · Elementor",
      "title": "Rs Travel in Switzerand",
      "desc": "Experience Switzerland With Comfort, Care & Complete Peace of Mind!",
      "image": "images/projects/rs-travel-adventure-website-mockup.png",
      "url": "https://rs-travels.com/"
    },
    {
      "id": "proj-29",
      "category": "WordPress elementor",
      "tag": "Jetengine · Elementor",
      "title": "Digihub Limited",
      "desc": "DigiHub offers a complete range of cloud and IT solutions.",
      "image": "images/projects/digiHub-digital-transformation.png",
      "url": "https://digihublimited.com/"
    },
    {
      "id": "proj-30",
      "category": "woodmart elementor",
      "tag": "Jetengine · WoodMart",
      "title": "Be Glam By Safrin",
      "desc": "Be Glam by Safrin delivers premium beauty essentials and accessories, empowering women.",
      "image": "images/projects/be-glam-by-safrin.png",
      "url": "https://nccleaning.com.au/"
    }
  ],
  "about": {
    "paragraphs": [
      "I’m Abdullah Al Niem, a WordPress Developer specializing in Elementor and modern website development. I’ve worked on business websites, eCommerce stores, landing pages and custom WordPress projects.",
      "My main expertise is WordPress, Elementor Pro and WooCommerce, with experience building clean, responsive and user-friendly websites. I’ve also been learning Shopify for the past year to expand my eCommerce development skills.",
      "Whether it's a business website, an online store or a custom landing page, I focus on details that actually move the needle: speed, clarity and a smooth user experience across every device."
    ],
    "statNumber": "80+",
    "statLabel": "Happy Clients"
  },
  "resume": {
    "experience": [
      {
        "year": "Oct 2025 – Apr 2026",
        "title": "WordPress Developer (Elementor Expert)",
        "company": "Grippersoft | Narayanganj, Bangladesh",
        "desc": "Building responsive WordPress websites, business websites, landing pages and WooCommerce experiences."
      },
      {
        "year": "Jan 2025 – Sept 2025",
        "title": "Web Designer & Developer",
        "company": "Softvence | Dhaka, Bangladesh",
        "desc": "Designed and developed client-focused websites with Elementor, Figma and modern UI principles."
      },
      {
        "year": "Apr 2024 – Nov 2024",
        "title": "Data Entry Executive",
        "company": "Golden Harvert Info Tech Ltd.",
        "desc": "Handled data entry, web research, document management, and digital content-related tasks with accuracy and attention to detail."
      },
      {
        "year": "Jan 2023 – Jul 2024",
        "title": "English Teacher",
        "company": "A-One Academy (Coaching Centre) | Mirpur-2, Dhaka",
        "desc": "Provided English language instruction, supported students with communication skills, and prepared learning materials for effective classroom learning."
      }
    ],
    "education": [
      {
        "icon": "🎓",
        "school": "Dhaka Central University",
        "degree": "Bachelor of Art’s - History (Ongoing) (2021 - 2022)",
        "result": "Result: 4th Year Running"
      },
      {
        "icon": "🎓",
        "school": "New Govt. Degree College, Rajshahi",
        "degree": "Higher Secondary Certificate-HSC (2019-2021)",
        "result": "Result: GPA-5.00 (Out Of 5)"
      },
      {
        "icon": "🎓",
        "school": "Chahera Aladipur High School, Naogaon",
        "degree": "Secondary School Certificate-SSC (2014-2019)",
        "result": "Result: GPA-5.00 (Out Of 5)"
      }
    ],
    "skills": [
      {
        "name": "WordPress",
        "percent": "94"
      },
      {
        "name": "Elementor Pro",
        "percent": "96"
      },
      {
        "name": "DIVI",
        "percent": "90"
      },
      {
        "name": "WooCommerce",
        "percent": "86"
      },
      {
        "name": "Shopify",
        "percent": "85"
      },
      {
        "name": "Replo",
        "percent": "80"
      },
      {
        "name": "Gempages",
        "percent": "85"
      }
    ]
  }
};

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }

  try {
    const store = getStore({ name: 'site-content', consistency: 'strong' });

    if (req.method === 'GET') {
      let data = await store.get('main', { type: 'json' });
      if (!data) {
        // First run ever: seed Blobs with the original site data.
        data = SEED_DATA;
        await store.setJSON('main', data);
      }
      return json(data);
    }

    if (req.method === 'POST') {
      const adminPassword = process.env.ADMIN_PASSWORD;
      const suppliedPassword = req.headers.get('x-admin-password') || '';

      if (!adminPassword) {
        return json({ error: 'Server is not configured. Set ADMIN_PASSWORD in Netlify environment variables.' }, 500);
      }
      if (suppliedPassword !== adminPassword) {
        return json({ error: 'Wrong password.' }, 401);
      }

      let body;
      try {
        body = await req.json();
      } catch (e) {
        return json({ error: 'Invalid JSON body.' }, 400);
      }

      if (
        typeof body !== 'object' || body === null ||
        typeof body.blogPosts !== 'object' ||
        !Array.isArray(body.projects) ||
        typeof body.about !== 'object' ||
        typeof body.resume !== 'object'
      ) {
        return json({ error: 'Data shape looks wrong (expected blogPosts, projects, about, resume).' }, 400);
      }

      await store.setJSON('main', body);
      return json({ ok: true });
    }

    return json({ error: 'Method not allowed.' }, 405);
  } catch (err) {
    // Surface the real error instead of a blank 500, so it's easy to diagnose
    // from the browser (e.g. Netlify Blobs not available on this site yet).
    return json({
      error: 'Server error in data function: ' + (err && err.message ? err.message : String(err)),
      name: err && err.name
    }, 500);
  }
};

export const config = {
  path: '/.netlify/functions/data'
};
