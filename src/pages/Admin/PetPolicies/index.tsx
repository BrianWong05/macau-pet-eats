import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Save, GripVertical, Pencil, Trash2, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { PetPolicyType } from '@/types/database'

export function AdminPetPolicies() {
  const { t } = useTranslation(['admin', 'common'])
  const [petPolicies, setPetPolicies] = useState<PetPolicyType[]>([])
  const [originalOrder, setOriginalOrder] = useState<PetPolicyType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', name_zh: '', name_pt: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', name_zh: '', name_pt: '' })

  // Check if order has changed
  const hasOrderChanged = JSON.stringify(petPolicies.map(p => p.id)) !== JSON.stringify(originalOrder.map(p => p.id))

  // Helpers
  const toTitleCase = (str: string) => {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const toSnakeCase = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
  }

  const fetchPetPolicies = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('pet_policies')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (!error && data) {
      setPetPolicies(data)
      setOriginalOrder(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchPetPolicies()
  }, [])

  const handleAdd = async () => {
    if (!newForm.name.trim()) {
      toast.error('Name is required')
      return
    }

    const maxOrder = petPolicies.length > 0 
      ? Math.max(...petPolicies.map(p => p.sort_order)) 
      : 0

    const { error } = await supabase
      .from('pet_policies')
      .insert({
        name: toSnakeCase(newForm.name),
        name_zh: newForm.name_zh.trim() || null,
        name_pt: newForm.name_pt.trim() || null,
        sort_order: maxOrder + 1
      } as never)

    if (error) {
      toast.error('Failed to add pet policy')
    } else {
      toast.success('Pet policy added')
      setNewForm({ name: '', name_zh: '', name_pt: '' })
      setIsAdding(false)
      fetchPetPolicies()
    }
  }

  const handleEdit = (pp: PetPolicyType) => {
    setEditingId(pp.id)
    setEditForm({ 
      name: toTitleCase(pp.name), // Show as Title Case for editing
      name_zh: pp.name_zh || '', 
      name_pt: pp.name_pt || '' 
    })
  }

  const handleSave = async (id: string) => {
    if (!editForm.name.trim()) {
      toast.error('Name is required')
      return
    }

    const { error } = await supabase
      .from('pet_policies')
      .update({
        name: toSnakeCase(editForm.name), // Convert back to snake_case for DB
        name_zh: editForm.name_zh.trim() || null,
        name_pt: editForm.name_pt.trim() || null
      } as never)
      .eq('id', id)

    if (error) {
      toast.error('Failed to update')
    } else {
      toast.success('Updated')
      setEditingId(null)
      fetchPetPolicies()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pet policy?')) return

    const { error } = await supabase
      .from('pet_policies')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete')
    } else {
      toast.success('Deleted')
      fetchPetPolicies()
    }
  }

  // Local reorder (doesn't save to DB)
  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    
    const reordered = [...petPolicies]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    setPetPolicies(reordered)
  }

  // Save order to database
  const handleSaveOrder = async () => {
    setIsSaving(true)
    
    let hasError = false
    for (let i = 0; i < petPolicies.length; i++) {
      const { error } = await supabase
        .from('pet_policies')
        .update({ sort_order: i + 1 } as never)
        .eq('id', petPolicies[i].id)
      
      if (error) {
        hasError = true
        break
      }
    }
    
    if (hasError) {
      toast.error('Failed to save order')
    } else {
      toast.success('Order saved')
      setOriginalOrder([...petPolicies])
    }
    setIsSaving(false)
  }

  // Reset to original order
  const handleCancelReorder = () => {
    setPetPolicies([...originalOrder])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t('admin:petPolicies.title') || 'Pet Policies'}</h1>
          <p className="text-neutral-500">{t('admin:petPolicies.subtitle') || 'Manage pet policy options'}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasOrderChanged && (
            <>
              <button
                onClick={handleCancelReorder}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                {t('common:cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-xl transition-colors"
              >
                <Save size={18} />
                {isSaving ? '...' : t('common:save') || 'Save Order'}
              </button>
            </>
          )}
          {!isAdding && !hasOrderChanged && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
            >
              <Plus size={18} />
              {t('admin:petPolicies.add') || 'Add Policy'}
            </button>
          )}
        </div>
      </div>

      {hasOrderChanged && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 text-sm">
          ⚠️ {t('admin:petPolicies.orderChanged') || 'Order has changed. Click "Save Order" to save.'}
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Name (e.g. Medium Dogs Allowed)"
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Name (中文)"
              value={newForm.name_zh}
              onChange={(e) => setNewForm({ ...newForm, name_zh: e.target.value })}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Name (Português)"
              value={newForm.name_pt}
              onChange={(e) => setNewForm({ ...newForm, name_pt: e.target.value })}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setIsAdding(false); setNewForm({ name: '', name_zh: '', name_pt: '' }) }}
              className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
            >
              {t('common:cancel') || 'Cancel'}
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg"
            >
              {t('common:save') || 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500">Loading...</div>
        ) : petPolicies.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No pet policies found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="w-10 px-4 py-3"></th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Key</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">中文</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Português</th>
                <th className="w-32 px-4 py-3 text-right text-sm font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {petPolicies.map((pp, index) => (
                <tr 
                  key={pp.id} 
                  className="border-b border-neutral-100 hover:bg-neutral-50"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('index', index.toString())}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const fromIndex = parseInt(e.dataTransfer.getData('index'))
                    handleReorder(fromIndex, index)
                  }}
                >
                  <td className="px-4 py-3 cursor-grab">
                    <GripVertical size={16} className="text-neutral-400" />
                  </td>
                  {editingId === pp.id ? (
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
                        <button onClick={() => handleSave(pp.id)} className="p-1 text-green-500 hover:bg-green-50 rounded">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1 text-neutral-500 hover:bg-neutral-100 rounded ml-1">
                          <X size={16} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-mono text-sm text-neutral-700">{toTitleCase(pp.name)}</td>
                      <td className="px-4 py-3 text-neutral-700">{pp.name_zh || '-'}</td>
                      <td className="px-4 py-3 text-neutral-700">{pp.name_pt || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleEdit(pp)} className="p-1 text-neutral-500 hover:bg-neutral-100 rounded">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(pp.id)} className="p-1 text-red-500 hover:bg-red-50 rounded ml-1">
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
