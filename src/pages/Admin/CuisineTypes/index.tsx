import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { CuisineType } from '@/types/database'
import { CuisineTypeForm } from '@/components/Admin/CuisineTypes/CuisineTypeForm'
import { CuisineTypeTable } from '@/components/Admin/CuisineTypes/CuisineTypeTable'

export function AdminCuisineTypes() {
  const { t } = useTranslation()
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', name_zh: '', name_pt: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', name_zh: '', name_pt: '' })

  const fetchCuisineTypes = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('cuisine_types')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (!error && data) {
      setCuisineTypes(data)
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

    const { error } = await supabase
      .from('cuisine_types')
      .insert({
        name: newForm.name.toLowerCase().trim(),
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

    const { error } = await supabase
      .from('cuisine_types')
      .update({
        name: editForm.name.toLowerCase().trim(),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t('admin.cuisineTypes.title')}</h1>
          <p className="text-neutral-500">{t('admin.cuisineTypes.subtitle')}</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
          >
            <Plus size={18} />
            {t('admin.cuisineTypes.add')}
          </button>
        )}
      </div>

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
      />
    </div>
  )
}
