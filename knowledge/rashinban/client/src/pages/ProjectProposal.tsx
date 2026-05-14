import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle, RefreshCw, Lightbulb } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";

interface Category {
  name: string;
  description: string;
}

export default function ProjectProposal() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id || "0");

  const { data: project, isLoading: projectLoading } = trpc.project.get.useQuery(
    { id: projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  const { data: proposal, isLoading: proposalLoading, refetch } = trpc.mandalaProposal.get.useQuery(
    { projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  const generateChart = trpc.ai.generateMandalaChart.useMutation({
    onSuccess: () => {
      toast.success("マンダラチャートを生成しました");
      setLocation(`/project/${projectId}/mandala`);
    },
    onError: (error) => {
      toast.error(error.message || "マンダラチャートの生成に失敗しました");
    },
  });

  const rejectProposal = trpc.mandalaProposal.reject.useMutation({
    onSuccess: () => {
      toast.info("提案を却下しました。ヒアリングに戻ります。");
      setLocation(`/project/${projectId}/hearing`);
    },
    onError: (error) => {
      toast.error(error.message || "操作に失敗しました");
    },
  });

  const regenerateProposal = trpc.ai.generateMandalaProposal.useMutation({
    onSuccess: () => {
      toast.success("新しい提案を生成しました");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "提案の再生成に失敗しました");
    },
  });

  const handleApprove = async () => {
    if (!proposal) return;
    await generateChart.mutateAsync({
      projectId,
      proposalId: proposal.id,
    });
  };

  const handleReject = async () => {
    if (!proposal) return;
    await rejectProposal.mutateAsync({ proposalId: proposal.id });
  };

  const handleRegenerate = async () => {
    await regenerateProposal.mutateAsync({ projectId });
  };

  if (authLoading || projectLoading || proposalLoading) {
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

  if (!project || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>提案が見つかりません</CardTitle>
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

  const categories = proposal.categories as Category[];
  const isLoading = generateChart.isPending || rejectProposal.isPending || regenerateProposal.isPending;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              カテゴリ提案
            </CardTitle>
            <CardDescription>
              「{project.title}」のマンダラチャートに使用する8つのカテゴリを提案します。
              内容を確認し、問題なければ承認してください。
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {categories.map((category, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <CardTitle className="text-sm">{category.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reasoning */}
        {proposal.reasoning && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm">提案の理由</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{proposal.reasoning}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleApprove}
            disabled={isLoading}
            className="flex-1"
          >
            {generateChart.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                承認してマンダラチャートを生成
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={isLoading}
          >
            {regenerateProposal.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                再生成中...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                再提案
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={handleReject}
            disabled={isLoading}
          >
            ヒアリングに戻る
          </Button>
        </div>
      </main>
    </div>
  );
}
