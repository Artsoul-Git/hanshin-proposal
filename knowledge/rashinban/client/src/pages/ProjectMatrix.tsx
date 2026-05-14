import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, LayoutGrid, GitBranch } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";

interface QuadrantItem {
  text: string;
  description: string;
}

interface Quadrant {
  label: string;
  items: QuadrantItem[];
}

export default function ProjectMatrix() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string; matrixId: string }>();
  const projectId = parseInt(params.id || "0");
  const matrixId = parseInt(params.matrixId || "0");

  const { data: project, isLoading: projectLoading } = trpc.project.get.useQuery(
    { id: projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  const { data: matrix, isLoading: matrixLoading } = trpc.matrix.get.useQuery(
    { id: matrixId },
    { enabled: isAuthenticated && matrixId > 0 }
  );

  const generateFlow = trpc.ai.generateFlowDiagram.useMutation({
    onSuccess: (data) => {
      toast.success("フロー図を生成しました");
      setLocation(`/project/${projectId}/flow/${data.diagram.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "フロー図の生成に失敗しました");
    },
  });

  const handleItemClick = async (quadrantIndex: number, itemText: string) => {
    await generateFlow.mutateAsync({
      matrixId,
      quadrantIndex,
      itemText,
    });
  };

  if (authLoading || projectLoading || matrixLoading) {
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

  if (!project || !matrix) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>マトリクスが見つかりません</CardTitle>
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

  const quadrants = matrix.quadrants as Quadrant[];

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
          <h1 className="font-semibold">{matrix.title}</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              4象限マトリクス
            </CardTitle>
            <CardDescription>
              項目をクリックすると、その項目のステップバイステップフロー図を生成できます。
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Axis Labels */}
        <div className="max-w-4xl mx-auto mb-4">
          <div className="flex justify-center">
            <span className="text-sm font-medium text-muted-foreground">
              ↑ {matrix.yAxisLabel}（高）
            </span>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-muted-foreground writing-mode-vertical rotate-180" style={{ writingMode: 'vertical-rl' }}>
              ← {matrix.xAxisLabel}（低）
            </div>
            
            <div className="flex-1 quadrant-grid">
              {quadrants.map((quadrant, index) => (
                <div
                  key={index}
                  className={`quadrant-cell quadrant-${index + 1}`}
                >
                  <h3 className="font-semibold text-sm mb-3">{quadrant.label}</h3>
                  <div className="space-y-2">
                    {quadrant.items.map((item, itemIndex) => (
                      <button
                        key={itemIndex}
                        onClick={() => handleItemClick(index, item.text)}
                        disabled={generateFlow.isPending}
                        className="w-full text-left p-2 rounded bg-background/50 hover:bg-background/80 transition-colors text-sm group"
                      >
                        <div className="flex items-start gap-2">
                          <span className="flex-1">{item.text}</span>
                          <GitBranch className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm font-medium text-muted-foreground writing-mode-vertical" style={{ writingMode: 'vertical-rl' }}>
              {matrix.xAxisLabel}（高） →
            </div>
          </div>
        </div>

        {/* Bottom Axis Label */}
        <div className="max-w-4xl mx-auto mt-4">
          <div className="flex justify-center">
            <span className="text-sm font-medium text-muted-foreground">
              ↓ {matrix.yAxisLabel}（低）
            </span>
          </div>
        </div>

        {/* Loading Overlay */}
        {generateFlow.isPending && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>フロー図を生成中...</span>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
