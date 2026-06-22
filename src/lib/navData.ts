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
                title: 'TOPS & UNDER SCRUBS',
                items: [
                    { label: 'Cotton Crew T-Shirt', href: '/products?cat=men-cotton-crew-tshirt&gender=men' },
                    { label: 'Under Scrub', href: '/products?cat=men-under-scrub&gender=men' },
                    { label: 'Full Sleeve Compression', href: '/products?cat=full-sleeve-compression-under-scrub&gender=men' },
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
                title: 'TOPS & ESSENTIALS',
                items: [
                    { label: 'Cotton Crew T-Shirt', href: '/products?cat=women-cotton-crew-tshirt&gender=women' },
                    { label: 'Under Scrub', href: '/products?cat=women-under-scrub&gender=women' },
                    { label: 'Full Sleeve Compression', href: '/products?cat=women-full-sleeve-compression-under-scrub&gender=women' },
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
                title: 'INSTITUTIONAL',
                items: [
                    { label: 'Scrub Suits', href: '/products?cat=scrub-suit' },
                    { label: 'Linen & Bedding', href: '/products?cat=linen-and-bedding' },
                    { label: 'Maternity Gown', href: '/products?cat=maternity-gown' },
                    { label: 'Patient Dress', href: '/products?cat=patient-dress' },
                    { label: 'Brown Blanket', href: '/products?cat=brown-blankets' },
                ]
            }
        ]
    },
    { label: 'ABOUT US', href: '/about', type: 'LINK' },
    { label: 'BLOGS', href: '/blog', type: 'LINK' },
    { label: 'CONTACT US', href: '/contact', type: 'LINK' },
];
