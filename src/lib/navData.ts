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
                    { label: 'All Scrub Suits', href: '/products?cat=scrubs&gender=men' },
                    { label: 'Classic V-Neck', href: '/products?cat=scrubs&gender=men' },
                ]
            },
            {
                title: 'UNDER SCRUBS & TOPS',
                items: [
                    { label: 'All Under Scrubs', href: '/products?cat=underscrubs&gender=men' },
                    { label: 'T-Shirts', href: '/products?cat=tshirts&gender=men' },
                ]
            },
            {
                title: 'SURGICAL & LAB',
                items: [
                    { label: 'Lab Coats', href: '/products?cat=lab-coats&gender=men' },
                    { label: 'Surgical Gowns', href: '/products?cat=lab-coats&gender=men' },
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
                    { label: 'Lab Coats', href: '/products?cat=lab-coats&gender=women' },
                    { label: 'Surgical Gowns', href: '/products?cat=lab-coats&gender=women' },
                ]
            }
        ]
    },
    {
        label: 'SURGICAL WEAR',
        href: '/products?cat=lab-coats',
        type: 'MEGA_MENU',
        children: [
            {
                title: 'OPERATING ROOM',
                items: [
                    { label: 'All Surgical Wear', href: '/products?cat=lab-coats' },
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
