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
        id: 1, name: "Men", slug: "men",
        children: [
            {
                id: 10, name: "Scrub Suit", slug: "men-scrub-suit",
                children: [
                    { id: 101, name: "Flexi Fit V Scrub", slug: "men-flexi-fit-v-scrub" }
                ]
            },
            { id: 11, name: "Cotton T-Shirt", slug: "men-cotton-tshirt" },
            {
                id: 12, name: "Under Scrub", slug: "men-underscrub",
                children: [
                    { id: 121, name: "Full Sleeve Compression Underscrub", slug: "men-full-sleeve-compression-underscrub" }
                ]
            },
            { id: 13, name: "Surgical Gown", slug: "men-surgeon-gown" },
            { id: 14, name: "Surgical Cap", slug: "men-surgeon-cap" }
        ]
    },
    {
        id: 2, name: "Women", slug: "women",
        children: [
            {
                id: 20, name: "Scrub Suit", slug: "women-scrub-suit",
                children: [
                    { id: 201, name: "Flexi Fit V Scrub", slug: "women-flexi-fit-v-scrub" }
                ]
            },
            { id: 21, name: "Cotton T-Shirt", slug: "women-cotton-tshirt" },
            {
                id: 22, name: "Under Scrub", slug: "women-underscrub",
                children: [
                    { id: 221, name: "Full Sleeve Compression Underscrub", slug: "women-full-sleeve-compression-underscrub" }
                ]
            },
            { id: 23, name: "Surgical Gown", slug: "women-surgeon-gown" },
            { id: 24, name: "Surgical Cap", slug: "women-surgeon-cap" }
        ]
    },
    {
        id: 3, name: "Surgical Wear", slug: "surgical-wear",
        children: [
            { id: 30, name: "Surgical Gown", slug: "surgical-surgeon-gown" },
            { id: 31, name: "Surgical Cap", slug: "surgical-surgeon-cap" }
        ]
    },
    {
        id: 4, name: "Bulk Orders", slug: "bulk-orders",
        children: [
            { id: 40, name: "Linen & Bedding", slug: "linen-and-bedding" },
            { id: 41, name: "Brown Blanket", slug: "brown-blankets" },
            { id: 43, name: "Patient Dress", slug: "patient-dress" },
            { id: 44, name: "Maternity Gown", slug: "maternity-gown" }
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
                    { label: 'All Scrub Suits', href: '/products?cat=men-scrub-suit&gender=men' },
                    { label: 'Flexi Fit V Scrub', href: '/products?cat=men-flexi-fit-v-scrub&gender=men' },
                ]
            },
            {
                title: 'UNDER SCRUBS & TOPS',
                items: [
                    { label: 'All Under Scrubs', href: '/products?cat=men-underscrub&gender=men' },
                    { label: 'Full Sleeve Compression', href: '/products?cat=men-full-sleeve-compression-underscrub&gender=men' },
                    { label: 'Cotton T-Shirt', href: '/products?cat=men-cotton-tshirt&gender=men' },
                ]
            },
            {
                title: 'SURGICAL & LAB',
                items: [
                    { label: 'Surgical Gown', href: '/products?cat=men-surgeon-gown&gender=men' },
                    { label: 'Surgical Cap', href: '/products?cat=men-surgeon-cap&gender=men' },
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
                    { label: 'All Scrub Suits', href: '/products?cat=women-scrub-suit&gender=women' },
                    { label: 'Flexi Fit V Scrub', href: '/products?cat=women-flexi-fit-v-scrub&gender=women' },
                ]
            },
            {
                title: 'UNDER SCRUBS & TOPS',
                items: [
                    { label: 'All Under Scrubs', href: '/products?cat=women-underscrub&gender=women' },
                    { label: 'Full Sleeve Compression', href: '/products?cat=women-full-sleeve-compression-underscrub&gender=women' },
                    { label: 'Cotton T-Shirt', href: '/products?cat=women-cotton-tshirt&gender=women' },
                ]
            },
            {
                title: 'SURGICAL & LAB',
                items: [
                    { label: 'Surgical Gown', href: '/products?cat=women-surgeon-gown&gender=women' },
                    { label: 'Surgical Cap', href: '/products?cat=women-surgeon-cap&gender=women' },
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
                    { label: 'Surgical Gown', href: '/products?cat=surgical-surgeon-gown' },
                    { label: 'Surgical Cap', href: '/products?cat=surgical-surgeon-cap' },
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
                    { label: 'Scrub Suits', href: '/products?cat=scrub-suit' },
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
