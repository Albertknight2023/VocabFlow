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

const DOMESTIC_EXAMS_PATTERN = /CET[46]|考研|专八/i;
const INTERNATIONAL_EXAMS_PATTERN = /IELTS|TOEFL|GMAT/i;

export function categorizeWordbook(
  book: { name?: string; category?: string; is_system?: boolean; owner_id?: number | null; currentUserId?: number | null },
): "owned" | "domestic" | "international" | "general" {
  const text = `${book.name || ""} ${book.category || ""}`.toUpperCase();

  // 自建词书（非系统书）→ owned
  if (!book.is_system) {
    // 明确匹配 owner_id → 一定是自己的
    if (book.owner_id && book.currentUserId && book.owner_id === book.currentUserId) {
      return "owned";
    }
    // 非系统书但 owner_id 缺失（API 未返回），也按 owned 处理
    if (!book.owner_id) {
      return "owned";
    }
    return "owned";
  }

  // 系统词书 → 按考试类型匹配
  if (INTERNATIONAL_EXAMS_PATTERN.test(text)) return "international";
  // 国内考试 / 通用 → domestic
  return "domestic";
}

export function getCategoryColor(
  category: "owned" | "domestic" | "international" | "general",
): CategoryColor {
  const schemes: Record<string, CategoryColor> = {
    owned: {
      category: "owned",
      borderColor: "border-primary-200",
      bgColor: "bg-primary-50",
      solidBg: "bg-primary-100",
      textColor: "text-primary-700",
      iconColor: "text-primary-200",
      icon: Sparkles,
      label: "",
    },
    domestic: {
      category: "domestic",
      borderColor: "border-amber-200",
      bgColor: "bg-amber-50",
      solidBg: "bg-amber-100",
      textColor: "text-amber-700",
      iconColor: "text-amber-200",
      icon: Globe,
      label: "",
    },
    international: {
      category: "international",
      borderColor: "border-sky-200",
      bgColor: "bg-sky-50",
      solidBg: "bg-sky-100",
      textColor: "text-sky-700",
      iconColor: "text-sky-200",
      icon: Rocket,
      label: "",
    },
    general: {
      category: "general",
      borderColor: "border-emerald-200",
      bgColor: "bg-emerald-50",
      solidBg: "bg-emerald-100",
      textColor: "text-emerald-700",
      iconColor: "text-emerald-200",
      icon: Trophy,
      label: "",
    },
  };
  return schemes[category];
}

export function getWordbookColor(book: {
  name?: string;
  category?: string;
  is_system?: boolean;
  owner_id?: number | null;
  currentUserId?: number | null;
}): CategoryColor {
  return getCategoryColor(categorizeWordbook(book));
}

/**
 * burst 动画颜色映射
 * 橙=自建 · 青=海外 · 绿=国内
 */
const burstColorMap: Record<string, string> = {
  owned: "bg-[#f97316]",
  international: "bg-[#0891b2]",
  domestic: "bg-[#16a34a]",
  general: "bg-[#15803d]",
};

export function getBurstColor(book: {
  name?: string;
  category?: string;
  is_system?: boolean;
  owner_id?: number | null;
  currentUserId?: number | null;
}): string {
  return burstColorMap[categorizeWordbook(book)];
}

export function getWordbookCardClasses(book: {
  name?: string;
  category?: string;
  is_system?: boolean;
  owner_id?: number | null;
  currentUserId?: number | null;
}): string {
  const color = getWordbookColor(book);
  return `relative aspect-[1] w-full overflow-hidden rounded-card ${color.borderColor} border ${color.solidBg} p-3 text-left shadow-card transition hover:-translate-y-0.5`;
}
