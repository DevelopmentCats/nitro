import { AvatarEditorFigureCategory } from "@nitro/renderer";

import { GetPixelEffectIcon } from "../catalog/CatalogUtilities";
import { CategoryBaseModel } from "./CategoryBaseModel";
import { CategoryData } from "./CategoryData";
import { AvatarEditorGridPartItem } from "./AvatarEditorGridPartItem";
import { AvatarEditorUtilities } from "./AvatarEditorUtilities";

// Custom effect part item for handling effects without real part sets
class EffectPartItem extends AvatarEditorGridPartItem {
  private _effectId: number;
  private _effectImageUrl: string;

  constructor(effectId: number, isClear: boolean = false) {
    super(null, null, false, false);
    this._effectId = effectId;
    this.isClear = isClear;
    
    // Set the image URL for the effect icon
    if (!isClear && effectId > 0) {
      this._effectImageUrl = GetPixelEffectIcon(effectId);
    }
  }

  public get id(): number {
    return this._effectId;
  }

  public get imageUrl(): string {
    return this._effectImageUrl || super.imageUrl;
  }
}

export class EffectsModel extends CategoryBaseModel {
  private static _availableEffects: number[] = [];

  public static setAvailableEffects(effects: number[]): void {
    EffectsModel._availableEffects = effects;
  }

  public init(): void {
    super.init();

    // Effects don't use traditional figure parts, so we create a custom category
    this.createEffectsCategory();
    
    this._isInitalized = true;
  }

  private createEffectsCategory(): void {
    const partItems: AvatarEditorGridPartItem[] = [];
    const colorItems: any[][] = [[], []]; // Effects don't use colors but the structure expects it

    // Add "None" option (ID 0)
    const noneItem = new EffectPartItem(0, true);
    partItems.push(noneItem);

    // Add available effects from static property or default sample effects
    const effectsToAdd = EffectsModel._availableEffects.length > 0 
      ? EffectsModel._availableEffects 
      : [];
    
    for (const effectId of effectsToAdd) {
      if (effectId > 0) { // Don't add effect 0 twice
        const effectItem = new EffectPartItem(effectId, false);
        partItems.push(effectItem);
      }
    }

    const categoryData = new CategoryData("effects_icon", partItems, colorItems);
    
    if (!this._categories) {
      this._categories = new Map();
    }
    
    this._categories.set("effects_icon", categoryData);

    // Set the current selection to "None" by default
    if (categoryData.parts.length > 0) {
      categoryData.selectPartIndex(0);
    }
  }

  public selectPart(category: string, partIndex: number): void {
    const categoryData = this._categories.get(category);
    
    if (!categoryData) return;

    categoryData.selectPartIndex(partIndex);
    
    const partItem = categoryData.getCurrentPart();
    
    if (!partItem) return;
    console.log("Selected effect part:", partItem.id);

    // For effects, we set the avatarEffectType directly instead of using figure parts
    if (partItem.isClear) {
      // "None" selected - set effect to 0
      if (AvatarEditorUtilities.CURRENT_FIGURE) {
        AvatarEditorUtilities.CURRENT_FIGURE.avatarEffectType = 0;
        AvatarEditorUtilities.CURRENT_FIGURE.updateView(); // Trigger preview update
      }
    } else {
      // Effect selected - set the effect ID
      if (AvatarEditorUtilities.CURRENT_FIGURE) {
        AvatarEditorUtilities.CURRENT_FIGURE.avatarEffectType = partItem.id;
        AvatarEditorUtilities.CURRENT_FIGURE.updateView(); // Trigger preview update
      }
    }
  }

  public selectColor(): void {
    // Effects don't use colors, so this is a no-op
  }

  public get name(): string {
    return AvatarEditorFigureCategory.EFFECTS;
  }
}