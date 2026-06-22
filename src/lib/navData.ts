export interface NavItem {
    label: string;
    href: string;
    type: 'LINK' | 'MEGA_MENU';
    children?: {
        title: string;
        items: { label: string; href: string }[];
    }[];
}

// HARDCODED CATEGORY TREE FOR ADMIN AND FILTERS
export interface CategoryNode {
    id: number;
    name: string;
    slug: string;
    children?: CategoryNode[];
}

export const HARDCODED_CATEGORIES: CategoryNode[] = [
    {
        id: 1, name: "Scrub Suit", slug: "scrubs",
        children: [
            { id: 101, name: "Flexi Fit V Scrub", slug: "flexi-fit-v-scrub" },
            { id: 102, name: "Classic Scrub", slug: "classic-scrub" }
        ]
    },
    {
        id: 2, name: "Cotton Crew T-Shirt", slug: "tshirts",
        children: [
            { id: 201, name: "Men's Cotton Tee", slug: "men-tshirt" },
            { id: 202, name: "Women's Cotton Tee", slug: "women-tshirt" }
        ]
    },
    {
        id: 3, name: "Full Sleeve Under Scrub", slug: "underscrubs",
        children: [
            { id: 301, name: "Compression Under Scrub", slug: "compression-underscrub" }
        ]
    },
    {
        id: 4, name: "Surgical Wear", slug: "surgical-wear",
        children: [
            { id: 401, name: "Surgeon Gown", slug: "lab-coats" },
            { id: 402, name: "Surgeon Cap", slug: "accessories" }
        ]
    },
    {
        id: 5, name: "Linen & Bedding", slug: "linen-and-bedding",
        children: [
            { id: 501, name: "Brown Blanket", slug: "brown-blankets" },
            { id: 502, name: "Patient Dress", slug: "patient-dress" },
            { id: 503, name: "Maternity Gown", slug: "maternity-gown" }
        ]
    }
];

export const NAV_DATA: NavItem[] = [
    {
        label: 'MEN',
        href: '/products?gender=men',
        type: 'MEGA_MENU',
        children: [
            {
                title: 'SCRUB SUITS',
                items: [
                    { label: 'All Scrub Suits', href: '/products?cat=scrubs&gender=men' },
                    { label: 'Flexi Fit V Scrub', href: '/products?cat=flexi-fit-v-scrub&gender=men' },
                ]
            },
            {
                title: 'UNDER SCRUBS & TOPS',
                items: [
                    { label: 'All Under Scrubs', href: '/products?cat=underscrubs&gender=men' },
                    { label: 'Cotton Crew T-Shirt', href: '/products?cat=tshirts&gender=men' },
                ]
            },
            {
                title: 'SURGICAL & LAB',
                items: [
                    { label: 'Surgical Gowns', href: '/products?cat=lab-coats&gender=men' },
                    { label: 'Surgical Caps', href: '/products?cat=accessories&gender=men' },
                ]
            }
        ]
    },
    {
        label: 'WOMEN',
        href: '/products?gender=women',
        type: 'MEGA_MENU',
        children: [
            {
                title: 'SCRUB SUITS',
                items: [
                    { label: 'All Scrub Suits', href: '/products?cat=scrubs&gender=women' },
                    { label: 'Flexi fit V-Neck', href: '/products?cat=scrubs&gender=women' },
                ]
            },
            {
                title: 'UNDER SCRUBS & TOPS',
                items: [
                    { label: 'All Under Scrubs', href: '/products?cat=underscrubs&gender=women' },
                    { label: 'Cotton T-Shirts', href: '/products?cat=tshirts&gender=women' },
                ]
            },
            {
                title: 'SURGICAL & LAB',
                items: [
                    { label: 'Surgical Gowns', href: '/products?cat=lab-coats&gender=women' },
                    { label: 'Surgical Caps', href: '/products?cat=accessories&gender=women' },
                ]
            }
        ]
    },
    {
        label: 'SURGICAL WEAR',
        href: '/products?cat=surgical-wear',
        type: 'MEGA_MENU',
        children: [
            {
                title: 'OPERATING ROOM',
                items: [
                    { label: 'Surgical Gowns', href: '/products?cat=lab-coats' },
                    { label: 'Surgical Caps', href: '/products?cat=accessories' },
                ]
            }
        ]
    },
    {
        label: 'BULK ORDERS',
        href: '/bulk-orders',
        type: 'MEGA_MENU',
        children: [
            {
                title: 'INSTITUTIONAL SERVICES',
                items: [
                    { label: 'Scrub Suits', href: '/bulk-orders/scrubs' },
                    { label: 'Linen & Bedding', href: '/bulk-orders/linen-and-bedding' },
                    { label: 'Maternity Gown', href: '/bulk-orders/maternity-gown' },
                    { label: 'Patient Dress', href: '/bulk-orders/patient-dress' },
                    { label: 'Brown Blanket', href: '/bulk-orders/brown-blankets' },
                ]
            }
        ]
    },
    { label: 'ABOUT US', href: '/about', type: 'LINK' },
    { label: 'BLOGS', href: '/blog', type: 'LINK' },
    { label: 'CONTACT US', href: '/contact', type: 'LINK' },
];
