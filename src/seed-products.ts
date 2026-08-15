/**
 * Mock product seeder for S+ Store.
 *
 * Uses the Payload Local API, which bypasses collection access control — so
 * `tenant.stripeDetailsSubmitted` is not checked, and `tenant` is assigned
 * explicitly rather than through the multi-tenant plugin's cookie scoping.
 *
 * Creates products + media only. No users, no reviews.
 *
 *   bun run db:seed:products                # seed
 *   bun run db:seed:products -- --dry-run   # resolve + print plan, write nothing
 *   bun run db:seed:products -- --purge     # remove what this script created
 *
 * Env:
 *   PEXELS_API_KEY  required (unless --dry-run / --purge)
 *   TENANT_SLUGS    optional, defaults to "tika,malkhan"
 *   DATABASE_URI / PAYLOAD_SECRET / BLOB_READ_WRITE_TOKEN  from your .env
 */

import { getPayload } from "payload";
import config from "@payload-config";
import type { Tenant } from "@/payload-types";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const MEDIA_MARKER = "[demo]";

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const PURGE = args.has("--purge");

const TENANT_SLUGS = (process.env.TENANT_SLUGS ?? "tika,malkhan")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const PEXELS_API_KEY = process.env.PEXELS_API_KEY ?? "";

// ---------------------------------------------------------------------------
// Lexical richtext
// ---------------------------------------------------------------------------

function buildParagraphs(paragraphs: string[]) {
    return {
        root: {
            type: "root",
            format: "" as const,
            indent: 0,
            version: 1,
            direction: "ltr" as const,
            children: paragraphs.map((p) => ({
                type: "paragraph",
                format: "" as const,
                indent: 0,
                version: 1,
                direction: "ltr" as const,
                textFormat: 0,
                children: [
                    {
                        type: "text",
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: p,
                        version: 1,
                    },
                ],
            })),
        },
    };
}

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

interface SeedProduct {
    name: string;
    blurb: string;
    body: string;
    price: number; // INR
    categorySlug: string;
    tags: string[];
    imageQuery: string;
    refundPolicy: "30-day" | "14-day" | "7-day" | "3-day" | "1-day" | "no-refunds";
}

const CATALOGUE: SeedProduct[] = [
    {
        name: "The Indie Founder's Financial Model",
        blurb:
            "A spreadsheet-first financial model built for bootstrapped software businesses, not venture-backed ones.",
        body: "Includes a 36-month projection workbook, a cohort retention tab wired to your churn assumptions, and a runway calculator that accounts for GST and quarterly advance tax. Written for founders who have never built a model before.",
        price: 2499,
        categorySlug: "entrepreneurship",
        tags: ["Spreadsheet", "Finance", "Startup"],
        imageQuery: "startup desk laptop",
        refundPolicy: "30-day",
    },
    {
        name: "Bookkeeping for Freelancers in India",
        blurb: "Stop dreading tax season. A complete bookkeeping system in one Notion workspace.",
        body: "Covers invoice tracking, expense categorisation, TDS reconciliation, and a quarterly checklist. Includes filled-in examples from a real freelance design practice.",
        price: 1299,
        categorySlug: "accounting",
        tags: ["Notion", "Freelance", "Templates"],
        imageQuery: "accounting paperwork calculator",
        refundPolicy: "14-day",
    },
    {
        name: "Index Investing Without the Noise",
        blurb: "A 90-page guide to building a low-cost portfolio and then ignoring it.",
        body: "Explains asset allocation, expense ratios, rebalancing bands, and why most active funds underperform their benchmark. Contains no stock tips and never will.",
        price: 899,
        categorySlug: "investing",
        tags: ["Ebook", "Finance", "Beginner"],
        imageQuery: "stock market chart screen",
        refundPolicy: "30-day",
    },
    {
        name: "Cold Email That Doesn't Get Deleted",
        blurb: "48 annotated cold emails that actually booked meetings, with the reply threads attached.",
        body: "Each example is broken down line by line: the subject choice, the opening hook, the specific ask, and the follow-up cadence. Includes the four templates that produced the highest reply rate.",
        price: 1799,
        categorySlug: "marketing-sales",
        tags: ["Copywriting", "Sales", "Swipe File"],
        imageQuery: "laptop email writing",
        refundPolicy: "14-day",
    },
    {
        name: "Production-Grade Next.js Patterns",
        blurb: "The architectural decisions that only show up after your app has real users.",
        body: "Server component boundaries, cache invalidation strategy, streaming with Suspense, error boundary placement, and how to structure a codebase that three people can work in without stepping on each other.",
        price: 3499,
        categorySlug: "web-development",
        tags: ["React", "Next.js", "Video Course"],
        imageQuery: "code editor screen developer",
        refundPolicy: "30-day",
    },
    {
        name: "TypeScript for People Who Already Know JavaScript",
        blurb: "Skip the fundamentals. Go straight to generics, conditional types, and inference.",
        body: "Twelve chapters of increasingly uncomfortable type puzzles, each with a worked solution. By the end you will be able to read the type definitions of libraries you currently avoid opening.",
        price: 1999,
        categorySlug: "programming-languages",
        tags: ["TypeScript", "Ebook", "Advanced"],
        imageQuery: "programming code monitor",
        refundPolicy: "14-day",
    },
    {
        name: "Ship It: A Practical CI/CD Handbook",
        blurb: "Pipelines that fail loudly, deploy safely, and roll back in under a minute.",
        body: "Covers GitHub Actions workflow design, environment promotion, database migration safety, feature flag rollout, and the observability you need before you can deploy on a Friday.",
        price: 2799,
        categorySlug: "devops",
        tags: ["DevOps", "CI/CD", "Handbook"],
        imageQuery: "server room data center",
        refundPolicy: "30-day",
    },
    {
        name: "Godot 4 Game Jam Starter Kit",
        blurb: "Everything you need to finish a game in 48 hours instead of abandoning it.",
        body: "A pre-wired Godot 4 project with scene management, input remapping, save system, audio bus, and a settings menu already built. Plus a jam-day schedule that accounts for sleep.",
        price: 1499,
        categorySlug: "game-development",
        tags: ["Godot", "Game Dev", "Template"],
        imageQuery: "video game controller neon",
        refundPolicy: "7-day",
    },
    {
        name: "The Freelance Writer's Rate Card",
        blurb: "How to price your writing without guessing, apologising, or racing to the bottom.",
        body: "A pricing framework based on project scope rather than word count, with scripts for the three hardest conversations: raising rates on an existing client, quoting a vague brief, and turning down bad work.",
        price: 999,
        categorySlug: "copywriting",
        tags: ["Freelance", "Pricing", "Guide"],
        imageQuery: "writing notebook coffee desk",
        refundPolicy: "14-day",
    },
    {
        name: "Self-Publish Your First Novel",
        blurb: "From finished draft to listed and selling, without a traditional publisher.",
        body: "Manuscript formatting, cover design briefs, ISBN and copyright in India, distribution channel comparison, launch-week pricing strategy, and the review-generation tactics that are actually permitted.",
        price: 1699,
        categorySlug: "self-publishing",
        tags: ["Publishing", "Writing", "Course"],
        imageQuery: "stack of books library",
        refundPolicy: "30-day",
    },
    {
        name: "Short Fiction Prompt Deck",
        blurb: "200 prompts designed to produce finished stories, not just interesting openings.",
        body: "Each prompt supplies a constraint, a turning point, and an ending condition, which is why they tend to actually get finished. Includes a print-ready PDF and a shuffle web app.",
        price: 599,
        categorySlug: "fiction",
        tags: ["Writing", "Creative", "PDF"],
        imageQuery: "typewriter vintage paper",
        refundPolicy: "7-day",
    },
    {
        name: "Build a Blog Audience From Zero",
        blurb: "The unglamorous, repeatable work behind blogs that reach 10,000 readers.",
        body: "Topic selection, publishing cadence, internal linking, the two distribution channels worth your time, and how to tell the difference between a post that failed and a post that was early.",
        price: 1399,
        categorySlug: "blogging",
        tags: ["Blogging", "Growth", "Course"],
        imageQuery: "blogger writing laptop cafe",
        refundPolicy: "14-day",
    },
    {
        name: "The Deep Work Operating System",
        blurb: "A calendar-first system for protecting four uninterrupted hours a day.",
        body: "Time-block templates, a meeting-decline script library, notification audit checklist, and a weekly review that takes eleven minutes. Built for people whose job includes other people.",
        price: 1199,
        categorySlug: "productivity",
        tags: ["Productivity", "Notion", "System"],
        imageQuery: "minimal desk planner calendar",
        refundPolicy: "30-day",
    },
    {
        name: "Mindfulness for Sceptics",
        blurb: "Ten guided sessions with no incense, no mysticism, and no talk of energy.",
        body: "Grounded in the clinical literature on attention regulation. Each session explains the mechanism before the practice, so you know what you are training and why it works.",
        price: 799,
        categorySlug: "mindfulness",
        tags: ["Audio", "Wellness", "Guided"],
        imageQuery: "calm lake sunrise meditation",
        refundPolicy: "30-day",
    },
    {
        name: "The Engineering Career Ladder, Explained",
        blurb: "What actually separates a senior engineer from a staff engineer, with evidence.",
        body: "Drawn from published ladders at fourteen companies. Includes a self-assessment rubric, a promotion packet template, and guidance on the scope conversations that precede any real title change.",
        price: 1899,
        categorySlug: "career-growth",
        tags: ["Career", "Engineering", "Guide"],
        imageQuery: "office meeting whiteboard team",
        refundPolicy: "14-day",
    },
    {
        name: "Strength Training for Desk Workers",
        blurb: "A 16-week programme built around three sessions a week and one piece of equipment.",
        body: "Progressive overload schedule, video demonstrations for every movement, and a mobility block that specifically targets the hip flexors and thoracic spine damage that sitting causes.",
        price: 1599,
        categorySlug: "workout-plans",
        tags: ["Fitness", "Programme", "Video"],
        imageQuery: "gym dumbbell training",
        refundPolicy: "30-day",
    },
    {
        name: "Vegetarian Protein, Solved",
        blurb: "60 Indian vegetarian recipes hitting 30g of protein per serving.",
        body: "Every recipe includes a full macro breakdown, a grocery cost estimate, and a prep-ahead variant. Built around dal, paneer, soya, and legumes rather than expensive imported supplements.",
        price: 699,
        categorySlug: "nutrition",
        tags: ["Recipes", "Nutrition", "Ebook"],
        imageQuery: "healthy indian food bowl",
        refundPolicy: "14-day",
    },
    {
        name: "Yoga for Lower Back Pain",
        blurb: "A gentle 30-day sequence designed with a physiotherapist.",
        body: "Twelve postures introduced progressively, with clear contraindications and modifications for each. Includes a printable daily card and a short version for high-pain days.",
        price: 899,
        categorySlug: "yoga",
        tags: ["Yoga", "Health", "Video"],
        imageQuery: "yoga mat stretching studio",
        refundPolicy: "30-day",
    },
    {
        name: "The Design System Starter Kit",
        blurb: "A Figma library and token pipeline you can hand to engineers on day one.",
        body: "Colour ramps validated for WCAG AA in both themes, a type scale, spacing primitives, 40 components with variants, and an export script that emits CSS custom properties and Tailwind config.",
        price: 3999,
        categorySlug: "ui-ux",
        tags: ["Figma", "Design System", "Tokens"],
        imageQuery: "ui design wireframe screen",
        refundPolicy: "30-day",
    },
    {
        name: "Typography for Non-Designers",
        blurb: "Why your slides look amateur, and the six decisions that fix them.",
        body: "Typeface pairing, measure and leading, optical alignment, hierarchy with only two weights, and a rescue guide for documents you have already made. Heavy on before-and-after examples.",
        price: 1099,
        categorySlug: "typography",
        tags: ["Typography", "Design", "Course"],
        imageQuery: "typography letterpress type",
        refundPolicy: "14-day",
    },
    {
        name: "Blender Hard-Surface Modelling",
        blurb: "Model a complete sci-fi prop from primitive to final render in eleven hours.",
        body: "Covers non-destructive boolean workflow, bevel weighting, UV packing, PBR texturing in Blender's shader graph, and a Cycles lighting setup you can reuse across projects.",
        price: 2999,
        categorySlug: "3d-modeling",
        tags: ["Blender", "3D", "Video Course"],
        imageQuery: "3d render abstract geometric",
        refundPolicy: "30-day",
    },
    {
        name: "Watercolour Landscapes: The Wet-on-Wet Method",
        blurb: "Eight paintings, filmed unedited and in real time, mistakes included.",
        body: "Paper stretching, pigment granulation, controlling bloom, and the timing judgement that separates a soft sky from a muddy one. Materials list keeps the total under two thousand rupees.",
        price: 1299,
        categorySlug: "watercolor",
        tags: ["Watercolour", "Art", "Video"],
        imageQuery: "watercolor painting brush art",
        refundPolicy: "14-day",
    },
    {
        name: "Mixing Vocals That Sit in the Track",
        blurb: "The compression, EQ, and saturation chain used on twelve released records.",
        body: "Includes the actual session files, a stock-plugin-only version of every chain, and a troubleshooting section for the four most common vocal problems: sibilance, boxiness, mud, and lifelessness.",
        price: 2299,
        categorySlug: "music-production",
        tags: ["Music", "Mixing", "Course"],
        imageQuery: "music studio mixing console",
        refundPolicy: "30-day",
    },
    {
        name: "Available Light Portraiture",
        blurb: "Make natural light do what a three-point studio setup would.",
        body: "Reading light direction and quality, positioning subjects relative to windows and open shade, colour temperature mixing, and a Lightroom workflow that keeps skin tones believable.",
        price: 1899,
        categorySlug: "portrait",
        tags: ["Photography", "Portrait", "Course"],
        imageQuery: "portrait photography natural light",
        refundPolicy: "30-day",
    },
];

// ---------------------------------------------------------------------------
// Pexels
// ---------------------------------------------------------------------------

interface PexelsPhoto {
    id: number;
    src: { large: string; landscape: string };
}

const pexelsCache = new Map<string, PexelsPhoto[]>();

async function pexelsSearch(query: string, orientation: "square" | "landscape") {
    const cacheKey = `${query}::${orientation}`;
    const cached = pexelsCache.get(cacheKey);
    if (cached) return cached;

    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("orientation", orientation);
    url.searchParams.set("per_page", "5");

    const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
    if (!res.ok) {
        throw new Error(`Pexels ${res.status} for "${query}" (${orientation})`);
    }

    const json = (await res.json()) as { photos?: PexelsPhoto[] };
    const photos = json.photos ?? [];
    pexelsCache.set(cacheKey, photos);
    return photos;
}

async function downloadTo(url: string, dest: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed ${res.status}`);
    await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
    return dest;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    const payload = await getPayload({ config });

    if (PURGE) {
        const products = await payload.delete({
            collection: "products",
            where: { name: { in: CATALOGUE.map((p) => p.name) } },
        });
        const media = await payload.delete({
            collection: "media",
            where: { alt: { like: MEDIA_MARKER } },
        });
        console.log(`Purged ${products.docs.length} products, ${media.docs.length} media.`);
        return;
    }

    if (!DRY_RUN && !PEXELS_API_KEY) {
        throw new Error("PEXELS_API_KEY is not set.");
    }

    // tenants
    const tenants: Tenant[] = [];
    for (const slug of TENANT_SLUGS) {
        const found = await payload.find({
            collection: "tenants",
            where: { slug: { equals: slug } },
            limit: 1,
            pagination: false,
        });
        const tenant = found.docs[0];
        if (!tenant) throw new Error(`Tenant not found: "${slug}"`);
        tenants.push(tenant);
        console.log(`tenant   ${tenant.slug.padEnd(16)} id=${tenant.id}`);
    }

    // categories
    const categoryDocs = await payload.find({
        collection: "categories",
        limit: 0,
        pagination: false,
    });
    const categoryBySlug = new Map(categoryDocs.docs.map((c) => [c.slug, c.id]));

    const missing = [
        ...new Set(CATALOGUE.map((p) => p.categorySlug).filter((s) => !categoryBySlug.has(s))),
    ];
    if (missing.length > 0) {
        throw new Error(`Missing categories: ${missing.join(", ")}. Run \`bun run db:seed\` first.`);
    }

    if (DRY_RUN) {
        console.log(`\nDry run — would create ${CATALOGUE.length} products:\n`);
        CATALOGUE.forEach((p, i) => {
            const t = tenants[i % tenants.length];
            console.log(
                `  ${String(i + 1).padStart(2)}. ${p.name.slice(0, 46).padEnd(48)} ${t?.slug.padEnd(12)} Rs.${p.price}`,
            );
        });
        return;
    }

    // tags
    const tagIdByName = new Map<string, string>();
    for (const name of [...new Set(CATALOGUE.flatMap((p) => p.tags))]) {
        const existing = await payload.find({
            collection: "tags",
            where: { name: { equals: name } },
            limit: 1,
            pagination: false,
        });
        const hit = existing.docs[0];
        tagIdByName.set(
            name,
            hit ? hit.id : (await payload.create({ collection: "tags", data: { name } })).id,
        );
    }
    console.log(`tags     ${tagIdByName.size} resolved`);

    // products
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "splus-seed-"));
    let created = 0;
    let skipped = 0;

    for (const [index, item] of CATALOGUE.entries()) {
        const tenant = tenants[index % tenants.length];
        if (!tenant) continue;

        const already = await payload.find({
            collection: "products",
            where: { name: { equals: item.name } },
            limit: 1,
            pagination: false,
        });
        if (already.docs[0]) {
            skipped += 1;
            console.log(`skip  ${String(index + 1).padStart(2)}  ${item.name.slice(0, 46)}`);
            continue;
        }

        let imageId: string | undefined;
        let coverId: string | undefined;

        try {
            const [squares, wides] = await Promise.all([
                pexelsSearch(item.imageQuery, "square"),
                pexelsSearch(item.imageQuery, "landscape"),
            ]);

            const square = squares[index % Math.max(squares.length, 1)];
            const wide = wides[index % Math.max(wides.length, 1)];

            if (square) {
                const file = await downloadTo(
                    square.src.large,
                    path.join(tmpDir, `card-${index}-${square.id}.jpg`),
                );
                imageId = (
                    await payload.create({
                        collection: "media",
                        data: { alt: `${MEDIA_MARKER} ${item.name}` },
                        filePath: file,
                    })
                ).id;
            }

            if (wide) {
                const file = await downloadTo(
                    wide.src.landscape,
                    path.join(tmpDir, `cover-${index}-${wide.id}.jpg`),
                );
                coverId = (
                    await payload.create({
                        collection: "media",
                        data: { alt: `${MEDIA_MARKER} ${item.name} cover` },
                        filePath: file,
                    })
                ).id;
            }
        } catch (err) {
            console.warn(`  ! images failed for "${item.name}": ${(err as Error).message}`);
        }

        await payload.create({
            collection: "products",
            data: {
                tenant: tenant.id,
                name: item.name,
                price: item.price,
                category: categoryBySlug.get(item.categorySlug),
                tags: item.tags.map((t) => tagIdByName.get(t)).filter((v): v is string => Boolean(v)),
                image: imageId,
                cover: coverId,
                refundPolicy: item.refundPolicy,
                isPrivate: false,
                isArchived: false,
                description: buildParagraphs([item.blurb, item.body]) as never,
                content: buildParagraphs([
                    "Thanks for your purchase. Your download links and getting-started guide are below.",
                    "Placeholder protected content, seeded for demonstration.",
                ]) as never,
            },
        });

        created += 1;
        console.log(
            `ok    ${String(index + 1).padStart(2)}  ${item.name.slice(0, 44).padEnd(46)} -> ${tenant.slug}`,
        );
    }

    await fs.rm(tmpDir, { recursive: true, force: true });
    console.log(`\nDone. ${created} created, ${skipped} already existed.`);
}

try {
    await main();
    process.exit(0);
} catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
}