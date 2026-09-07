export type EmbroideryOptionType = 'none' | 'bundle' | 'top' | 'bottom';

export type FontStyleType = 'block' | 'script';

export type TextColorChoice = 'white' | 'black' | 'yellow' | 'green' | 'pink';

export interface MedicalIconItem {
  id: string;
  name: string;
  category: 'classic' | 'limited';
  color?: string;
  svgPath?: string; // Path or icon representation
  isCustom?: boolean;
}

export interface EmbroideryPrices {
  bundlePrice: number; // e.g. 598
  bundleOriginalPrice: number; // e.g. 748
  topPrice: number; // e.g. 299
  bottomPrice: number; // e.g. 199
  customLogoExtraPrice: number; // e.g. 250
}

export interface ColorVariantImageMap {
  [colorName: string]: string; // Maps "Navy Blue" -> image URL
}

export interface ProductEmbroideryConfig {
  prices: EmbroideryPrices;
  colorImages?: ColorVariantImageMap;
  defaultBaseImage?: string;
}

export interface EmbroideryCustomizationState {
  selectedOption: EmbroideryOptionType;
  line1: string; // Name (max 22)
  line2: string; // Designation (max 22)
  fontStyle: FontStyleType;
  textColor: TextColorChoice;
  selectedIconId: string; // e.g. 'caduceus'
  customLogoUrl: string | null;
  customLogoFileName: string | null;
  customLogoSize: number | null;
  textPositionPlacement: string;
  iconPositionPlacement: string;
  totalEmbroideryPrice: number;
}
