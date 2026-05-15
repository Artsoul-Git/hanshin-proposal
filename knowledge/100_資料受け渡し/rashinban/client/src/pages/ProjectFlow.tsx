import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, GitBranch, CheckCircle } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";

interface FlowStep {
  order: number;
  title: string;
  description: string;
}

export default function ProjectFlow() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const params = useParams<{ id: string; flowId: string }>();
  const projectId = parseInt(params.id || "0");
  const flowId = parseInt(params.flowId || "0");

  const { data: project, isLoading: projectLoading } = trpc.project.get.useQuery(
    { id: projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  const { data: diagram, isLoading: diagramLoading } = trpc.flowDiagram.get.useQuery(
    { id: flowId },
    { enabled: isAuthenticated && flowId > 0 }
  );

  if (authLoading || projectLoading || diagramLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>ログインが必要です</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href={getLoginUrl()}>ログイン</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project || !diagram) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>フロー図が見つかりません</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/">ホームに戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps = diagram.steps as FlowStep[];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/project/${projectId}/mandala`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              マンダラチャートに戻る
            </Link>
          </Button>
          <h1 className="font-semibold truncate max-w-md">{diagram.title}</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container py-8 max-w-2xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              ステップバイステップ フロー図
            </CardTitle>
            <CardDescription>
              タスクを完了するための具体的なステップを順番に実行してください。
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Flow Steps */}
        <div className="space-y-0">
          {steps.map((step, index) => (
            <div key={index} className="flow-step">
              <div className="flow-step-number">{step.order}</div>
              <Card className="ml-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {/* Completion */}
          <div className="flow-step">
            <div className="flow-step-number bg-green-500">
              <CheckCircle className="h-4 w-4" />
            </div>
            <Card className="ml-2 border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-green-700">完了</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600">
                  すべてのステップを完了すると、タスクが達成されます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <Button variant="outline" asChild className="flex-1">
            <Link href={`/project/${projectId}/mandala`}>
              マンダラチャートに戻る
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/">
              ホームに戻る
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
