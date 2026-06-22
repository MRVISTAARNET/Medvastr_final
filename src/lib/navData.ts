export interface NavItem {
    label: string;
    href: string;
    type: 'LINK' | 'MEGA_MENU';
    children?: {
        title: string;
        items: { label: string; href: string }[];
    }[];
}

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
                    { label: 'Flexi Fit V Scrub', href: '/products?cat=flexi-fit-v-scrub&gender=men' },
                ]
            },
            {
                title: 'UNDER SCRUBS & TOPS',
                items: [
                    { label: 'All Under Scrubs', href: '/products?cat=men-under-scrub&gender=men' },
                    { label: 'Full Sleeve Compression', href: '/products?cat=full-sleeve-compression-under-scrub&gender=men' },
                    { label: 'Cotton Crew T-Shirt', href: '/products?cat=men-cotton-crew-tshirt&gender=men' },
                ]
            },
            {
                title: 'SURGICAL & LAB',
                items: [
                    { label: 'Surgical Gowns', href: '/products?cat=surgical-gown&gender=men' },
                    { label: 'Surgical Caps', href: '/products?cat=surgical-cap&gender=men' },
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
                    { label: 'All Under Scrubs', href: '/products?cat=women-under-scrub&gender=women' },
                    { label: 'Full Sleeve Compression', href: '/products?cat=women-full-sleeve-compression-under-scrub&gender=women' },
                    { label: 'Cotton Crew T-Shirt', href: '/products?cat=women-cotton-crew-tshirt&gender=women' },
                ]
            },
            {
                title: 'SURGICAL & LAB',
                items: [
                    { label: 'Surgical Gowns', href: '/products?cat=women-surgical-gown&gender=women' },
                    { label: 'Surgical Caps', href: '/products?cat=women-surgical-cap&gender=women' },
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
                    { label: 'Surgical Gowns', href: '/products?cat=surgical-gown' },
                    { label: 'Surgical Caps', href: '/products?cat=surgical-cap' },
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
                    { label: 'Scrub Suits', href: '/bulk-orders/scrub-suit' },
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
