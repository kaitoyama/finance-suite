import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CreditCard, Receipt, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        description="財務管理システムの概要"
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/invoices/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">新規請求書</CardTitle>
              <FileText className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+</div>
              <p className="text-xs text-muted-foreground">請求書を作成</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/expenses/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">経費申請</CardTitle>
              <Receipt className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+</div>
              <p className="text-xs text-muted-foreground">経費を申請</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/journals/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">仕訳入力</CardTitle>
              <CreditCard className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+</div>
              <p className="text-xs text-muted-foreground">仕訳を記録</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/budgets">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">予算管理</CardTitle>
              <TrendingUp className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥</div>
              <p className="text-xs text-muted-foreground">予算を確認</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>最近の請求書</CardTitle>
            <CardDescription>最新の請求書一覧</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">請求書がありません</span>
                <Link href="/invoices">
                  <Button variant="outline" size="sm">
                    すべて表示
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近の経費申請</CardTitle>
            <CardDescription>最新の経費申請一覧</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">経費申請がありません</span>
                <Link href="/expenses">
                  <Button variant="outline" size="sm">
                    すべて表示
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}