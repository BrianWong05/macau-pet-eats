import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Plus, 
  Trash2, 
  Edit,
  Save,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { CuisineType } from '@/types/database'

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
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
        >
          <Plus size={18} />
          {t('admin.cuisineTypes.add')}
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Name (key)"
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              className="px-3 py-2 border border-neutral-200 rounded-lg"
            />
            <input
              type="text"
              placeholder="中文名稱"
              value={newForm.name_zh}
              onChange={(e) => setNewForm({ ...newForm, name_zh: e.target.value })}
              className="px-3 py-2 border border-neutral-200 rounded-lg"
            />
            <input
              type="text"
              placeholder="Nome PT"
              value={newForm.name_pt}
              onChange={(e) => setNewForm({ ...newForm, name_pt: e.target.value })}
              className="px-3 py-2 border border-neutral-200 rounded-lg"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                <Save size={18} className="mx-auto" />
              </button>
              <button
                onClick={() => { setIsAdding(false); setNewForm({ name: '', name_zh: '', name_pt: '' }) }}
                className="px-3 py-2 bg-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-300"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500">Loading...</div>
        ) : cuisineTypes.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No cuisine types</div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">Key</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">中文</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">PT</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {cuisineTypes.map((ct) => (
                <tr key={ct.id} className="hover:bg-neutral-50">
                  {editingId === ct.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-2 py-1 border border-neutral-200 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.name_zh}
                          onChange={(e) => setEditForm({ ...editForm, name_zh: e.target.value })}
                          className="w-full px-2 py-1 border border-neutral-200 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editForm.name_pt}
                          onChange={(e) => setEditForm({ ...editForm, name_pt: e.target.value })}
                          className="w-full px-2 py-1 border border-neutral-200 rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleSave(ct.id)}
                          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded ml-1"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm text-neutral-900">{ct.name}</td>
                      <td className="px-4 py-3 text-sm text-neutral-600">{ct.name_zh || '-'}</td>
                      <td className="px-4 py-3 text-sm text-neutral-600">{ct.name_pt || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(ct)}
                          className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(ct.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded ml-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
