import { Globe, Rocket, Trophy, Sparkles } from "lucide-react";

export interface CategoryColor {
  category: string;
  borderColor: string;
  bgColor: string;
  solidBg: string;
  textColor: string;
  iconColor: string;
  icon: typeof Globe;
  label: string;
}

// 分类匹配模式
const DOMESTIC_EXAMS_PATTERN = /CET[46]|考研|专八/i;
const INTERNATIONAL_EXAMS_PATTERN = /IELTS|TOEFL|GMAT/i;

/**
 * 根据单词书信息判断其分类
 * 返回分类标识：'owned' | 'domestic' | 'international' | 'general'
 */
export function categorizeWordbook(
  book: { name?: string; category?: string; is_system?: boolean; owner_id?: number | null; currentUserId?: number | null }
): "owned" | "domestic" | "international" | "general" {
  // 自创词本优先级最高
  if (!book.is_system && book.owner_id && book.currentUserId && book.owner_id === book.currentUserId) {
    return "owned";
  }

  const text = `${book.name || ""} ${book.category || ""}`.toUpperCase();

  if (DOMESTIC_EXAMS_PATTERN.test(text)) {
    return "domestic";
  }

  if (INTERNATIONAL_EXAMS_PATTERN.test(text)) {
    return "international";
  }

  return "general";
}

/**
 * 获取分类对应的颜色方案 - 现代美学设计
 */
export function getCategoryColor(
  category: "owned" | "domestic" | "international" | "general"
): CategoryColor {
  const schemes: Record<string, CategoryColor> = {
    owned: {
      category: "owned",
      borderColor: "border-rose-500",
      bgColor: "bg-rose-50",
      solidBg: "bg-rose-200",
      textColor: "text-rose-700",
      iconColor: "text-rose-300",
      icon: Sparkles,
      label: "",
    },
    domestic: {
      category: "domestic",
      borderColor: "border-amber-500",
      bgColor: "bg-amber-50",
      solidBg: "bg-amber-200",
      textColor: "text-amber-700",
      iconColor: "text-amber-300",
      icon: Globe,
      label: "",
    },
    international: {
      category: "international",
      borderColor: "border-sky-500",
      bgColor: "bg-sky-50",
      solidBg: "bg-sky-200",
      textColor: "text-sky-700",
      iconColor: "text-sky-300",
      icon: Rocket,
      label: "",
    },
    general: {
      category: "general",
      borderColor: "border-emerald-500",
      bgColor: "bg-emerald-50",
      solidBg: "bg-emerald-200",
      textColor: "text-emerald-700",
      iconColor: "text-emerald-300",
      icon: Trophy,
      label: "",
    },
  };

  return schemes[category];
}

/**
 * 一步到位：从单词书对象获取颜色方案
 */
export function getWordbookColor(book: {
  name?: string;
  category?: string;
  is_system?: boolean;
  owner_id?: number | null;
  currentUserId?: number | null;
}): CategoryColor {
  const cat = categorizeWordbook(book);
  return getCategoryColor(cat);
}

/**
 * 获取卡片样式类名（Tailwind）
 */
export function getWordbookCardClasses(
  book: {
    name?: string;
    category?: string;
    is_system?: boolean;
    owner_id?: number | null;
    currentUserId?: number | null;
  }
): string {
  const color = getWordbookColor(book);
  return `relative aspect-[3/4] w-full overflow-hidden rounded-2xl ${
    color.borderColor
  } border-[3px] ${color.solidBg} p-4 text-left text-white shadow-sm transition hover:-translate-y-0.5`;
}

/**
 * 生成淡色背景（用于已导入标签等）
 */
export function getLightBgColor(
  category: "owned" | "domestic" | "international" | "general"
): string {
  const bgMap: Record<string, string> = {
    owned: "bg-rose-200",
    domestic: "bg-amber-200",
    international: "bg-sky-200",
    general: "bg-emerald-200",
  };
  return bgMap[category];
}
