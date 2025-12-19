import { useState } from 'react'
import { Edit, Save, Trash2, X, GripVertical } from 'lucide-react'
import type { CuisineType } from '@/types/database'

interface CuisineTypeTableProps {
  cuisineTypes: CuisineType[]
  isLoading: boolean
  editingId: string | null
  editForm: { name: string; name_zh: string; name_pt: string }
  setEditForm: (form: { name: string; name_zh: string; name_pt: string }) => void
  onEdit: (ct: CuisineType) => void
  onSave: (id: string) => void
  onCancelEdit: () => void
  onDelete: (id: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
}

export function CuisineTypeTable({
  cuisineTypes,
  isLoading,
  editingId,
  editForm,
  setEditForm,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  onReorder
}: CuisineTypeTableProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    // Add a slight delay to show the dragging state
    setTimeout(() => {
      const target = e.target as HTMLElement
      target.closest('tr')?.classList.add('opacity-50')
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement
    target.closest('tr')?.classList.remove('opacity-50')
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (index !== draggedIndex) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      {isLoading ? (
        <div className="p-8 text-center text-neutral-500">Loading...</div>
      ) : cuisineTypes.length === 0 ? (
        <div className="p-8 text-center text-neutral-500">No cuisine types</div>
      ) : (
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-2 py-3 text-left text-sm font-medium text-neutral-600 w-10"></th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">Key</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">中文</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">PT</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {cuisineTypes.map((ct, index) => (
              <tr 
                key={ct.id} 
                className={`hover:bg-neutral-50 transition-colors ${
                  dragOverIndex === index ? 'bg-primary-50 border-t-2 border-primary-500' : ''
                }`}
                draggable={editingId !== ct.id}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                {editingId === ct.id ? (
                  <>
                    <td className="px-2 py-3">
                      <span className="text-neutral-300"><GripVertical size={16} /></span>
                    </td>
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
                        onClick={() => onSave(ct.id)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded ml-1"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-2 py-3 cursor-grab active:cursor-grabbing">
                      <GripVertical size={16} className="text-neutral-400 hover:text-neutral-600" />
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-900">{ct.name}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{ct.name_zh || '-'}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{ct.name_pt || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onEdit(ct)}
                        className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(ct.id)}
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
  )
}
