import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Grid3X3, Edit2, LayoutGrid } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation, useParams } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

interface MandalaItem {
  id: number;
  mandalaChartId: number;
  categoryIndex: number;
  itemIndex: number;
  text: string;
  description: string | null;
  priority: number | null;
  isCategory: boolean;
  isExpanded: boolean;
}

export default function ProjectMandala() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id || "0");

  const [editingItem, setEditingItem] = useState<MandalaItem | null>(null);
  const [editText, setEditText] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [expandingCategory, setExpandingCategory] = useState<number | null>(null);

  const { data: project, isLoading: projectLoading } = trpc.project.get.useQuery(
    { id: projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  const { data: chartData, isLoading: chartLoading, refetch } = trpc.mandalaChart.get.useQuery(
    { projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  const expandCategory = trpc.ai.expandMandalaCategory.useMutation({
    onSuccess: () => {
      toast.success("カテゴリを展開しました");
      refetch();
      setExpandingCategory(null);
    },
    onError: (error) => {
      toast.error(error.message || "展開に失敗しました");
      setExpandingCategory(null);
    },
  });

  const updateItem = trpc.mandalaChart.updateItem.useMutation({
    onSuccess: () => {
      toast.success("更新しました");
      refetch();
      setEditingItem(null);
    },
    onError: (error) => {
      toast.error(error.message || "更新に失敗しました");
    },
  });

  const generateMatrix = trpc.ai.generateMatrixFromMandala.useMutation({
    onSuccess: (data) => {
      toast.success("4象限マトリクスを生成しました");
      setLocation(`/project/${projectId}/matrix/${data.matrix.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "マトリクスの生成に失敗しました");
    },
  });

  const handleCellClick = async (item: MandalaItem) => {
    if (!chartData?.chart) return;

    if (item.isCategory) {
      // Check if already expanded
      const hasSubItems = chartData.items.some(
        i => i.categoryIndex === item.categoryIndex && !i.isCategory
      );

      if (!hasSubItems && !item.isExpanded) {
        // Expand category
        setExpandingCategory(item.categoryIndex);
        await expandCategory.mutateAsync({
          mandalaChartId: chartData.chart.id,
          categoryIndex: item.categoryIndex,
        });
      } else {
        // Open edit dialog
        setEditingItem(item);
        setEditText(item.text);
        setEditDescription(item.description || "");
      }
    } else {
      // Open edit dialog for sub-item
      setEditingItem(item);
      setEditText(item.text);
      setEditDescription(item.description || "");
    }
  };

  const handleGenerateMatrix = async (item: MandalaItem) => {
    if (!chartData?.chart) return;
    await generateMatrix.mutateAsync({
      mandalaChartId: chartData.chart.id,
      sourceItemId: item.id,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    await updateItem.mutateAsync({
      itemId: editingItem.id,
      text: editText,
      description: editDescription,
    });
  };

  if (authLoading || projectLoading || chartLoading) {
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

  if (!project || !chartData?.chart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>マンダラチャートが見つかりません</CardTitle>
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

  const { chart, items } = chartData;

  // Build grid data
  const categories = items.filter(i => i.isCategory);
  const getSubItems = (categoryIndex: number) => 
    items.filter(i => i.categoryIndex === categoryIndex && !i.isCategory);

  // Position mapping for 9x9 grid
  const categoryPositions = [
    { row: 1, col: 4 }, // Top center
    { row: 1, col: 7 }, // Top right
    { row: 4, col: 7 }, // Right center
    { row: 7, col: 7 }, // Bottom right
    { row: 7, col: 4 }, // Bottom center
    { row: 7, col: 1 }, // Bottom left
    { row: 4, col: 1 }, // Left center
    { row: 1, col: 1 }, // Top left
  ];

  const subItemOffsets = [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 },                        { row: 0, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
          <h1 className="font-semibold">{project.title}</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-primary" />
              マンダラチャート
            </CardTitle>
            <CardDescription>
              カテゴリをクリックして詳細項目を展開。項目をクリックして編集または4象限マトリクスを生成できます。
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Mandala Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="mandala-grid bg-card rounded-lg p-2 shadow-lg">
            {Array.from({ length: 81 }, (_, idx) => {
              const row = Math.floor(idx / 9);
              const col = idx % 9;

              // Center cell (3x3)
              if (row >= 3 && row <= 5 && col >= 3 && col <= 5) {
                if (row === 4 && col === 4) {
                  return (
                    <div
                      key={idx}
                      className="mandala-cell mandala-center"
                      style={{ gridColumn: '4 / 7', gridRow: '4 / 7' }}
                    >
                      {chart.centerTheme}
                    </div>
                  );
                }
                return null;
              }

              // Find if this cell belongs to a category or sub-item
              for (let catIdx = 0; catIdx < 8; catIdx++) {
                const catPos = categoryPositions[catIdx];
                const category = categories.find(c => c.categoryIndex === catIdx);

                // Category cell
                if (row === catPos.row && col === catPos.col) {
                  const isExpanding = expandingCategory === catIdx;
                  return (
                    <div
                      key={idx}
                      className={`mandala-cell mandala-category ${isExpanding ? 'mandala-loading' : ''}`}
                      onClick={() => category && handleCellClick(category)}
                      title={category?.description || ''}
                    >
                      {isExpanding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        category?.text || ''
                      )}
                    </div>
                  );
                }

                // Sub-item cells
                const subItems = getSubItems(catIdx);
                for (let subIdx = 0; subIdx < 8; subIdx++) {
                  const offset = subItemOffsets[subIdx];
                  if (row === catPos.row + offset.row && col === catPos.col + offset.col) {
                    const subItem = subItems.find(s => s.itemIndex === subIdx + 1);
                    if (subItem) {
                      return (
                        <div
                          key={idx}
                          className="mandala-cell mandala-item"
                          onClick={() => handleCellClick(subItem)}
                          title={subItem.description || ''}
                        >
                          {subItem.text}
                        </div>
                      );
                    } else if (category?.isExpanded || subItems.length > 0) {
                      return (
                        <div key={idx} className="mandala-cell mandala-item opacity-50">
                          -
                        </div>
                      );
                    } else {
                      return (
                        <div key={idx} className="mandala-cell mandala-empty" />
                      );
                    }
                  }
                }
              }

              return <div key={idx} className="mandala-cell mandala-empty" />;
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="max-w-4xl mx-auto mt-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary" />
                  <span>中心テーマ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'var(--mandala-category)' }} />
                  <span>カテゴリ（クリックで展開）</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'var(--mandala-item)' }} />
                  <span>詳細項目</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              {editingItem?.isCategory ? 'カテゴリを編集' : '項目を編集'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>テキスト</Label>
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label>説明</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {editingItem && !editingItem.isCategory && (
              <Button
                variant="outline"
                onClick={() => {
                  if (editingItem) handleGenerateMatrix(editingItem);
                }}
                disabled={generateMatrix.isPending}
              >
                {generateMatrix.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LayoutGrid className="h-4 w-4 mr-2" />
                )}
                4象限マトリクスを生成
              </Button>
            )}
            <Button
              onClick={handleSaveEdit}
              disabled={updateItem.isPending}
            >
              {updateItem.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
