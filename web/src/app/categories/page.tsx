'use client';

import React, { useState } from 'react';
import { useGetCategories, useCreateCategory, useUpdateCategory, useRemoveCategory } from '../../hooks/useCategory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Category } from '@/gql/graphql';

const categoryFormSchema = z.object({
  name: z.string().min(1, 'カテゴリ名は必須です').max(50, 'カテゴリ名は50文字以内で入力してください'),
  description: z.string().max(200, '説明は200文字以内で入力してください').optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const CategoriesPage = () => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { categories, loading, error, refetch } = useGetCategories();
  const { createCategory } = useCreateCategory();
  const { updateCategory } = useUpdateCategory();
  const { removeCategory } = useRemoveCategory();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleCreate = async (values: CategoryFormValues) => {
    try {
      await createCategory({
        name: values.name,
        description: values.description || undefined,
      });
      toast.success('カテゴリが作成されました');
      form.reset();
      setShowCreateDialog(false);
      refetch();
    } catch (error) {
      toast.error('カテゴリの作成に失敗しました');
      console.error('Failed to create category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setValue('name', category.name);
    form.setValue('description', category.description || '');
    setShowEditDialog(true);
  };

  const handleUpdate = async (values: CategoryFormValues) => {
    if (!editingCategory) return;

    try {
      await updateCategory({
        id: parseInt(editingCategory.id, 10),
        name: values.name,
        description: values.description || undefined,
      });
      toast.success('カテゴリが更新されました');
      form.reset();
      setShowEditDialog(false);
      setEditingCategory(null);
      refetch();
    } catch (error) {
      toast.error('カテゴリの更新に失敗しました');
      console.error('Failed to update category:', error);
    }
  };

  const handleDelete = async (category: Category) => {
    try {
      await removeCategory(parseInt(category.id, 10));
      toast.success('カテゴリが削除されました');
      refetch();
    } catch (error) {
      toast.error('カテゴリの削除に失敗しました');
      console.error('Failed to delete category:', error);
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラーが発生しました: {error.message}</p>;

  return (
    <div>
      <Toaster position="top-center" />
      <PageHeader
        title="カテゴリ管理"
        description="経費申請で使用するカテゴリの管理"
      />
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>カテゴリ一覧</CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  新規作成
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新規カテゴリ作成</DialogTitle>
                  <DialogDescription>
                    経費申請で使用する新しいカテゴリを作成します。
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>カテゴリ名 *</FormLabel>
                          <FormControl>
                            <Input placeholder="例: 事務用品" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>説明</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="例: 文房具、事務機器など"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        キャンセル
                      </Button>
                      <Button type="submit">作成</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>カテゴリ名</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell>{new Date(category.createdAt).toLocaleDateString('ja-JP')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>カテゴリを削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                「{category.name}」を削除します。この操作は取り消せません。
                                このカテゴリが予算や経費で使用されている場合は削除できません。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(category)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                削除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">カテゴリがまだ登録されていません</p>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    最初のカテゴリを作成
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カテゴリ編集</DialogTitle>
            <DialogDescription>
              カテゴリの情報を変更します。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>カテゴリ名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="例: 事務用品" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>説明</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="例: 文房具、事務機器など"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingCategory(null);
                    form.reset();
                  }}
                >
                  キャンセル
                </Button>
                <Button type="submit">更新</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesPage;