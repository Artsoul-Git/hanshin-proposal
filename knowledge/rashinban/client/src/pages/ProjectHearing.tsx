import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, MessageCircle } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ProjectHearing() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id || "0");

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const { data: project, isLoading: projectLoading } = trpc.project.get.useQuery(
    { id: projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  const { data: questions, isLoading: questionsLoading } = trpc.hearing.getQuestions.useQuery(
    { projectId },
    { 
      enabled: isAuthenticated && projectId > 0,
      refetchInterval: (query) => {
        // Poll every 2 seconds until questions are loaded
        if (!query.state.data || query.state.data.length === 0) {
          return 2000;
        }
        return false;
      }
    }
  );

  const submitAnswers = trpc.hearing.submitAnswers.useMutation({
    onError: (error) => {
      toast.error(error.message || "回答の送信に失敗しました");
    },
  });

  const generateProposal = trpc.ai.generateMandalaProposal.useMutation({
    onSuccess: () => {
      toast.success("提案を生成しました");
      setLocation(`/project/${projectId}/proposal`);
    },
    onError: (error) => {
      toast.error(error.message || "提案の生成に失敗しました");
    },
  });

  // Initialize answers when questions load
  useEffect(() => {
    if (questions) {
      const initialAnswers: Record<number, string> = {};
      questions.forEach(q => {
        initialAnswers[q.id] = "";
      });
      setAnswers(initialAnswers);
    }
  }, [questions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questions) return;

    const answersArray = questions.map(q => ({
      questionId: q.id,
      answer: answers[q.id] || "",
    }));

    // Check if all questions are answered
    const unanswered = answersArray.filter(a => !a.answer.trim());
    if (unanswered.length > 0) {
      toast.error("すべての質問に回答してください");
      return;
    }

    try {
      await submitAnswers.mutateAsync({
        projectId,
        answers: answersArray,
      });

      await generateProposal.mutateAsync({ projectId });
    } catch {
      // Error handled in mutation callbacks
    }
  };

  if (authLoading || projectLoading || questionsLoading) {
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

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>プロジェクトが見つかりません</CardTitle>
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

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <CardTitle>質問を生成中...</CardTitle>
            <CardDescription>
              AIがヒアリング質問を作成しています。しばらくお待ちください。
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isLoading = submitAnswers.isPending || generateProposal.isPending;

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

      <main className="container py-8 max-w-2xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              AIヒアリング
            </CardTitle>
            <CardDescription>
              「{project.title}」について、いくつか質問させてください。
              回答をもとに、最適なマンダラチャートを提案します。
            </CardDescription>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <Label className="text-base font-medium">
                  Q{index + 1}. {question.question}
                </Label>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="回答を入力してください..."
                  value={answers[question.id] || ""}
                  onChange={(e) => setAnswers(prev => ({
                    ...prev,
                    [question.id]: e.target.value
                  }))}
                  rows={4}
                  disabled={isLoading}
                />
              </CardContent>
            </Card>
          ))}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {submitAnswers.isPending ? "送信中..." : "提案を生成中..."}
              </>
            ) : (
              "回答を送信して提案を生成"
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
