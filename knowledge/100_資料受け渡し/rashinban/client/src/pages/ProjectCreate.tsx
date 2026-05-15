import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Target } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function ProjectCreate() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [title, setTitle] = useState("");
  const [background, setBackground] = useState("");
  const [targetPeriod, setTargetPeriod] = useState("");
  const [constraints, setConstraints] = useState("");

  const createProject = trpc.project.create.useMutation({
    onError: (error) => {
      toast.error(error.message || "プロジェクトの作成に失敗しました");
    },
  });

  const generateQuestions = trpc.ai.generateHearingQuestions.useMutation({
    onSuccess: (data, variables) => {
      toast.success("プロジェクトを作成しました");
      setLocation(`/project/${variables.projectId}/hearing`);
    },
    onError: (error) => {
      toast.error(error.message || "質問の生成に失敗しました");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.length < 1 || title.length > 100) {
      toast.error("テーマは1〜100文字で入力してください");
      return;
    }
    if (background.length < 10 || background.length > 2000) {
      toast.error("概要は10〜2000文字で入力してください");
      return;
    }

    try {
      const project = await createProject.mutateAsync({
        title,
        background,
        targetPeriod: targetPeriod || undefined,
        constraints: constraints || undefined,
      });

      // Generate hearing questions
      await generateQuestions.mutateAsync({ projectId: project.id });
    } catch {
      // Error handled in mutation callbacks
    }
  };

  if (authLoading) {
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
            <Target className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>
              プロジェクトを作成するにはログインしてください
            </CardDescription>
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

  const isLoading = createProject.isPending || generateQuestions.isPending;

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
        <Card>
          <CardHeader>
            <CardTitle>新規プロジェクト作成</CardTitle>
            <CardDescription>
              達成したい目標のテーマと詳細を入力してください。
              AIがヒアリングを行い、マンダラチャートを生成します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">テーマ（必須）</Label>
                <Input
                  id="title"
                  placeholder="例：1年後に英語でビジネス会話ができるようになる"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/100文字
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background">詳細な概要（必須）</Label>
                <Textarea
                  id="background"
                  placeholder="例：現在の英語レベルはTOEIC 500点程度。仕事で海外クライアントとのミーティングが増えており、1年後には通訳なしで会議に参加できるレベルを目指したい。週に使える学習時間は平日2時間、休日4時間程度。"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  rows={6}
                  maxLength={2000}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {background.length}/2000文字（最低10文字）
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetPeriod">目標期間（任意）</Label>
                <Input
                  id="targetPeriod"
                  placeholder="例：1年間、6ヶ月、2025年12月まで"
                  value={targetPeriod}
                  onChange={(e) => setTargetPeriod(e.target.value)}
                  maxLength={100}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="constraints">その他の制約条件（任意）</Label>
                <Textarea
                  id="constraints"
                  placeholder="例：予算は月3万円まで、平日は仕事があるため朝か夜のみ学習可能"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || title.length < 1 || background.length < 10}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {createProject.isPending ? "作成中..." : "質問を生成中..."}
                  </>
                ) : (
                  "ヒアリングを開始"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
