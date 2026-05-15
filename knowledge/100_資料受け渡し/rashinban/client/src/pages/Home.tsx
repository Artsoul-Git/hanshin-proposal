import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Target, Grid3X3, LayoutGrid, GitBranch } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: projects, isLoading: projectsLoading } = trpc.project.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Rashinban</span>
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.name || user?.email}</span>
            </div>
          ) : (
            <Button asChild>
              <a href={getLoginUrl()}>ログイン</a>
            </Button>
          )}
        </div>
      </header>

      <main className="container py-8">
        {/* Hero Section */}
        {!isAuthenticated && (
          <section className="text-center py-16">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              目標達成を支援する
              <br />
              <span className="text-primary">マンダラチャート</span>自動生成ツール
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              AIがあなたの目標をヒアリングし、マンダラチャートを自動生成。
              さらに4象限マトリクスやフロー図へと展開し、具体的なアクションプランを提案します。
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>無料で始める</a>
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-16 text-left">
              <Card>
                <CardHeader>
                  <Grid3X3 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>マンダラチャート生成</CardTitle>
                  <CardDescription>
                    AIがヒアリングを通じて8つのカテゴリと64の具体的アクションを自動生成
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <LayoutGrid className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>4象限マトリクス</CardTitle>
                  <CardDescription>
                    重要度×緊急度でタスクを分類し、優先順位を明確化
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <GitBranch className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>フロー図生成</CardTitle>
                  <CardDescription>
                    各タスクをステップバイステップのフロー図に展開
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>
        )}

        {/* Dashboard for authenticated users */}
        {isAuthenticated && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">マイプロジェクト</h2>
              <Button asChild>
                <Link href="/project/new">
                  <Plus className="h-4 w-4 mr-2" />
                  新規プロジェクト
                </Link>
              </Button>
            </div>

            {projectsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.background}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          project.status === 'completed' ? 'bg-green-100 text-green-700' :
                          project.status === 'generating' ? 'bg-blue-100 text-blue-700' :
                          project.status === 'proposal' ? 'bg-yellow-100 text-yellow-700' :
                          project.status === 'hearing' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {project.status === 'completed' ? '完了' :
                           project.status === 'generating' ? '生成中' :
                           project.status === 'proposal' ? '提案確認' :
                           project.status === 'hearing' ? 'ヒアリング中' :
                           '下書き'}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={
                            project.status === 'completed' ? `/project/${project.id}/mandala` :
                            project.status === 'proposal' ? `/project/${project.id}/proposal` :
                            project.status === 'hearing' ? `/project/${project.id}/hearing` :
                            `/project/${project.id}/hearing`
                          }>
                            {project.status === 'completed' ? '表示' : '続ける'}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">プロジェクトがありません</h3>
                  <p className="text-muted-foreground mb-4">
                    新しいプロジェクトを作成して、目標達成への第一歩を踏み出しましょう。
                  </p>
                  <Button asChild>
                    <Link href="/project/new">
                      <Plus className="h-4 w-4 mr-2" />
                      新規プロジェクト
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          © 2026 Rashinban - マンダラマ分析ツール
        </div>
      </footer>
    </div>
  );
}
