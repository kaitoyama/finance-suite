"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home,
  FileText,
  BookOpen,
  TrendingUp,
  Receipt,
  Wallet,
  BarChart3,
  Tags
} from "lucide-react";

const navigation = [
  {
    name: "ダッシュボード",
    href: "/",
    icon: Home,
  },
  {
    name: "請求書",
    href: "/invoices",
    icon: FileText,
  },
  {
    name: "経費申請",
    href: "/expenses",
    icon: Receipt,
  },
  {
    name: "仕訳帳",
    href: "/journals",
    icon: BookOpen,
  },
  {
    name: "勘定科目",
    href: "/accounts",
    icon: Wallet,
  },
  {
    name: "カテゴリ",
    href: "/categories",
    icon: Tags,
  },
  {
    name: "予算",
    href: "/dashboard/budgets",
    icon: TrendingUp,
  },
  {
    name: "損益計算書",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-gray-50 border-r">
      {/* 
        Note: This Sidebar component expects its width (e.g., w-64) 
        to be managed by its parent container. In AppLayout, the wrapper 
        div around the <Sidebar /> instance provides this. 
      */}
      <div className="flex h-16 items-center justify-center border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">財務管理システム</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t p-4">
        <div className="text-xs text-gray-500">
          Finance Suite v1.0
        </div>
      </div>
    </div>
  );
}