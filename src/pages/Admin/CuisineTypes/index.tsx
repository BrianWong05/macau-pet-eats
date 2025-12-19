import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { CuisineType } from '@/types/database'
import { CuisineTypeForm } from '@/components/Admin/CuisineTypes/CuisineTypeForm'
import { CuisineTypeTable } from '@/components/Admin/CuisineTypes/CuisineTypeTable'

export function AdminCuisineTypes() {
  const { t } = useTranslation(['admin'])
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([])
  const [originalOrder, setOriginalOrder] = useState<CuisineType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', name_zh: '', name_pt: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', name_zh: '', name_pt: '' })

  // Check if order has changed
  const hasOrderChanged = JSON.stringify(cuisineTypes.map(c => c.id)) !== JSON.stringify(originalOrder.map(c => c.id))

  const fetchCuisineTypes = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('cuisine_types')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (!error && data) {
      setCuisineTypes(data)
      setOriginalOrder(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchCuisineTypes()
  }, [])

  const handleAdd = async () => {
    if (!newForm.name.trim()) {
      toast.error('Name is required')
      return
    }

    const maxOrder = cuisineTypes.length > 0 
      ? Math.max(...cuisineTypes.map(c => c.sort_order)) 
      : 0

    // Title Case helper
    const toTitleCase = (str: string) => str.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')

    const { error } = await supabase
      .from('cuisine_types')
      .insert({
        name: toTitleCase(newForm.name),
        name_zh: newForm.name_zh.trim() || null,
        name_pt: newForm.name_pt.trim() || null,
        sort_order: maxOrder + 1
      } as never)

    if (error) {
      toast.error('Failed to add cuisine type')
    } else {
      toast.success('Cuisine type added')
      setNewForm({ name: '', name_zh: '', name_pt: '' })
      setIsAdding(false)
      fetchCuisineTypes()
    }
  }

  const handleEdit = (ct: CuisineType) => {
    setEditingId(ct.id)
    setEditForm({ 
      name: ct.name, 
      name_zh: ct.name_zh || '', 
      name_pt: ct.name_pt || '' 
    })
  }

  const handleSave = async (id: string) => {
    if (!editForm.name.trim()) {
      toast.error('Name is required')
      return
    }

    // Title Case helper
    const toTitleCase = (str: string) => str.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')

    const { error } = await supabase
      .from('cuisine_types')
      .update({
        name: toTitleCase(editForm.name),
        name_zh: editForm.name_zh.trim() || null,
        name_pt: editForm.name_pt.trim() || null
      } as never)
      .eq('id', id)

    if (error) {
      toast.error('Failed to update')
    } else {
      toast.success('Updated')
      setEditingId(null)
      fetchCuisineTypes()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cuisine type?')) return

    const { error } = await supabase
      .from('cuisine_types')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete')
    } else {
      toast.success('Deleted')
      fetchCuisineTypes()
    }
  }

  // Local reorder (doesn't save to DB)
  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    
    const reordered = [...cuisineTypes]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    setCuisineTypes(reordered)
  }

  // Save order to database
  const handleSaveOrder = async () => {
    setIsSaving(true)
    
    let hasError = false
    for (let i = 0; i < cuisineTypes.length; i++) {
      const { error } = await supabase
        .from('cuisine_types')
        .update({ sort_order: i + 1 } as never)
        .eq('id', cuisineTypes[i].id)
      
      if (error) {
        hasError = true
        break
      }
    }
    
    if (hasError) {
      toast.error('Failed to save order')
    } else {
      toast.success('Order saved')
      setOriginalOrder([...cuisineTypes])
    }
    setIsSaving(false)
  }

  // Reset to original order
  const handleCancelReorder = () => {
    setCuisineTypes([...originalOrder])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t('admin:cuisineTypes.title')}</h1>
          <p className="text-neutral-500">{t('admin:cuisineTypes.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasOrderChanged && (
            <>
              <button
                onClick={handleCancelReorder}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-xl transition-colors"
              >
                <Save size={18} />
                {isSaving ? '保存中...' : '保存順序'}
              </button>
            </>
          )}
          {!isAdding && !hasOrderChanged && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
            >
              <Plus size={18} />
              {t('admin:cuisineTypes.add')}
            </button>
          )}
        </div>
      </div>

      {hasOrderChanged && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 text-sm">
          ⚠️ 順序已更改，請點擊「保存順序」以保存更改
        </div>
      )}

      {isAdding && (
        <CuisineTypeForm 
          newForm={newForm}
          setNewForm={setNewForm}
          onAdd={handleAdd}
          onCancel={() => { setIsAdding(false); setNewForm({ name: '', name_zh: '', name_pt: '' }) }}
        />
      )}

      <CuisineTypeTable 
        cuisineTypes={cuisineTypes}
        isLoading={isLoading}
        editingId={editingId}
        editForm={editForm}
        setEditForm={setEditForm}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancelEdit={() => setEditingId(null)}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />
    </div>
  )
}
